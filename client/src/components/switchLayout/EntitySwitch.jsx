
import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Box, useTheme, Typography } from '@mui/material';
import { tokens } from '../../theme';
import axiosInstance from '../../axiosInstence';
import axios from 'axios';

export default function SwitchListSecondary() {
  const [devices, setDevices] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const devicesRef = useRef([]);

  useEffect(() => {
    
    fetchDevices();

   
    const intervalId = setInterval(() => {
      
      if (devicesRef.current.length > 0) {
        devicesRef.current.forEach(device => {
          device.entities.forEach(entity => {
            if (typeof entity.state !== 'boolean') {
              handleNonBooleanStateChange(device.id, entity.entityId);
            }
          });
        });
      }
    }, 1000); // Call every second

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect only runs once after initial render

  useEffect(() => {
    // Sync the ref with the latest state
    devicesRef.current = devices;
  }, [devices]); // Run this effect whenever `devices` changes
 
  const fetchDevices = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:3000/device/devicewithentities');
      if (response.data.success) {
        const groupedDevices = response.data.data.reduce((acc, item) => {
          const { _id, name, ip, entities } = item;
          if (!acc[_id]) {
            acc[_id] = { id: _id, name, ip, entities: [] };
          }
          acc[_id].entities = entities;
          return acc;
        }, {});

        setDevices(Object.values(groupedDevices));
      } else {
        console.error('API response indicates failure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const updateDeviceStateInDb = async (entityId, state) => {
    try {
      const updateResponse = await axios.post('http://localhost:3000/entity/state', {
        entityId,
        state
      });

      if (updateResponse.status !== 200) {
        throw new Error('Failed to update entity state in database');
      } else {
        console.log("Updated in DB");
      }
    } catch (error) {
      console.error('Error updating entity state in database:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleBooleanStateChange = async (deviceId, entityId, currentState) => {
    try {
      const device = devices.find(device => device.id === deviceId);
      if (!device) {
        console.error(`Device with id ${deviceId} not found`);
        return;
      }

      const item = device.entities.find(entity => entity.entityId === entityId);
      if (!item) {
        console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
        return;
      }

      const endpoint = currentState
        ? `http://${device.ip}/${item.domain}/${entityId}/turn_off`
        : `http://${device.ip}/${item.domain}/${entityId}/turn_on`;

      setDevices(prevDevices =>
        prevDevices.map(dev =>
          dev.id === deviceId
            ? {
                ...dev,
                entities: dev.entities.map(ent =>
                  ent.entityId === entityId
                    ? { ...ent, state: !currentState }
                    : ent
                ),
              }
            : dev
        )
      );

      await axios.post(endpoint, "");
      await updateDeviceStateInDb(entityId, !currentState);
    } catch (error) {
      console.error('Error updating boolean state:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleNonBooleanStateChange = async (deviceId, entityId) => {
    try {
      const device = devicesRef.current.find(device => device.id === deviceId);
      if (!device) {
        console.error(`Device with id ${deviceId} not found`);
        return;
      }

      const item = device.entities.find(entity => entity.entityId === entityId);
      if (!item) {
        console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
        return;
      }

      if (typeof item.state === 'string') {
        const dataForSensor = await axios.get(`http://${device.ip}/${item.domain}/${entityId}`);
        const sensorState = dataForSensor.data.state;

        const stateToDisplay = typeof sensorState === 'object' ? JSON.stringify(sensorState) : sensorState;

        setDevices(prevDevices =>
          prevDevices.map(dev =>
            dev.id === deviceId
              ? {
                  ...dev,
                  entities: dev.entities.map(ent =>
                    ent.entityId === entityId
                      ? { ...ent, state: stateToDisplay }
                      : ent
                  ),
                }
              : dev
          )
        );

        await updateDeviceStateInDb(entityId, stateToDisplay);
      } else {
        console.warn(`Skipping state update for entity ${entityId} as its state is not a string.`);
      }
    } catch (error) {
      console.error('Error handling non-boolean state:', error);
    }
  };


  const handleSwitchChange = async (deviceId, entityId) => {
    const device = devices.find(device => device.id === deviceId);
    if (!device) {
      console.error(`Device with id ${deviceId} not found`);
      return;
    }

    const item = device.entities.find(entity => entity.entityId === entityId);
    if (!item) {
      console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
      return;
    }

    if (typeof item.state === 'boolean') {
      await handleBooleanStateChange(deviceId, entityId, item.state);
    } else {
      alert('Non-boolean state cannot be toggled directly. Please update the value accordingly.');
    }
  };

  const renderStateComponent = (state, deviceId, entityId) => {
    if (typeof state === 'boolean') {
      return (
        <Switch
          color="primary"
          checked={state}
          onChange={() => handleSwitchChange(deviceId, entityId)}
          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.blueAccent[500] } }}
        />
      );
    } else if (typeof state === 'string') {
      return (
        <Typography variant="body2" color="textSecondary" fontSize={"16px"}>
          {state}
        </Typography>
      );
    } else {
      console.error('Unexpected state type:', state);
      return (
        <Typography variant="body2" color="textSecondary" fontSize={"20px"}>
          Unknown State
        </Typography>
      );
    }
  };
  return (
    <Box m="20px">
      <Grid container spacing={2}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.id}>
            <List
              style={{ 
                width: '100%', 
                boxShadow: `0px 4px 8px ${colors.grey[700]}` 
              }}
              subheader={<ListSubheader>{device.name || 'Device'}</ListSubheader>}
            >
              {device.entities.map((entity) => (
                <ListItem key={entity.entityId}>
                  <ListItemIcon>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary={entity.entityName || 'Unknown'} secondary={entity.entityId || 'Unknown'} />
                  {renderStateComponent(entity.state, device.id, entity.entityId)}
                </ListItem>
              ))}
            </List>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}



// import React, { useState, useEffect, useRef } from 'react';
// import Grid from '@mui/material/Grid';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import ListSubheader from '@mui/material/ListSubheader';
// import Switch from '@mui/material/Switch';
// import LightbulbIcon from '@mui/icons-material/Lightbulb';
// import { Box, useTheme, Typography } from '@mui/material';
// import { tokens } from '../../theme';
// import axiosInstance from '../../axiosInstence';
// import axios from 'axios';

// export default function SwitchListSecondary() {
//   const [devices, setDevices] = useState([]);
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const devicesRef = useRef([]);

//   useEffect(() => {
//     fetchDevices();

//     const intervalId = setInterval(() => {
//       if (devicesRef.current.length > 0) {
//         devicesRef.current.forEach(device => {
//           device.entities.forEach(entity => {
//             if (typeof entity.state !== 'boolean') {
//               handleNonBooleanStateChange(device.id, entity.entityId);
//             }
//           });
//         });
//       }
//     }, 1000); // Call every second

//     return () => clearInterval(intervalId); // Cleanup on component unmount
//   }, []);

//   useEffect(() => {
//     devicesRef.current = devices; // Sync the ref with the latest state
//   }, [devices]);

//   const fetchDevices = async () => {
//     try {
//       const response = await axiosInstance.get('http://localhost:3000/device/devicewithentities');
//       if (response.data.success) {
//         const groupedDevices = response.data.data.reduce((acc, item) => {
//           const { _id, name, ip, entities } = item;
//           if (!acc[_id]) {
//             acc[_id] = { id: _id, name, ip, entities: [] };
//           }
//           acc[_id].entities = entities;
//           return acc;
//         }, {});

//         setDevices(Object.values(groupedDevices));
//       } else {
//         console.error('API response indicates failure:', response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const updateDeviceStateInDb = async (entityId, state) => {
//     try {
//       const updateResponse = await axios.post('http://localhost:3000/entity/state', {
//         entityId,
//         state
//       });

//       if (updateResponse.status !== 200) {
//         throw new Error('Failed to update entity state in database');
//       } else {
//         console.log('Updated in DB');
//       }
//     } catch (error) {
//       console.error('Error updating entity state in database:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleBooleanStateChange = async (deviceId, entityId, currentState) => {
//     const device = devices.find(device => device.id === deviceId);
//     if (!device) {
//       console.error(`Device with id ${deviceId} not found`);
//       return;
//     }

//     const item = device.entities.find(entity => entity.entityId === entityId);
//     if (!item) {
//       console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
//       return;
//     }

//     const endpoint = currentState
//       ? `http://${device.ip}/${item.domain}/${entityId}/turn_off`
//       : `http://${device.ip}/${item.domain}/${entityId}/turn_on`;

//     // Optimistically update the UI first
//     const newState = !currentState;
//     setDevices(prevDevices =>
//       prevDevices.map(dev =>
//         dev.id === deviceId
//           ? {
//               ...dev,
//               entities: dev.entities.map(ent =>
//                 ent.entityId === entityId
//                   ? { ...ent, state: newState }
//                   : ent
//               ),
//             }
//           : dev
//       )
//     );

//     try {
//       await axios.post(endpoint, '');
//       await updateDeviceStateInDb(entityId, newState);
//     } catch (error) {
//       console.error('Error updating boolean state:', error);
//       // Revert the UI state back to the original state
//       setDevices(prevDevices =>
//         prevDevices.map(dev =>
//           dev.id === deviceId
//             ? {
//                 ...dev,
//                 entities: dev.entities.map(ent =>
//                   ent.entityId === entityId
//                     ? { ...ent, state: currentState }
//                     : ent
//                 ),
//               }
//             : dev
//         )
//       );
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleNonBooleanStateChange = async (deviceId, entityId) => {
//     try {
//       const device = devicesRef.current.find(device => device.id === deviceId);
//       if (!device) {
//         console.error(`Device with id ${deviceId} not found`);
//         return;
//       }

//       const item = device.entities.find(entity => entity.entityId === entityId);
//       if (!item) {
//         console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
//         return;
//       }

//       if (typeof item.state === 'string') {
//         const dataForSensor = await axios.get(`http://${device.ip}/${item.domain}/${entityId}`);
//         const sensorState = dataForSensor.data.state;

//         const stateToDisplay = typeof sensorState === 'object' ? JSON.stringify(sensorState) : sensorState;

//         setDevices(prevDevices =>
//           prevDevices.map(dev =>
//             dev.id === deviceId
//               ? {
//                   ...dev,
//                   entities: dev.entities.map(ent =>
//                     ent.entityId === entityId
//                       ? { ...ent, state: stateToDisplay }
//                       : ent
//                   ),
//                 }
//               : dev
//           )
//         );

//         await updateDeviceStateInDb(entityId, stateToDisplay);
//       } else {
//         console.warn(`Skipping state update for entity ${entityId} as its state is not a string.`);
//       }
//     } catch (error) {
//       console.error('Error handling non-boolean state:', error);
//     }
//   };

//   const handleSwitchChange = async (deviceId, entityId) => {
//     const device = devices.find(device => device.id === deviceId);
//     if (!device) {
//       console.error(`Device with id ${deviceId} not found`);
//       return;
//     }

//     const item = device.entities.find(entity => entity.entityId === entityId);
//     if (!item) {
//       console.error(`Entity with id ${entityId} not found in device ${deviceId}`);
//       return;
//     }

//     if (typeof item.state === 'boolean') {
//       await handleBooleanStateChange(deviceId, entityId, item.state);
//     } else {
//       alert('Non-boolean state cannot be toggled directly. Please update the value accordingly.');
//     }
//   };

//   const renderStateComponent = (state, deviceId, entityId) => {
//     if (typeof state === 'boolean') {
//       return (
//         <Switch
//           color="primary"
//           checked={state}
//           onChange={() => handleSwitchChange(deviceId, entityId)}
//           sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.blueAccent[500] } }}
//         />
//       );
//     } else if (typeof state === 'string') {
//       return (
//         <Typography variant="body2" color="textSecondary" fontSize={"16px"}>
//           {state}
//         </Typography>
//       );
//     } else {
//       console.error('Unexpected state type:', state);
//       return (
//         <Typography variant="body2" color="textSecondary" fontSize={"20px"}>
//           Unknown State
//         </Typography>
//       );
//     }
//   };

//   return (
//     <Box m="20px">
//       <Grid container spacing={2}>
//         {devices.map((device) => (
//           <Grid item xs={12} sm={6} md={4} key={device.id}>
//             <List
//               style={{
//                 width: '100%',
//                 boxShadow: `0px 4px 8px ${colors.grey[700]}`,
//               }}
//               subheader={<ListSubheader>{device.name || 'Device'}</ListSubheader>}
//             >
//               {device.entities.map((entity) => (
//                 <ListItem key={entity.entityId}>
//                   <ListItemIcon>
//                     <LightbulbIcon />
//                   </ListItemIcon>
//                   <ListItemText primary={entity.entityName || 'Unknown'} secondary={entity.entityId || 'Unknown'} />
//                   {renderStateComponent(entity.state, device.id, entity.entityId)}
//                 </ListItem>
//               ))}
//             </List>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }






























