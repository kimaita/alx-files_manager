const express = require('express');
const statsController = require('../controllers/AppController');
const usersController = require('../controllers/UsersController');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.get('/status', statsController.getStatus);
router.get('/stats', statsController.getStats);
router.post('/users', usersController.postNew);
router.get('/users/me', usersController.getMe);
router.get('/connect', authController.getConnect);
router.get('/disconnect', authController.getDisconnect);

module.exports = router;
