const express = require('express');
const router = express.Router();
const { trackActivity, getActivity } = require('../controllers/activityController');

router.post('/', trackActivity);
router.get('/', getActivity);

module.exports = router;
