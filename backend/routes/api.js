const express = require('express');
const router = express.Router();
const user = require('../controller/user');
const createProperty = require('../controller/createProperty');

router.post('/property-by-user',createProperty.propertyByUser)

module.exports = router;