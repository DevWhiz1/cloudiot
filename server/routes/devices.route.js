const express = require("express");
const router = express.Router();

const { AddDevice,getallDevices, getAllDeviceswithEntities,getEntitiesByDeviceId } = require("../controllers/device.controller");
// Add Device 
router.route("/add").post(AddDevice);
// Get Device
router.route("/getall").get(getallDevices);
// get with entities
router.route("/devicewithentities").get(getAllDeviceswithEntities);
router.route("/get/:id").get(getEntitiesByDeviceId);
module.exports = router;