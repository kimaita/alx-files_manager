import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { hashPassword, sendError } from '../utils/utils';

const { uuid } = require('uuidv4');

exports.getConnect = async (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    sendError(res, 401, 'Unauthorized');
  }

  const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [email, pwd] = decoded.split(':');

  const user = await dbClient.getUser(email);
  if (!user || hashPassword(pwd) !== user.password) {
    sendError(res, 401, 'Unauthorized');
  }

  const token = uuid();
  const redisKey = `auth_${token}`;
  await redisClient.set(redisKey, user._id.toString(), 24 * 60 * 60);

  res.json({ token });
};

exports.getDisconnect = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) { sendError(res, 401, 'Unauthorized'); }
  const key = `auth_${token}`;

  const userID = await redisClient.get(key);
  if (!userID) { sendError(res, 401, 'Unauthorized'); }
  await redisClient.delete(key);
  res.status(204).end();
};
