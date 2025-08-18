const express = require('express');
const router = express.Router();
const user = require('../controller/user');

router.get('/db-health', user.dbHealth);
router.post('/sign-up', user.createUser);

module.exports = router;