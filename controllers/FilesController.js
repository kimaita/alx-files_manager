import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { sendError } from '../utils/utils';
import getSessionUser from '../utils/auth';

const fs = require('fs');

const TYPES = ['file', 'folder', 'image'];
const PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

exports.postUpload = async (req, res) => {
  let user;
  try {
    user = await getSessionUser(req.header('X-Token'));
  } catch (error) {
    sendError(res, 401, error.message);
  }

  const file = req.body;
  file.userId = user._id;

  if (!file.name) {
    sendError(res, 400, 'Missing name');
  }
  if (!(file.type && TYPES.includes(file.type))) {
    sendError(res, 400, 'Missing type');
  }

  if (file.parentId) {
    const storedFile = await dbClient.getFile({ _id: new ObjectId(file.parentId) });
    if (!storedFile) {
      sendError(res, 400, 'Parent not found');
      return;
    }
    if (storedFile.type !== 'folder') {
      sendError(res, 400, 'Parent is not a folder');
      return;
    }
  } else { file.parentId = 0; }

  if (!file.isPublic) { file.isPublic = false; }

  if (file.type === 'folder') {
    const id = await dbClient.addFile({ ...file });
    res.status(201).json({ id, ...file });
    return;
  }

  if (!file.data) { sendError(res, 400, 'Missing data'); }

  fs.mkdir(PATH, { recursive: true }, (err) => {
    if (err) throw err;
  });

  const filepath = `${PATH}/${uuidv4()}`;
  const decodedData = Buffer.from(file.data, 'base64').toString();

  fs.writeFile(filepath, decodedData, (err) => {
    if (err) {
      console.log(err);
    }
  });

  file.localPath = filepath;

  dbClient.addFile({ ...file }).then(() => {
    const returnObj = { ...file };
    delete returnObj.data;
    res.status(201).json(returnObj);
  });
};
