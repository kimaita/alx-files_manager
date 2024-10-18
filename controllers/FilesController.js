import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { sendError } from '../utils/utils';
import getSessionUser from '../utils/auth';

const fs = require('fs').promises;

const TYPES = ['file', 'folder', 'image'];
const PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const CURSOR_SIZE = 20;

exports.postUpload = async (req, res) => {
  const file = req.body;

  getSessionUser(req.header('X-Token')).then((user) => {
    file.userId = user._id;
  }).catch((error) => {
    sendError(res, 401, error.message);
  });

  if (!file.name) {
    sendError(res, 400, 'Missing name');
  }
  if (!(file.type && TYPES.includes(file.type))) {
    sendError(res, 400, 'Missing type');
  }

  if (file.parentId) {
    dbClient.getFile({ _id: new ObjectId(file.parentId) }).then((storedFile) => {
      if (!storedFile) {
        sendError(res, 400, 'Parent not found');
        return;
      }
      if (storedFile.type !== 'folder') {
        sendError(res, 400, 'Parent is not a folder');
      }
    });
  } else { file.parentId = 0; }

  if (!file.isPublic) { file.isPublic = false; }

  if (file.type === 'folder') {
    const id = await dbClient.addFile({ ...file });
    res.status(201).json({ id, ...file });
    return;
  }

  if (!file.data) { sendError(res, 400, 'Missing data'); }

  fs.mkdir(PATH, { recursive: true }).catch((err) => {
    throw new Error(`Failed to create folder: ${err.message}`);
  });

  const filepath = `${PATH}/${uuidv4()}`;
  const decodedData = Buffer.from(file.data, 'base64').toString();

  fs.writeFile(filepath, decodedData, (err) => {
    if (err) {
      console.log(err);
    }
  });

  file.localPath = filepath;
  delete file.data;

  dbClient.addFile({ ...file }).then(() => {
    res.status(201).json({ ...file });
  });
};

exports.getShow = async (req, res) => {
  const query = {
    _id: new ObjectId(req.params.id),
  };
  getSessionUser(req.header('X-Token')).then((user) => {
    query.userId = user._id;
  }).catch((error) => {
    sendError(res, 401, error.message);
  });

  const file = await dbClient.getFile(query);
  if (!file) {
    sendError(res, 404, 'Not found');
    return;
  }
  res.json(file);
};

exports.getIndex = async (req, res) => {
  const query = {};
  getSessionUser(req.header('X-Token')).then((user) => {
    query.userId = user._id;
  }).catch((error) => {
    sendError(res, 401, error.message);
  });
  const page = Number(req.query.page) || 0;
  if ('parentId' in req.query) {
    query.parentId = req.query.parentId;
  }

  const userFiles = await dbClient.files.find(query)
    .sort({ parentId: 1 })
    .limit(CURSOR_SIZE)
    .skip(page * CURSOR_SIZE)
    .toArray();

  res.json(userFiles || []);
};
