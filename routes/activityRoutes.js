const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, activityController.trackActivity);
router.get('/', authMiddleware, activityController.getActivity);

module.exports = router;
