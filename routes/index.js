const express = require('express');
const statsController = require('../controllers/AppController');
const usersController = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', statsController.getStatus);
router.get('/stats', statsController.getStats);
router.post('/users', usersController.postNew);

module.exports = router;
