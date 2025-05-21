const mqtt = require('mqtt');

// Define MQTT broker connection options
const options = {
    clientId: 'nodejs_mqtt01',
    username: 'mqtt',   
    password: 'iot199920', 
    // username: 'CloudIotAutomation',   
    // password: 'CloudIotAutomation1710',  
    //     username: 'cloudservicesiotserv',   
    // password: 'authCloudAutomationB17', 
};


// const mqttClient = mqtt.connect('mqtt://node02.myqtthub.com:1883', options);
// 182.180.50.59
const mqttClient = mqtt.connect('mqtt://182.180.50.59:1883', options);
// Handle connection events
mqttClient.on('connect', () => {
    console.log(`Connected to MQTT Broker as client: ${options.clientId}`);
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

module.exports = mqttClient;
