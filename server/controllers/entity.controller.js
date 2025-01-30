const Entity=require('../models/entity.model');

const AddEntity = async (req, res, next) => {
    try {
      const { device, entityName, entityId, subscribeTopic,publishTopic, state, stateType, isActive } = req.body;
      const newEntity = new Entity({
        device,
        entityName,
        entityId,
        subscribeTopic,
        publishTopic,
        state,
        stateType,          
        isActive,
      });
  
      const savedEntity = await newEntity.save();
  console.log("Invalid state type");
      return res.status(201).json({
        status: true,
        data: savedEntity,
        msg: "Entity added successfully",
      });
    } catch (error) {
      console.error("Error:", error.message, error);
      return res.status(500).json({
        status: false,
        msg: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
// update state of entity via Mqtt server connection


const getAllEntities=async(req,res,next)=>{
    try{
    const entities=await Entity.find({})
    return res.status(200).json({
        status:true,
        data:entities,
        msg:"Success"
    })
}
catch(error){
     return res.status(500).json({
        status:false,
        error:error.message,
        msg:"Error"
     })
}
}

// get entity by device id
const getEntitiesByDeviceId = async (req, res, next) => {
    try {
        const deviceId = req.params.deviceId; // Get device ID from request params

        // Find entities where the device field matches the device ID
        const entities = await Entity.find({ device: deviceId });

        if (!entities || entities.length === 0) {
            return res.status(404).json({
                status: false,
                msg: "No entities found for this device"
            });
        }

        return res.status(200).json({
            status: true,
            data: entities, // Return the entities for the device
            msg: "Success"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
};



// Update entity state
// const updateEntityState = async (req, res) => {
//     try {
//         const { entityId, state } = req.body;

//             // Find and update the entity
//         const updatedEntity = await Entity.findOneAndUpdate(
//             { entityId: entityId },
//             { $set: { state: state } },
//             { new: true }
//         );

        
//         if (!updatedEntity) {
//             return res.status(404).json({ success: false, message: 'Entity not found' });
//         }

//         res.status(200).json({ success: true, data: updatedEntity });
//     } catch (error) {
//         console.error('Error updating entity state:', error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// };

// Update entity with new history

const updateEntityState = async (req, res) => {
    try {
        const { entityId, state } = req.body;

        // Create a new history entry
        const newHistoryEntry = {
            dateTime: new Date(), // current date and time
            value: state
        };

        // Find the entity and update both the state and push the new history entry
        const updatedEntity = await Entity.findOneAndUpdate(
            { entityId: entityId },
            {
                $set: { state: state },         
                $push: { history: newHistoryEntry } 
            },
            { new: true } 
        );

        if (!updatedEntity) {
            return res.status(404).json({ success: false, message: 'Entity not found' });
        }

        res.status(200).json({ success: true, data: updatedEntity });
    } catch (error) {
        console.error('Error updating entity state:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



//get all
const getAllEntitieswithDevices = async (req, res, next) => {
    try {
       
        const aggregate = [
            {
                $lookup: {
                    from: 'devices',   
                    localField: 'device',
                    foreignField: '_id',
                    as: 'deviceDetails'
                }
            },
            {
                $unwind: {
                    path: '$deviceDetails',
                    preserveNullAndEmptyArrays: true  
                }
            },
            {
                $project: {
                    entityName: 1,
                    entityId: 1,
                    domain: 1,
                    state: 1,
                    IsActive: 1,
                    deviceName: '$deviceDetails.name',
                    deviceIp: '$deviceDetails.ip'
                }
            }
        ];

     
        const entitiesWithDevices = await Entity.aggregate(aggregate);

     
        res.status(200).json({
            success: true,
            data: entitiesWithDevices
        });
    } catch (error) {
        next(error);  
    }
};

module.exports={
    AddEntity,
    getAllEntities,
    getAllEntitieswithDevices,
    updateEntityState,
    getEntitiesByDeviceId
};