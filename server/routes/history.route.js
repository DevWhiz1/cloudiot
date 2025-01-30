const express = require("express");
const router = express.Router();
const {getAllEnergyEntities,getEnergyHistory} = require("../controllers/energyHistory.controller");

router.route('/meters').get(getAllEnergyEntities);
router.route('/meters/detail/:entityId').get(getEnergyHistory);

module.exports = router;
