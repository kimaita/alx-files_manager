import redisClient from '../utils/redis';
import dbClient from '../utils/db';

exports.getStatus = async (req, res) => {
  res.json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};

exports.getStats = async (req, res) => {
  res.json({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
};
