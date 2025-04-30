const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authenticate = require('../middlewares/authMiddleware');

console.log("authenticate is:", authenticate);               // <- Add this
console.log("togglePin is:", sessionController.togglePin);   // <- Add this

router.patch('/sessions/:id/pin', authenticate, sessionController.togglePin);

// ...

router.post('/', authenticate, sessionController.createSession);
router.get('/', authenticate, sessionController.getSessions);

module.exports = router;
