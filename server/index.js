require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db/connect');
const mqttClient = require('./mqtt/mqttClient');
const { Server } = require('socket.io');
// const fs = require('fs');
// const https = require('https');
const http = require('http');
const Entity = require('./models/entity.model');
const {energyRawHistoryController} = require('./controllers/energyMeterRawHistory.controller');
const { scheduleAggregations } = require("./DbScheduling/energyAggregator");
const mongodb_Url = process.env.MONGO_URI;
const app = express();
// Middleware

const corsOptions = {
    origin: "https://cloudiot-automation.vercel.app",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, 
};

// app.use(cors(corsOptions));
app.use(cors());
// Read self-signed certs
// const credentials = {
//   key: fs.readFileSync('./certs/private.key', 'utf8'),
//   cert: fs.readFileSync('./certs/certificate.crt', 'utf8'),
//   ca: fs.readFileSync('./certs/ca_bundle.crt', 'utf8')
// };
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const entityRoutes = require('./routes/entity.route');
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/devices.route');
const automationRoutes = require('./routes/automation.route');
const entityHistoryModel = require('./models/entityHistory.model');
const EntityHistory= require("./routes/history.route");
const AirconditionerRoutes = require("./routes/airConditioner.route")
const entityHistoryRoutes = require("./routes/entityHistory.route")
const wmsRoutes= require("./routes/wms.route")
app.use('/user', userRoutes);
app.use('/device', deviceRoutes);
app.use('/entity', entityRoutes);
app.use('/automation', automationRoutes);
app.use('/energy', EntityHistory);
app.use("/ac", AirconditionerRoutes);
app.use("/entity",entityHistoryRoutes);
app.use("/wms",wmsRoutes);

app.get('/', (req, res) => { res.status(200).json({message:"Server is running"})})
// Start server
const port = process.env.PORT || 5000;
const dbConnectionString = mongodb_Url;

const start = async () => {
    try {
        await connectDB(dbConnectionString);
        console.log('Connected to database');
scheduleAggregations();
        const server = http.createServer(app);
        // const server = https.createServer(credentials, app);
        
        const io = new Server(server, {
            cors: {
                origin: "*", 
            },
        });

        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });

        // Fetch all active entities from the database and subscribe to their MQTT topics
        // const entities = await Entity.find({ isActive: true });
         const entities = await Entity.find({ isActive: true, entityName: {
    $nin: [
        "PZEM-004T V3 Current",
        "PZEM-004T V3 Voltage",
        "PZEM-004T V3 Power",
        "PZEM-004T V3 Frequency",
        "PZEM-004T V3 Power Factor"
    ]
} });
        entities.forEach((entity) => {
            mqttClient.subscribe(entity.subscribeTopic, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to ${entity.subscribeTopic}:`, err);
                } else {
                    console.log(`Subscribed to topic: ${entity.subscribeTopic}`);
                }
            });
        });

        io.on('connection', async (socket) => {
            console.log(`New WebSocket client connected: ${socket.id}`);        
            try {
                // Fetch all entities grouped by devices
     const entities = await Entity.find({ isActive: true }).populate('device', 'name isActive');
                // exclude entitties whos devices is inactive
                const filteredEntities = entities.filter(entity => entity.device && entity.device.isActive);
                const groupedEntities = filteredEntities.reduce((groups, entity) => {
                    if (!entity.device) {
                        console.warn(`Entity with ID ${entity._id} does not have an associated device`);
                        return groups;
                    }
                
                    const deviceId = entity.device.toString();
                
                    if (!groups[deviceId]) {
                        groups[deviceId] = {
                            deviceId: entity.device._id,
                            deviceName: entity.device.name,
                            // isActive: entity.device.isActive,
                            entities: [],
                        };
                    }
                    groups[deviceId].entities.push({
                        _id: entity._id,
                        entityName: entity.entityName,
                        entityId: entity.entityId,
                        subscribeTopic: entity.subscribeTopic,
                        publishTopic: entity.publishTopic,
                        stateType: entity.stateType,
                        state: entity.state,
                        // history: entity.history,
                    });
                    return groups;
                }, {});
                
        
                // Send grouped entities to the client
                socket.emit('initial_state', { devices: Object.values(groupedEntities) });
        
                // console.log('Sent grouped entities to the client',groupedEntities);
            } catch (error) {
                console.error('Error fetching initial state:', error);
            }
        
            // Handle state change requests
            socket.on('state_change', async ({ publishTopic, state }) => {
                try {
                    console.log(`Received state change request for topic: ${publishTopic}, state: ${state}`);
        
                    const entity = await Entity.findOne({ publishTopic });
                    const stateString = typeof state === 'number' ? state.toString() : state;
                    if (entity) {
                        // Publish new state to MQTT topic
                        mqttClient.publish(publishTopic, stateString, (err) => {
                            if (err) {
                                console.error('Failed to publish MQTT message:', err);
                            } else {
                                // console.log(`Published new state to topic ${publishTopic}: ${state}`);
                            }
                        });
        
                        // Update the entity state in the database
                    //     entity.state = state;
                    //     entity.updatedAt = new Date();
                    //     await entity.save();
        
                    //    // Broadcast updated state to all clients
                    //     io.emit('state_update', {
                    //         deviceId: entity.device,
                    //         entityId: entity._id,
                    //         state,
                    //     });
                    }
                } catch (error) {
                    console.error('Error handling state change:', error);
                }
            });
        
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
        
        

        // Listen for MQTT messages and update React clients
        mqttClient.on('message', async (topic, message) => {
            try {
                const entity = await Entity.findOne({ subscribeTopic: topic });
                if (entity) {
                    // Update the entity's state in the database
                    const newState = message.toString();
                    entity.state = newState;
                    // entity.updatedAt = new Date();
                    // await entity.save();
        
                    console.log(`Updated state for entity ${entity.entityName} (${entity._id}): ${newState}` );
        
                    // Update or create entity history
                    try {
                        const entityId = entity._id; // Fetch the entity's Id
                        const deviceId = entity.device; 
                        let entityHistory = await entityHistoryModel.findOne({ entityId });
        
                        if (entityHistory) {
                            // Push a new history entry
                            entityHistory.history.push({ value: newState, time: new Date() });
                        
                            await entityHistory.save();
                            await energyRawHistoryController(entity, entityId, deviceId, newState);
                        } else {
                            // Create a new entity history document if it doesn't exist
                            entityHistory = new entityHistoryModel({
                                entityId: entityId,
                                deviceId: deviceId,
                                history: [{ value: newState, time: new Date() }],
                            });
                            await entityHistory.save();
                            await energyRawHistoryController(entity, entityId, deviceId, newState);
                        }
        
                        console.log(`Updated history for entity ${entity.entityName} (${entity._id}) with device (${deviceId}).`);
                    } catch (historyError) {
                        console.error('Error updating entity history:', historyError);
                    }
        
                    // Broadcast the updated state to all WebSocket clients
                    io.emit('state_update', {
                        deviceId: entity.device,
                        entityId: entity._id,
                        state: newState,
                    });
                } else {
                    console.warn(`No entity found for topic: ${topic}`);
                }
            } catch (error) {
                console.error('Error handling MQTT message:', error);
            }
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};
start();
module.exports = app;


// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const connectDB = require('./db/connect');
// const mqttClient = require('./mqtt/mqttClient');
// const { Server } = require('socket.io');
// const http = require('http');
// const Entity = require('./models/entity.model'); // Entity model for DB interaction
// const entityHistoryModel = require('./models/entityHistory.model');

// const mongodb_Url = process.env.MONGO_URI;
// const port = process.env.PORT || 5000;
// const app = express();

// // Middleware
// const corsOptions = {
//     origin: "https://cloudiot-automation-ad8hyaue4.vercel.app",
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true, 
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Routes
// app.use('/user', require('./routes/user'));
// app.use('/device', require('./routes/devices.route'));
// app.use('/entity', require('./routes/entity.route'));
// app.use('/automation', require('./routes/automation.route'));
// app.use('/energy', require('./routes/history.route'));
// app.use('/ac', require('./routes/airConditioner.route'));

// const start = async () => {
//     try {
//         await connectDB(mongodb_Url);
//         console.log('✅ Connected to database');

//         const server = http.createServer(app);
//         const io = new Server(server, {
//             cors: {
//                 origin: "*",
//             },
//         });

//         server.listen(port, () => {
//             console.log(`🚀 Server is running on port ${port}`);
//         });

//         // Fetch and subscribe to active entity topics
//         const entities = await Entity.find({ isActive: true });
//         entities.forEach((entity) => {
//             mqttClient.subscribe(entity.subscribeTopic, (err) => {
//                 if (err) {
//                     console.error(`❌ Failed to subscribe to ${entity.subscribeTopic}:`, err);
//                 } else {
//                     console.log(`📡 Subscribed to topic: ${entity.subscribeTopic}`);
//                 }
//             });
//         });

//         io.on('connection', async (socket) => {
//             console.log('🔗 New WebSocket client connected');

//             try {
//                 const entities = await Entity.find({ isActive: true }).populate('device', 'name');
//                 const groupedEntities = entities.reduce((groups, entity) => {
//                     if (!entity.device) {
//                         console.warn(`⚠️ Entity ${entity._id} has no associated device`);
//                         return groups;
//                     }

//                     const deviceId = entity.device._id.toString();
//                     if (!groups[deviceId]) {
//                         groups[deviceId] = {
//                             deviceId: entity.device._id,
//                             deviceName: entity.device.name,
//                             entities: [],
//                         };
//                     }
//                     groups[deviceId].entities.push({
//                         _id: entity._id,
//                         entityName: entity.entityName,
//                         entityId: entity.entityId,
//                         subscribeTopic: entity.subscribeTopic,
//                         publishTopic: entity.publishTopic,
//                         stateType: entity.stateType,
//                         state: entity.state,
//                     });
//                     return groups;
//                 }, {});

//                 socket.emit('initial_state', { devices: Object.values(groupedEntities) });
//                 console.log('📤 Sent grouped entities to the client');
//             } catch (error) {
//                 console.error('❌ Error fetching initial state:', error);
//             }

//             socket.on('state_change', async ({ publishTopic, state }) => {
//                 try {
//                     console.log(`🔄 State change request for ${publishTopic}: ${state}`);

//                     const entity = await Entity.findOne({ publishTopic });
//                     if (entity) {
//                         const stateString = typeof state === 'number' ? state.toString() : state;

//                         mqttClient.publish(publishTopic, stateString, (err) => {
//                             if (err) {
//                                 console.error('❌ MQTT Publish Failed:', err);
//                             } else {
//                                 console.log(`✅ Published state to ${publishTopic}: ${state}`);
//                             }
//                         });
//                     }
//                 } catch (error) {
//                     console.error('❌ Error handling state change:', error);
//                 }
//             });

//             socket.on('disconnect', () => {
//                 console.log('🔌 Client disconnected');
//             });
//         });

//         // MQTT Message Handling
//         mqttClient.on('message', async (topic, message) => {
//             try {
//                 const entity = await Entity.findOne({ subscribeTopic: topic });
//                 if (entity) {
//                     const newState = message.toString();
//                     entity.state = newState;
//                     entity.updatedAt = new Date();
//                     await entity.save();
//                     console.log(`✅ Updated entity state: ${entity.entityName} → ${newState}`);

//                     // Update or create entity history
//                     let entityHistory = await entityHistoryModel.findOne({ entityId: entity._id });
//                     if (entityHistory) {
//                         entityHistory.history.push({ value: newState, time: new Date() });
//                         await entityHistory.save();
//                     } else {
//                         entityHistory = new entityHistoryModel({
//                             entityId: entity._id,
//                             deviceId: entity.device,
//                             history: [{ value: newState, time: new Date() }],
//                         });
//                         await entityHistory.save();
//                     }

//                     console.log(`📜 Entity history updated for ${entity.entityName}`);

//                     // Broadcast updated state to clients
//                     io.emit('state_update', {
//                         deviceId: entity.device,
//                         entityId: entity._id,
//                         state: newState,
//                     });
//                 } else {
//                     console.warn(`⚠️ No entity found for topic: ${topic}`);
//                 }
//             } catch (error) {
//                 console.error('❌ Error handling MQTT message:', error);
//             }
//         });

//     } catch (error) {
//         console.error('❌ Server start failed:', error);
//     }
// };

// start();
// module.exports = app;
