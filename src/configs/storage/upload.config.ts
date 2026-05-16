import path from 'path';
import multer, { StorageEngine } from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '..', '..', 'tmp');

const rootFolder = path.resolve(__dirname, '..', '..');

interface UploadConfig {
  rootFolder: string;
  directory: string;
  storage: StorageEngine;
}

const uploadConfig: UploadConfig = {
  rootFolder: rootFolder,
  directory: tmpFolder,
  storage: multer.memoryStorage(),
};

export default uploadConfig;
