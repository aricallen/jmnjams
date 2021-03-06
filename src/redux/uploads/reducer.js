import { combineReducers } from 'redux';
import { Type } from './actions';
import { MetaStatus } from '../../constants/meta-status';

const initialMeta = { status: MetaStatus.INITIAL, error: null };

const one = (state = initialMeta, action) => {
  switch (action.type) {
    case Type.FETCH_ONE_REQUESTED:
    case Type.UPDATE_ONE_REQUESTED:
    case Type.DELETE_ONE_REQUESTED:
      return { ...state, status: MetaStatus.BUSY };
    case Type.FETCH_ONE_FAILED:
    case Type.UPDATE_ONE_FAILED:
    case Type.DELETE_ONE_FAILED:
      return { ...state, error: action.error, status: MetaStatus.ERRORED };
    case Type.FETCH_ONE_SUCCEEDED:
    case Type.UPDATE_ONE_SUCCEEDED:
    case Type.DELETE_ONE_SUCCEEDED:
      return { ...state, status: MetaStatus.RESOLVED };
    default:
      return { ...state };
  }
};

const many = (state = initialMeta, action) => {
  switch (action.type) {
    case Type.FETCH_MANY_REQUESTED:
    case Type.CREATE_MANY_REQUESTED:
      return { ...state, status: MetaStatus.BUSY };
    case Type.FETCH_MANY_FAILED:
    case Type.CREATE_MANY_FAILED:
      return { ...state, error: action.error, status: MetaStatus.ERRORED };
    case Type.FETCH_MANY_SUCCEEDED:
    case Type.CREATE_MANY_SUCCEEDED:
      return { ...state, status: MetaStatus.RESOLVED };
    default:
      return { ...state };
  }
};

const meta = combineReducers({ one, many });

const initialData = [];

const replaceOrAddOne = (allUploads, newUpload = {}) => {
  if (allUploads.length === 0) {
    return [newUpload];
  }

  // contains stale record
  if (allUploads.some((u) => u.id === newUpload.id)) {
    return allUploads.map((upload) => (upload.id === newUpload.id ? newUpload : upload));
  }

  // new record
  return [...allUploads, newUpload];
};

const data = (state = initialData, action) => {
  switch (action.type) {
    case Type.FETCH_MANY_SUCCEEDED:
      return action.uploads;
    case Type.FETCH_ONE_SUCCEEDED:
    case Type.UPDATE_ONE_SUCCEEDED:
      return replaceOrAddOne(state, action.upload);
    case Type.DELETE_ONE_SUCCEEDED:
      return state.filter((item) => item.id !== action.id);
    case Type.CREATE_MANY_SUCCEEDED:
      return [...state, ...(action.uploads || [])];
    default:
      return state;
  }
};

export const uploads = combineReducers({ meta, data });
