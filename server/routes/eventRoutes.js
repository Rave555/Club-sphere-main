const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents } = require('../controllers/eventController.js');
const AuthMiddleware = require('../middleware/authMiddleware')

router.post('/create',AuthMiddleware.auth, AuthMiddleware.authorizeRoles('admin'), createEvent);
router.get('/all',AuthMiddleware.auth, getAllEvents);

module.exports = router;