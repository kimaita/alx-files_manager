const express = require('express');
const statsController = require('../controllers/AppController');

const router = express.Router();

router.get('/status', statsController.getStatus);
router.get('/stats', statsController.getStats);

module.exports = router;
