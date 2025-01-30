import mqtt from 'mqtt';

const createMQTTClient = () => {
  const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
    clean: true,
    reconnectPeriod: 1000, // Reconnect every second if disconnected
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
  });

  client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
    client.end();
  });

  return client;
};

export default createMQTTClient;
