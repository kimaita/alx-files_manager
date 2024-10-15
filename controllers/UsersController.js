import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { hashPassword, sendError } from '../utils/utils';

exports.postNew = async (req, res) => {
  if (!req.body) { sendError(res, 'Missing email'); }
  if (!('email' in req.body)) { sendError(res, 400, 'Missing email'); }
  if (!('password' in req.body)) { sendError(res, 400, 'Missing password'); }

  const user = {
    email: req.body.email,
    password: hashPassword(req.body.password),
  };

  try {
    const id = await dbClient.addUser(user);
    res.status(201).json({ id, email: user.email });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.getMe = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) { sendError(res, 401, 'Unauthorized'); }
  const userID = await redisClient.get(`auth_${token}`);
  if (!userID) { sendError(res, 401, 'Unauthorized'); }

  const user = await dbClient.getUser({ _id: new ObjectId(userID) });
  res.json({ id: user._id, email: user.email });
};
