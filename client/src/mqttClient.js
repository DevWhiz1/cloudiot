import mqtt from 'mqtt';

let client;

export const connectMQTT = (brokerUrl, options) => {
  if (!client) {
    client = mqtt.connect(brokerUrl, options);
  }
  return client;
};

export const getClient = () => {
  if (!client) {
    throw new Error("MQTT client is not initialized. Call connectMQTT first.");
  }
  return client;
};

export const disconnectMQTT = () => {
  if (client) {
    client.end(true);
    client = null;
  }
};
