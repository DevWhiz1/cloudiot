const mongoose = require("mongoose");
const EntityHistory = require("../models/entityHistory.model");
const Entity = require("../models/entity.model");
const Device = require("../models/Device.model");

const getAllEnergyEntities = async (req, res) => {
  try {
    const result = await Entity.aggregate([
      {
        $match: { stateType: "sensor", entityName: /PZEM-004T V3 Energy/i },
      },
      {
        $lookup: {
          from: "devices",
          localField: "device",
          foreignField: "_id",
          as: "deviceInfo",
        },
      },
      {
        $unwind: "$deviceInfo",
      },
      {
        $project: {
          _id: 1,
          entityName: 1,
          deviceName: "$deviceInfo.name",
          entityId: 1,
          state: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get history with device name, entity state, and history data
// const getEnergyHistory = async (req, res) => {
//     try {
//       const { entityId } = req.params; // Extract entityId from request parameters
  
//       if (!entityId) {
//         return res.status(400).json({ error: 'Entity ID is required.' });
//       }
  
//       const data = await EntityHistory.aggregate([
//         {
//           $match: { entityId }, // Filter by specific entityId
//         },
//         {
//           $lookup: {
//             from: 'entities', // Link with the entities collection
//             localField: 'entityId',
//             foreignField: '_id',
//             as: 'entityDetails',
//           },
//         },
//         { $unwind: '$entityDetails' }, // Flatten the array from $lookup
//         {
//           $lookup: {
//             from: 'devices', // Link with the devices collection
//             localField: 'entityDetails.device',
//             foreignField: '_id',
//             as: 'deviceDetails',
//           },
//         },
//         { $unwind: '$deviceDetails' }, // Flatten the array from $lookup
//         {
//           $project: {
//             _id: 1,
//             entityId: '$entityId',
//             entityName: '$entityDetails.entityName',
//             deviceName: '$deviceDetails.name',
//             history: 1, // Include the history field
//           },
//         },
//       ]);
  
//     //   if (data.length === 0) {
//     //     return res.status(404).json({ error: 'No history found for the given entity ID.' });
//     //   }
  
//       res.status(200).json(data);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  
  const getEnergyHistory = async (req, res) => {
    const { entityId } = req.params;

    try {
        const entityHistory = await EntityHistory.findOne({ entityId }).select('history');

        if (!entityHistory) {
            return res.status(404).json({ error: 'Entity history not found' });
        }

        res.status(200).json(entityHistory.history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
  
  
module.exports =  
{getEnergyHistory, 
getAllEnergyEntities
};


