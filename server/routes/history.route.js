const express = require("express");
const router = express.Router();
const {getAllEnergyEntities,getEnergyHistory,getEnergyDataByFilter} = require("../controllers/energyHistory.controller");

router.route('/meters').get(getAllEnergyEntities);
router.route('/meters/detail/:entityId').get(getEnergyHistory);
router.route('/energy-meter-data').get(getEnergyDataByFilter);

module.exports = router;
