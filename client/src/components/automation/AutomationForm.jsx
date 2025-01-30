import React, { useEffect, useState } from 'react';
import { createActor } from 'xstate';
import { automationMachine } from './AddMachine';
import { useActor } from '@xstate/react';
const AutomationComponent = () => {
  const [deviceId, setDeviceId] = useState('');
  const [entityId, setEntityId] = useState('');
  const [expectedState, setExpectedState] = useState('');
  const [operator, setOperator] = useState('AND'); 
  const [notexpectedState,setnotExpectedState] = useState("");
  const [automationService, setAutomationService] = useState(null);
  const [actionDeviceId, setActionDeviceId] = useState('');
  const [actionEntityId, setActionEntityId] = useState('');

  useEffect(() => {
    const service = createActor(automationMachine);
    service.subscribe(state => {
      console.log(state.value);
    });
    service.start(); // Ensure the service is started

    setAutomationService(service);

    return () => {
      service.stop(); 
    };
  }, []);

  const handleAddDevice = () => {

    const device = { id: deviceId, ip: '192.168.1.1', domain: 'device_domain', entities: [{ entityId, state: false }] };
    automationService.send({ type: 'ADD_DEVICE', device });
    setDeviceId('');
  };

  const handleAddCondition = () => {
    automationService.send({
      type: 'ADD_CONDITION',
      condition: { deviceId, entityId, expectedState, operator }
    });
    setDeviceId('');
    setEntityId('');
    setExpectedState('');
  };

  const handleAddAction = () => {
    automationService.send({
      type: 'ADD_ACTION',
      action: { deviceId: actionDeviceId, entityId: actionEntityId }
    });
    setActionDeviceId('');
    setActionEntityId('');
  };

  const handleCheck = () => {
    automationService.send({ type: 'CHECK' });
  };

  return (
    <div>
      <h2>Automation Setup</h2>
      <div>
        <h3>Add Device</h3>
        <input
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="Device ID"
        />
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Entity ID"
        />
        <button onClick={handleAddDevice}>Add Device</button>
      </div>
      <div>
        <h3>Add Condition</h3>
        <input
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="Device ID"
        />
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Entity ID"
        />
        <input
          value={expectedState}
          onChange={(e) => setExpectedState(e.target.value)}
          placeholder="Expected State"
        />
        <select value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="NOT">NOT</option>
        </select>
        <button onClick={handleAddCondition}>Add Condition</button>
      </div>
      <div>
        <h3>Add Action</h3>
        <input
          value={actionDeviceId}
          onChange={(e) => setActionDeviceId(e.target.value)}
          placeholder="Action Device ID"
        />
        <input
          value={actionEntityId}
          onChange={(e) => setActionEntityId(e.target.value)}
          placeholder="Action Entity ID"
        />
        <button onClick={handleAddAction}>Add Action</button>
      </div>
      <button onClick={handleCheck}>Check Conditions</button>
    </div>
  );
};

export default AutomationComponent;