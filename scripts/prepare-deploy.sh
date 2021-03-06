BUILD_DIR="build"
PS4='$LINENO: '
set -x
rm -rf $BUILD_DIR
mkdir $BUILD_DIR
# setup static assets
rsync -arvz --exclude "uploads/*" src/assets dist/
cp -R src/styles dist/
# build dir for deploying
cp -R server $BUILD_DIR/
cp -R dist $BUILD_DIR/src
cp Procfile $BUILD_DIR/
cp src/robots.txt $BUILD_DIR/src/
cp src/sitemap.xml $BUILD_DIR/src/
cp scripts/_package.json $BUILD_DIR/package.json
set +x