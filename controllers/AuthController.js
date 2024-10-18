import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { hashPassword, sendError } from '../utils/utils';
import getSessionUser from '../utils/auth';

exports.getConnect = async (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    sendError(res, 401, 'Unauthorized');
    return;
  }

  const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [email, pwd] = decoded.split(':');

  const user = await dbClient.getUser({ email });
  if (!user || hashPassword(pwd) !== user.password) {
    sendError(res, 401, 'Unauthorized');
    return;
  }

  const token = uuidv4();
  const redisKey = `auth_${token}`;
  await redisClient.set(redisKey, user._id.toString(), 24 * 60 * 60);

  res.json({ token });
};

exports.getDisconnect = async (req, res) => {
  const token = req.header('X-Token');
  const key = `auth_${token}`;

  getSessionUser(token).catch((error) => {
    sendError(res, 401, error.message);
  });

  await redisClient.delete(key);
  res.status(204).end();
};
