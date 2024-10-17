import dbClient from '../utils/db';
import { hashPassword, sendError } from '../utils/utils';
import getSessionUser from '../utils/auth';

exports.postNew = async (req, res) => {
  if (!req.body) { sendError(res, 'Missing email'); }
  if (!('email' in req.body)) { sendError(res, 400, 'Missing email'); }
  if (!('password' in req.body)) { sendError(res, 400, 'Missing password'); }

  const user = {
    email: req.body.email,
    password: hashPassword(req.body.password),
  };

  dbClient.addUser(user).then((id) => {
    res.status(201).json({ id, email: user.email });
  }).catch((error) => {
    sendError(res, 400, error.message);
  });
};

exports.getMe = async (req, res) => {
  getSessionUser(req.header('X-Token')).then((user) => {
    res.json({ id: user._id, email: user.email });
  }).catch((error) => {
    sendError(res, 401, error.message);
  });
};
