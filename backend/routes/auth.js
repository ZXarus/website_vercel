const express = require('express');
const router = express.Router();
const user = require('../controller/user');
const userLogin = require("../controller/signIn")

router.get('/db-health', user.dbHealth);
router.post('/sign-up', user.createUser);
router.post('/sign-in',userLogin.signInUser);

module.exports = router;