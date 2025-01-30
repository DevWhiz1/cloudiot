
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt:broker.hivemq.com:1883');
// const mqttClient = mqtt.connect('mqtt://192.168.100.14:1883');

// Handle connection events
mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker:broker.hivemq.com:1883');
});
mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

module.exports = mqttClient; 