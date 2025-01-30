import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

const EntityCard = ({ entity, onUpdate }) => {
  const [state, setState] = useState(entity.state);

  // Sync state with the passed 'entity.state'
  useEffect(() => {
    setState(entity.state);
  }, [entity.state]);

  const handleToggle = () => {
    const newState = state === "ON" ? "OFF" : "ON";
    console.log(`Toggling switch, new state: ${newState}`);
    setState(newState);

    // Send WebSocket message using the passed `onUpdate` callback
    if (onUpdate) {
      // console.log(`Sending update to backend with topic: ${entity.publishTopic} and state: ${newState}`);
      onUpdate(entity.publishTopic, newState); // Sends the update to the backend
    }
  };

  return (
    <Card style={{ padding: "20px", margin: "10px" }}>

      <Typography variant="h6">{entity.entityName}</Typography>
      <Typography variant="h6">{entity.entityID}</Typography>
      <Typography variant="h6">{entity.subscribeTopic}</Typography>
      <Typography variant="h6">{entity.publishTopic}</Typography>
      <Typography variant="subtitle1">{entity.entityId}</Typography>
      {entity.stateType === "switch" ? (
        <Switch checked={state === "ON"} onChange={handleToggle} />
      ) : (
        <Typography variant="body1">{state}</Typography>
      )}
    </Card>
  );
};

export default EntityCard;

