const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticate = require('../middlewares/authMiddleware');

// Protected Routes
router.post('/', authenticate, messageController.sendMessage);
router.get('/:sessionId', authenticate, messageController.getMessages);

module.exports = router;
