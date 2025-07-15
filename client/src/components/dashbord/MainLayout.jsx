// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import {
//   Grid,
//   Box,
//   Card,
//   CardHeader,
//   CardContent,
//   Typography,
//   Switch,
//   Tooltip,
//   IconButton,
//   LinearProgress,
//   Snackbar,
//   Alert,
//   Chip
// } from '@mui/material';
// import { 
//   MoreVert, 
//   PowerSettingsNew,
//   Refresh,
//   ErrorOutline
// } from '@mui/icons-material';
// import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
// import CircularFanDimmer from './CircularFanDimmer';
// import WfsPulseCounter from '../waterManagmentSystem/WfsPulseCounter';

// const IOTDashboard = () => {
//   const [socket, setSocket] = useState(null);
//   const [devices, setDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const ApiUrl = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     const socket = io(`${ApiUrl}`, {
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 20000
//     });

//     setSocket(socket);

//     socket.on('connect', () => {
//       setConnectionStatus('connected');
//       setError(null);
//     });

//     socket.on('initial_state', (data) => {
//       setDevices(data.devices);
//       setLoading(false);
//       setConnectionStatus('connected');
//     });

//     socket.on('state_update', ({ entityId, state }) => {
//       setDevices((prevDevices) =>
//         prevDevices.map((device) => ({
//           ...device,
//           entities: device.entities.map((entity) =>
//             entity._id === entityId ? { ...entity, state } : entity
//           ),
//         }))
//       );
//     });

//     socket.on('connect_error', (err) => {
//       console.error('Socket connection error:', err);
//       setConnectionStatus('disconnected');
//       setError('Connection failed. Attempting to reconnect...');
//     });

//     socket.on('disconnect', () => {
//       setConnectionStatus('disconnected');
//     });

//     socket.on('reconnect_failed', () => {
//       setError('Failed to reconnect. Please refresh the page.');
//       setConnectionStatus('error');
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleEntityUpdate = (publishTopic, newState) => {
//     if (socket && connectionStatus === 'connected') {
//       socket.emit('state_change', { publishTopic, state: newState });
//     } else {
//       setError('Cannot send command - connection unavailable');
//     }
//   };

//   const handleRefresh = () => {
//     setLoading(true);
//     if (socket) {
//       socket.emit('request_state');
//     }
//   };

//   const handleRetryConnection = () => {
//     if (socket) {
//       socket.connect();
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ width: '100%', p: 4 }}>
//         <LinearProgress />
//         <Typography variant="h6" align="center" sx={{ mt: 2 }}>
//           Loading devices...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       <Box sx={{ flexGrow: 1, p: 3 }}>
//         {/* Connection status bar */}
//         <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Chip
//             label={`Status: ${connectionStatus}`}
//             color={
//               connectionStatus === 'connected' ? 'success' : 
//               connectionStatus === 'connecting' ? 'warning' : 'error'
//             }
//             icon={<PowerSettingsNew fontSize="small" />}
//           />
//           {connectionStatus !== 'connected' && (
//             <IconButton onClick={handleRetryConnection} color="primary">
//               <Refresh />
//               <Typography variant="body2" sx={{ ml: 1 }}>Retry</Typography>
//             </IconButton>
//           )}
//         </Box>

//         {/* Main content */}
//         <Grid container spacing={3}>
//           {devices.map((device) => (
//             <Grid item xs={12} sm={6} md={4} lg={3} key={device._id}>
//               <Card
//                 sx={{
//                   height: '100%',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   transition: 'box-shadow 0.3s',
//                   '&:hover': {
//                     boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
//                   }
//                 }}
//               >
//                 <CardHeader
//                   action={
//                     <>
//                       <Tooltip title="Refresh">
//                         <IconButton onClick={handleRefresh} size="small">
//                           <Refresh fontSize="small" />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="More options">
//                         <IconButton size="small">
//                           <MoreVert fontSize="small" />
//                         </IconButton>
//                       </Tooltip>
//                     </>
//                   }
//                   title={
//                     <Typography variant="h6" noWrap>
//                       {device.deviceName}
//                     </Typography>
//                   }
//                   subheader={
//                     <Typography variant="caption" color="text.secondary">
//                       {device.entities.length} controls
//                     </Typography>
//                   }
//                 />
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   {device.entities.map((entity) => (
//                     <Box
//                       key={entity._id}
//                       sx={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         mb: 3,
//                         p: 1,
//                         borderRadius: 1,
//                         '&:hover': {
//                           backgroundColor: 'action.hover'
//                         }
//                       }}
//                     >
//                       <OnlinePredictionIcon 
//                         color={entity.state === 'ON' || parseInt(entity.state) > 0 ? 'primary' : 'disabled'} 
//                         sx={{ mr: 2 }} 
//                       />
//                       <Box sx={{ flexGrow: 1 }}>
//                         <Typography variant="body1" fontWeight="medium">
//                           {entity.entityName}
//                         </Typography>
//                         {entity.stateType === "dimmer" && (
//                           <Typography variant="caption" color="text.secondary">
//                             {parseInt(entity.state)}% speed
//                           </Typography>
//                         )}
//                       </Box>

//                       {entity.stateType === "switch" ? (
//                         <Switch
//                           checked={entity.state === 'ON'}
//                           onChange={() =>
//                             handleEntityUpdate(
//                               entity.publishTopic,
//                               entity.state === 'ON' ? 'OFF' : 'ON'
//                             )
//                           }
//                           color="primary"
//                         />
//                       ):entity.stateType === "dimmer" ? (
//                         <CircularFanDimmer
//                           value={parseInt(entity.state)}
//                           onChange={(value) =>
//                             handleEntityUpdate(entity.publishTopic, value.toString())
//                           }
//                           disabled={connectionStatus !== 'connected'}
//                         />
//                       ) : (
//                         <Chip
//                           label={entity.state}
//                           size="small"
//                           color={
//                             entity.state === 'ON' ? 'success' : 
//                             entity.state === 'OFF' ? 'default' : 'info'
//                           }
//                         />
//                       )}
//                     </Box>
//                   ))}
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>

//       {/* Error notification */}
//       <Snackbar
//         open={!!error}
//         autoHideDuration={6000}
//         onClose={() => setError(null)}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           severity="error" 
//           icon={<ErrorOutline />}
//           onClose={() => setError(null)}
//           sx={{ width: '100%' }}
//         >
//           {error}
//           {connectionStatus === 'error' && (
//             <Box sx={{ mt: 1 }}>
//               <IconButton 
//                 size="small" 
//                 color="inherit" 
//                 onClick={handleRetryConnection}
//               >
//                 <Refresh fontSize="small" />
//                 <Typography variant="body2" sx={{ ml: 0.5 }}>Retry</Typography>
//               </IconButton>
//             </Box>
//           )}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default IOTDashboard;





import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Switch,
  Tooltip,
  IconButton,
  Button,
  ButtonGroup,
  Grid,
  styled,
  useTheme
} from '@mui/material';
import {
  MoreVert,
  Lightbulb,
  PowerSettingsNew,
  AcUnit,
  Brightness4,
  SettingsInputHdmi,
  ElectricBolt
} from '@mui/icons-material';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import { keyframes } from '@emotion/react';

// Animations
const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px #ffff00); }
  50% { filter: drop-shadow(0 0 8px #ffff00); }
  100% { filter: drop-shadow(0 0 2px #ffff00); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const DeviceCard = styled(Card)(({ theme }) => ({
  minWidth: '280px',
  maxWidth: '100%',
  boxShadow: theme.shadows[4],
  borderRadius: '16px',
  overflow: 'visible',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const EntityContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  backgroundColor: theme.palette.grey[100],
  marginBottom: theme.spacing(2),
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}));

const LightIcon = styled(Lightbulb)(({ ison, theme }) => ({
  fontSize: '2rem',
  color: ison === 'true' ? theme.palette.warning.main : theme.palette.grey[500],
  animation: ison === 'true' ? `${glow} 2s infinite` : 'none',
  marginRight: theme.spacing(2),
}));

const MotorIcon = styled(ElectricBolt)(({ ison, theme }) => ({
  fontSize: '2rem',
  color: ison === 'true' ? theme.palette.success.main : theme.palette.grey[500],
  marginRight: theme.spacing(2),
  animation: ison === 'true' ? `${pulse} 1.5s infinite` : 'none',
}));

const FanContainer = styled('div')({
  position: 'relative',
  width: '70px',
  height: '70px',
  marginLeft: 'auto',
});

const FanSpeedRing = styled('div')(({ theme, speed }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: `6px solid ${theme.palette.grey[300]}`,
  borderTopColor: speed >= 25 ? theme.palette.primary.main : 'inherit',
  borderRightColor: speed >= 50 ? theme.palette.primary.main : 'inherit',
  borderBottomColor: speed >= 75 ? theme.palette.primary.main : 'inherit',
  borderLeftColor: speed >= 100 ? theme.palette.primary.main : 'inherit',
  transition: 'all 0.3s ease',
}));

const FanIcon = styled(AcUnit)(({ speed, theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '1.8rem',
  color: speed > 0 ? theme.palette.info.main : theme.palette.grey[500],
  animation: speed > 0 ? 'spin 1.5s linear infinite' : 'none',
  '@keyframes spin': {
    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
    '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
  },
}));

const SpeedIndicator = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  color: theme.palette.text.primary,
}));

const SwitchContainer = styled('div')(({ theme, ison }) => ({
  position: 'relative',
  width: '52px',
  height: '28px',
  borderRadius: '28px',
  backgroundColor: ison === 'true' ? theme.palette.primary.main : theme.palette.grey[400],
  transition: 'all 0.3s ease',
  marginLeft: 'auto',
  cursor: 'pointer',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'white',
    top: '3px',
    left: ison === 'true' ? '25px' : '3px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
}));

const SpeedButton = styled(Button)(({ theme, active }) => ({
  minWidth: '36px',
  padding: theme.spacing(0.5),
  fontWeight: active ? 'bold' : 'normal',
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: `1px solid ${active ? theme.palette.primary.dark : theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  '&:not(:last-child)': {
    borderRight: 'none',
  },
}));

const IOTDashboard = () => {
  const [socket, setSocket] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const ApiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const socket = io(`${ApiUrl}`);
    setSocket(socket);
    
    // Mock data - replace with your actual socket implementation
    // const mockDevices = [
    //   {
    //     deviceId: "6798c271c1c3de9d92c05ff1",
    //     deviceName: "Prayer Room 1st Floor",
    //     entities: [
    //       {
    //         entityId: "prayer_room_01_nodemcu_switch_4",
    //         entityName: "Light 2",
    //         publishTopic: "thecldiot/prayer_room_01/switch_2/command",
    //         state: "OFF",
    //         stateType: "switch",
    //         subscribeTopic: "thecldiot/prayer_room_01/switch_2/state",
    //         _id: "6798c372c1c3de9d92c26405"
    //       },
    //       {
    //         entityId: "prayer_room_01_nodemcu_switch_3",
    //         entityName: "Light 1",
    //         publishTopic: "thecldiot/prayer_room_01/switch_3/command",
    //         state: "OFF",
    //         stateType: "switch",
    //         subscribeTopic: "thecldiot/prayer_room_01/switch_3/state",
    //         _id: "6798c322c1c3de9d92c1a7bf"
    //       },
    //       {
    //         entityId: "prayer_room_01_nodemcu_fan_dimmer",
    //         entityName: "Fan Power",
    //         publishTopic: "thecldiot/prayer_room_01/fan_dimmer/command",
    //         state: "OFF",
    //         stateType: "switch",
    //         subscribeTopic: "thecldiot/prayer_room_01/fan_dimmer/state",
    //         _id: "6798c490c1c3de9d92c3d556"
    //       },
    //       {
    //         entityId: "prayer_room_01_nodemcu_fan_speed_level",
    //         entityName: "Fan Speed",
    //         publishTopic: "thecldiot/prayer_room_01/fan/speed_level/command",
    //         state: "0",
    //         stateType: "dimmer",
    //         subscribeTopic: "thecldiot/prayer_room_01/fan/speed_level/state",
    //         _id: "6798c517c1c3de9d92c4afe5"
    //       },
    //       {
    //         entityId: "prayer_room_01_nodemcu_motor_switch",
    //         entityName: "Motor Switch",
    //         publishTopic: "thecldiot/prayer_room_01/motor/command",
    //         state: "OFF",
    //         stateType: "switch",
    //         subscribeTopic: "thecldiot/prayer_room_01/motor/state",
    //         _id: "6798c517c1c3de9d92c4afe6"
    //       }
    //     ]
    //   }
    // ];

    // setDevices(mockDevices);
    // setLoading(false);

    socket.on('initial_state', (data) => {
      setDevices(data.devices);
      setLoading(false);
    });

    socket.on('state_update', ({ entityId, state }) => {
      setDevices(prevDevices =>
        prevDevices.map(device => ({
          ...device,
          entities: device.entities.map(entity =>
            entity._id === entityId ? { ...entity, state } : entity
          ),
        }))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleEntityUpdate = (publishTopic, newState) => {
    if (socket) {
      socket.emit('state_change', { publishTopic, state: newState });
    } else {
      console.error('Socket.io is not connected');
    }
  };

  const handleFanSpeedChange = (publishTopic, speed) => {
    handleEntityUpdate(publishTopic, speed.toString());
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.deviceId}>
            <DeviceCard>
              <CardHeader
                avatar={<OnlinePredictionIcon color="primary" />}
                action={
                  <Tooltip title="More Options">
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                }
                title={
                  <Typography variant="h6" fontWeight="bold">
                    {device.deviceName}
                  </Typography>
                }
                subheader={
                  <Typography variant="caption" color="text.secondary">
                    {device.entities.length} controls
                  </Typography>
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  padding: theme.spacing(2),
                }}
              />
              <CardContent sx={{ padding: theme.spacing(2) }}>
                {device.entities.map((entity) => (
                  <EntityContainer key={entity._id}>
                    {entity.stateType === "switch" && entity.entityName.toLowerCase().includes("light") ? (
                      <>
                        <LightIcon ison={entity.state === "ON" ? "true" : "false"} />
                        <Typography variant="body1" fontWeight="medium">
                          {entity.entityName}
                        </Typography>
                        <SwitchContainer
                          ison={entity.state === "ON" ? "true" : "false"}
                          onClick={() =>
                            handleEntityUpdate(
                              entity.publishTopic,
                              entity.state === "ON" ? "OFF" : "ON"
                            )
                          }
                        />
                      </>
                    ) : entity.stateType === "switch" && entity.entityName.toLowerCase().includes("fan power") ? (
                      <>
                        <PowerSettingsNew sx={{ 
                          fontSize: '1.8rem', 
                          mr: 2, 
                          color: entity.state === "ON" ? theme.palette.primary.main : theme.palette.grey[500] 
                        }} />
                        <Typography variant="body1" fontWeight="medium">
                          {entity.entityName}
                        </Typography>
                        <SwitchContainer
                          ison={entity.state === "ON" ? "true" : "false"}
                          onClick={() =>
                            handleEntityUpdate(
                              entity.publishTopic,
                              entity.state === "ON" ? "OFF" : "ON"
                            )
                          }
                        />
                      </>
                    ) : entity.stateType === "dimmer" && entity.entityName.toLowerCase().includes("fan speed") ? (
                      <>
                        <FanContainer>
                          <FanSpeedRing speed={parseInt(entity.state)} />
                          <FanIcon speed={parseInt(entity.state)} />
                          <SpeedIndicator>{entity.state}%</SpeedIndicator>
                        </FanContainer>
                        <Box sx={{ width: '100%', ml: 2 }}>
                          <Typography variant="body1" fontWeight="medium" mb={1}>
                            {entity.entityName}
                          </Typography>
                          <ButtonGroup fullWidth size="small">
                            {[0, 25, 50, 75, 100].map((speed) => (
                              <SpeedButton
                                key={speed}
                                active={parseInt(entity.state) === speed}
                                onClick={() => handleFanSpeedChange(entity.publishTopic, speed)}
                              >
                                {speed}
                              </SpeedButton>
                            ))}
                          </ButtonGroup>
                        </Box>
                      </>
                    ) : entity.stateType === "switch" && entity.entityName.toLowerCase().includes("motor") ? (
                      <>
                        <MotorIcon ison={entity.state === "ON" ? "true" : "false"} />
                        <Typography variant="body1" fontWeight="medium">
                          {entity.entityName}
                        </Typography>
                        <SwitchContainer
                          ison={entity.state === "ON" ? "true" : "false"}
                          onClick={() =>
                            handleEntityUpdate(
                              entity.publishTopic,
                              entity.state === "ON" ? "OFF" : "ON"
                            )
                          }
                        />
                      </>
                    ) : (
                      <>
                        <Brightness4 sx={{ fontSize: '1.8rem', mr: 2 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {entity.entityName}
                        </Typography>
                        <SwitchContainer
                          ison={entity.state === "ON" ? "true" : "false"}
                          onClick={() =>
                            handleEntityUpdate(
                              entity.publishTopic,
                              entity.state === "ON" ? "OFF" : "ON"
                            )
                          }
                        />
                      </>
                    )}
                  </EntityContainer>
                ))}
              </CardContent>
            </DeviceCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IOTDashboard;