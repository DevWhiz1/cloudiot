const Device=require('../models/Device.model');

const AddDevice = async (req, res, next) => {
    try {
        const { name,isActive } = req.body;
        if (!name) {
            return res.status(400).json({
                status: false,
                msg: "Device name is required"
            });
        }
        const device = new Device({
            name,
            isActive
        });
        const savedDevice = await device.save();

        return res.status(201).json({
            status: true,
            data: savedDevice,
            msg: "Device added successfully"
        });
    } catch (error) {
        
        return res.status(500).json({
            status: false,
            msg: "Internal server error",
            error: error.message
        });
    }
};

const getallDevices=async (req, res,next)=>{
    try{
        const data=await Device.find({})
    return res.status(200).json({
        status:true,
        data:data,
        msg:"Success"
    })
    }
    catch(error){
        return res.status(500).json({
            status:false,
            error:error.message
        })
    }
}

//entity by device id 
const getEntitiesByDeviceId = async (req, res, next) => {
    try {
        const deviceId = req.params.deviceId; // Get device ID from request params

        // Assuming each device has an `entities` field that stores the entities
        const device = await Device.findById(deviceId).populate('entities'); // Adjust this based on your schema

        if (!device) {
            return res.status(404).json({
                status: false,
                msg: "Device not found"
            });
        }

        return res.status(200).json({
            status: true,
            data: device.entities, 
            msg: "Success"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
};

const getAllDeviceswithEntities = async (req, res, next) => {
    try {
        const aggregate = [
            {
                $lookup: {
                    from: 'entities', 
                    localField: '_id', 
                    foreignField: 'device', 
                    as: 'entities' 
                }
            },
            {
                $unwind: {
                    path: '$entities',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $group: {
                    _id: {
                        deviceId: '$_id',
                        name: '$name',
                        ip: '$ip'
                    },
                    entities: {
                        $push: {
                            entityName: '$entities.entityName',
                            entityId: '$entities.entityId',
                            domain: '$entities.domain',
                            state: '$entities.state',
                            IsActive: '$entities.IsActive'
                        }
                    }
                }
            },
            {
                $project: {
                    entities: 1,
                    _id: '$_id.deviceId',
                    name: '$_id.name',
                    ip: '$_id.ip',
                }
            }
        ];

        const results = await Device.aggregate(aggregate);

        // Send the response with the aggregated data
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error in getAllDeviceswithEntities:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


module.exports={
    AddDevice,
    getallDevices,
    getAllDeviceswithEntities,
    getEntitiesByDeviceId
};
