import { createMachine, createActor } from 'xstate';
import axios from 'axios';

// Example function to get the device entity
const findDeviceEntity = (device, entityId) => {
  return device.entities.find(entity => entity.entityId === entityId);
};

// Define the state machine
export const automationMachine = createMachine({
  id: 'automation',
  initial: 'idle',
  context: {
    devices: [], // List of devices with their entities
    conditions: [], // Conditions to check
    actions: [], // Actions to perform
    apiResponses: [],
  },
  states: {
    idle: {
      on: {
        ADD_DEVICE: {
          actions: 'addDevice',
        },
        ADD_CONDITION: {
          actions: 'addCondition',
        },
        ADD_ACTION: {
          actions: 'addAction',
        },
        CHECK: 'checking',
      },
    },
    checking: {
      invoke: {
        src: 'checkConditions',
        onDone: {
          target: 'executing',
          actions: 'setApiResponses',
        },
        onError: 'idle',
      },
    },
    executing: {
      invoke: {
        src: 'executeActions',
        onDone: 'idle',
        onError: 'idle',
      },
    },
  },
}, {
  actions: {
    addDevice: (context, event) => {
      context.devices.push(event.device);
    },
    addCondition: (context, event) => {
      context.conditions.push(event.condition);
    },
    addAction: (context, event) => {
      context.actions.push(event.action);
    },
    setApiResponses: (context, event) => {
      context.apiResponses = event.data;
    },
  },
  
  services: {
    checkConditions: async (context) => {
      const results = await Promise.all(
        context.conditions.map(async (condition) => {
          const { deviceId, entityId, expectedState, operator } = condition;
          const device = context.devices.find(dev => dev.id === deviceId);
          const item = findDeviceEntity(device, entityId);

          if (!item) {
            return false; // Entity not found
          }

          // Logic to check condition based on the operator
          switch (operator) {
            case 'AND':
              return item.state === expectedState; // Implement AND logic as needed
            case 'OR':
              return item.state === expectedState; // Implement OR logic as needed
            case 'NOT':
              return item.state !== expectedState; // Implement NOT logic as needed
            default:
              return false;
          }
        })
      );
      return results.every(result => result); // Return true if all conditions are met
    },
    executeActions: async (context) => {
      await Promise.all(
        context.actions.map(async (action) => {
          const { deviceId, entityId } = action;
          const device = context.devices.find(dev => dev.id === deviceId);
          const item = findDeviceEntity(device, entityId);

          if (!item) {
            console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
            return;
          }
          const endpoint = item.state
            ? `http://${device.ip}/${item.domain}/${entityId}/turn_off`
            : `http://${device.ip}/${item.domain}/${entityId}/turn_on`;

          await axios.post(endpoint, "");
          // Optionally update the state in the local context
          item.state = !item.state;
        })
      );
    },
  },
});

// Example usage of createActor
const automationService = createActor(automationMachine);
automationService.start();