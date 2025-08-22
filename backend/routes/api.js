const express = require('express');
const router = express.Router();
const user = require('../controller/user');
const property = require('../controller/property');
const userFavProperties = require('../controller/user_favorites')

router.post('/property-by-user',property.createProperty)
router.post('/favorites',userFavProperties.userFavProp)

module.exports = router;