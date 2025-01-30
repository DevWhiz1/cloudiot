const express = require('express');
const router = express.Router();
const {saveAcData, getAllAc} = require('../controllers/airConditioner.controller');

router.route("/addnew").post(saveAcData);
router.route("/get/allac").get(getAllAc);

module.exports = router;