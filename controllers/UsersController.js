import dbClient from '../utils/db';

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha1').update(password).digest('hex');
}

function sendError(res, message) {
  return res.status(400).json({ error: message });
}

exports.postNew = async (req, res) => {
  if (!req.body) { sendError(res, 'Missing email'); }
  if (!('email' in req.body)) { sendError(res, 'Missing email'); }
  if (!('password' in req.body)) { sendError(res, 'Missing password'); }

  const user = {
    email: req.body.email,
    password: hashPassword(req.body.password),
  };

  try {
    const id = await dbClient.addUser(user);
    res.status(201).json({ id, email: user.email });
  } catch (error) {
    sendError(res, error.message);
  }
};
