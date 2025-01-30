const express = require('express');
const router = express.Router();
const { AddEntity, getAllEntities, getAllEntitieswithDevices, updateEntityState,getEntitiesByDeviceId } = require('../controllers/entity.controller');

// Define routes
router.route('/add').post(AddEntity);
router.route('/get').get(getAllEntities);
router.route('/getentities').get(getAllEntitieswithDevices);
router.route('/state').post(updateEntityState);
router.route('/get/:deviceId').get(getEntitiesByDeviceId);
module.exports = router;
