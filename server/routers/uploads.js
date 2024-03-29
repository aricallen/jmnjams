const express = require('express');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const multer = require('multer');
const { promisify } = require('util');
const { createGetController, createGetOneController } = require('../utils/api-helpers');
const { sizes } = require('../constants');
const {
  getConnection,
  upsertRecord,
  updateRecord,
  getRecord,
  deleteRecord,
} = require('../utils/db-helpers');

const router = express.Router();
// dir for frontend app
const APP_DIR = 'src';
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', APP_DIR, 'assets', 'uploads');
const TEMP_DIR = path.resolve(UPLOADS_DIR, '.tmp');
const uploader = multer({ dest: UPLOADS_DIR });
const SMALL_DIR = path.join(UPLOADS_DIR, 'small');
const MEDIUM_DIR = path.join(UPLOADS_DIR, 'medium');
const LARGE_DIR = path.join(UPLOADS_DIR, 'large');
const RAW_DIR = path.join(UPLOADS_DIR, 'raw');

const pUnlink = promisify(fs.unlink);
const pRename = promisify(fs.rename);

const safeMakeDir = (dirPath) => {
  try {
    fs.statSync(dirPath);
  } catch (err) {
    fs.mkdirSync(dirPath);
  }
};

const configs = [
  {
    dir: SMALL_DIR,
    width: sizes.thumbnailWidth,
  },
  {
    dir: MEDIUM_DIR,
    width: sizes.phoneWidth,
  },
  {
    dir: LARGE_DIR,
    width: sizes.tabletWidth,
  },
  {
    dir: RAW_DIR,
    width: null,
  },
];

/**
 * folder structure
 * server/uploads
 * |- small
 * |- medium
 * |- large
 * |- raw
 */
const makeDirStructure = () => {
  safeMakeDir(UPLOADS_DIR);
  safeMakeDir(TEMP_DIR);
  configs.forEach((config) => safeMakeDir(config.dir));
};
makeDirStructure();

const processFile = async (options) => {
  const { src, dest, width, height = Jimp.AUTO } = options;
  const image = await Jimp.read(src);
  console.log(`read file from ${src}`);
  if (width) {
    await image.resize(width, height);
  }
  await image.writeAsync(dest);
  console.log(`processed image and moved to: ${dest}`);
};

/**
 * - create small, medium, large versions
 * - move each version to respective dirs
 * - update DB with new metadata
 */
const processFileUpload = async (file) => {
  const baseOptions = { src: file.path, height: Jimp.AUTO, quality: 0.75 };
  const promises = configs.map((config) => {
    return processFile({
      ...baseOptions,
      dest: path.join(config.dir, file.originalname),
      width: config.width,
    });
  });
  await Promise.all(promises);

  // remove file from tmp
  fs.unlinkSync(file.path);

  try {
    // update db
    const conn = await getConnection();
    const record = await upsertRecord(
      conn,
      'uploads',
      {
        filename: file.originalname,
        title: file.originalname,
        altText: file.originalname,
        caption: file.originalname,
      },
      'filename'
    );
    return record;
  } catch (err) {
    if (err.fatal) {
      await getConnection();
    }
  }
};

router.post('/', uploader.array('uploads', { dest: TEMP_DIR }), async (req, res) => {
  const { files } = req;
  if (!files || files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const processedPromises = files.map(processFileUpload);
  try {
    const fileRecords = await Promise.all(processedPromises);
    res.send({
      uploads: fileRecords,
    });
  } catch (err) {
    res.status(400).send({
      error: err,
      message: 'error while attempting to upload files',
    });
  }
});

router.get('/:resourceId', createGetOneController('uploads'));
router.get('/', createGetController('uploads'));

/**
 * update db record
 * rename files in each dir
 */
router.put('/:resourceId', async (req, res) => {
  const { resourceId } = req.params;
  const values = req.body;
  const conn = await getConnection();
  const oldRecord = await getRecord(conn, 'uploads', resourceId);
  const updatedRecord = await updateRecord(conn, 'uploads', resourceId, values);

  if (oldRecord.filename === values.filename) {
    return res.send({ data: updatedRecord });
  }

  // update file names
  const promises = configs.map((config) => {
    const oldPath = path.join(config.dir, oldRecord.filename);
    const newPath = path.join(config.dir, values.filename);
    if (fs.existsSync(newPath)) {
      throw new Error(`A file with name ${values.filename} already exists`);
    }
    return pRename(oldPath, newPath);
  });

  try {
    await Promise.all(promises);
    res.send({ data: updatedRecord });
  } catch (err) {
    if (err.fatal) {
      await getConnection();
    }
    res.status(400).send({
      error: err,
      message: `Error while trying to update ${oldRecord.filename}`,
    });
  }
});

/**
 * remove file from each dir
 * remove record from db
 */
router.delete('/:resourceId', async (req, res) => {
  const { resourceId } = req.params;
  const conn = await getConnection();
  const oldRecord = await getRecord(conn, 'uploads', resourceId);

  if (!oldRecord) {
    res.status(404).send();
  }

  try {
    // remove record from db
    const deletedRecord = await deleteRecord(conn, 'uploads', resourceId);

    // remove files
    const promises = configs.map((config) => {
      return pUnlink(path.join(config.dir, oldRecord.filename));
    });

    await Promise.all(promises);
    res.send({ data: deletedRecord });
  } catch (err) {
    if (err.fatal) {
      await getConnection();
    }
    res.status(400).send({
      error: err,
      message: `Error while trying to delete ${oldRecord.filename}`,
    });
  }
});

module.exports = { router };
