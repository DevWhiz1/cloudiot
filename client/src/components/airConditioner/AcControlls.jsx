// import React, { useState, useEffect } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   Typography, 
//   Grid, 
//   Button, 
//   IconButton, 
//   Paper, 
//   Box,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Chip
// } from '@mui/material';
// import { 
//   PowerSettingsNew, 
//   Add, 
//   Remove, 
//   AcUnit, 
//   Whatshot, 
//   ModeFanOff, 
//   BeachAccess, 
//   SettingsInputAntenna,
//   Refresh,
//   WifiOff,
//   Wifi,
//   ErrorOutline
// } from '@mui/icons-material';
// import { useParams } from 'react-router-dom';
// import { useWebSocket } from '../../context/useWebsocket';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)(({ theme }) => ({
//   maxWidth: 500,
//   margin: 'auto',
//   marginTop: theme.spacing(2),
//   padding: theme.spacing(1),
//   [theme.breakpoints.down('sm')]: {
//     maxWidth: '100%',
//     margin: theme.spacing(1),
//   },
// }));

// const StatusChip = styled(Chip)(({ theme, status }) => ({
//   marginLeft: theme.spacing(1),
//   backgroundColor: 
//     status === 'connected' ? theme.palette.success.light :
//     status === 'disconnected' ? theme.palette.error.light :
//     status === 'error' ? theme.palette.warning.light :
//     theme.palette.info.light,
//   color: theme.palette.getContrastText(
//     status === 'connected' ? theme.palette.success.light :
//     status === 'disconnected' ? theme.palette.error.light :
//     status === 'error' ? theme.palette.warning.light :
//     theme.palette.info.light
//   ),
// }));

// const ACControl = () => {
//   const { deviceId } = useParams();
//   const socket = useWebSocket();
//   const [acState, setAcState] = useState({
//     power: false,
//     currentTemperature: 25,
//     targetTemperature: 24,
//     humidity: 50,
//     mode: 'cool',
//     fanSpeed: 'medium',
//     swing: 'auto',
//     lastUpdated: null
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState('');
//   const [snackbarSeverity, setSnackbarSeverity] = useState('info');

//   // Show snackbar notification
//   const showNotification = (message, severity = 'info') => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(severity);
//     setSnackbarOpen(true);
//   };

//   // Handle socket connection and state updates
//   useEffect(() => {
//     if (!socket || !deviceId) {
//       console.error("Socket or deviceId is not available");
//       setError("Connection error - please refresh the page");
//       setLoading(false);
//       setConnectionStatus('error');
//       showNotification("Connection error - please refresh the page", 'error');
//       return;
//     }

//     console.log("Connecting to AC device:", deviceId);

//     // Track if we've received the initial state
//     let hasInitialState = false;
//     const connectionTimeout = setTimeout(() => {
//       if (!hasInitialState) {
//         setError("Connection timeout - please try again");
//         setLoading(false);
//         setConnectionStatus('error');
//         showNotification("Connection timeout - please try again", 'error');
//       }
//     }, 10000);

//     // Emit the connect_ac_device event
//     socket.emit('connect_ac_device', deviceId);

//     // Listen for state updates
//     const handleStateUpdate = ({ deviceId: updatedDeviceId, state, timestamp }) => {
//       console.log("Received AC state update:", updatedDeviceId, state);
//       if (updatedDeviceId === deviceId) {
//         if (!hasInitialState) {
//           hasInitialState = true;
//           clearTimeout(connectionTimeout);
//           setLoading(false);
//           setError(null);
//           setConnectionStatus('connected');
//           showNotification("Successfully connected to AC device", 'success');
//         }
        
//         setAcState(prev => ({
//           ...prev,
//           ...state,
//           lastUpdated: timestamp || new Date().toISOString()
//         }));
//       }
//     };

//     // Listen for errors
//     const handleError = ({ message }) => {
//       console.error("Received AC error:", message);
//       setError(message);
//       setLoading(false);
//       setConnectionStatus('error');
//       clearTimeout(connectionTimeout);
//       showNotification(message, 'error');
//     };

//     // Connection status events
//     const handleConnect = () => {
//       console.log("WebSocket reconnected, reconnecting AC device");
//       socket.emit('connect_ac_device', deviceId);
//       setConnectionStatus('reconnecting');
//       showNotification("Reconnecting to AC device...", 'info');
//     };

//     const handleDisconnect = () => {
//       setConnectionStatus('disconnected');
//       showNotification("Disconnected from server - attempting to reconnect", 'warning');
//     };

//     const handleReconnect = (attempt) => {
//       setConnectionStatus(`reconnecting (attempt ${attempt})`);
//     };

//     const handleReconnectError = () => {
//       setConnectionStatus('error');
//       showNotification("Failed to reconnect to server", 'error');
//     };

//     socket.on('ac_state', handleStateUpdate);
//     socket.on('ac_error', handleError);
//     socket.on('connect', handleConnect);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('reconnect', handleReconnect);
//     socket.on('reconnect_error', handleReconnectError);

//     return () => {
//       socket.off('ac_state', handleStateUpdate);
//       socket.off('ac_error', handleError);
//       socket.off('connect', handleConnect);
//       socket.off('disconnect', handleDisconnect);
//       socket.off('reconnect', handleReconnect);
//       socket.off('reconnect_error', handleReconnectError);
//       clearTimeout(connectionTimeout);
      
//       // Notify server we're disconnecting from this device
//       if (socket && deviceId) {
//         socket.emit('disconnect_ac_device', deviceId);
//       }
//     };
//   }, [socket, deviceId]);

//   // Send command to the server
//   const sendCommand = (command, value) => {
//     if (!socket || !deviceId) {
//       showNotification("Not connected to server", 'error');
//       return;
//     }

//     if (connectionStatus !== 'connected') {
//       showNotification("Cannot send command while disconnected", 'warning');
//       return;
//     }

//     socket.emit('ac_command', {
//       deviceId,
//       command,
//       value
//     });
//   };

//   // Handle temperature change
//   const handleTemperatureChange = (action) => {
//     let newTemp = acState.targetTemperature;
//     if (action === 'increase' && newTemp < 30) {
//       newTemp += 1;
//     } else if (action === 'decrease' && newTemp > 16) {
//       newTemp -= 1;
//     }
//     sendCommand('temperature', newTemp);
//   };

//   // Handle power toggle
//   const handlePowerToggle = () => {
//     sendCommand('power', !acState.power);
//   };

//   // Handle mode change
//   const handleModeChange = (newMode) => {
//     sendCommand('mode', newMode);
//   };

//   // Handle fan speed change
//   const handleFanSpeedChange = (newSpeed) => {
//     sendCommand('fanSpeed', newSpeed);
//   };

//   // Handle swing mode change
//   const handleSwingChange = (newSwing) => {
//     sendCommand('swing', newSwing);
//   };

//   // Refresh connection
//   const handleRefresh = () => {
//     setLoading(true);
//     setConnectionStatus('connecting');
//     socket.emit('connect_ac_device', deviceId);
//   };

//   // Get icon for connection status
//   const getConnectionIcon = () => {
//     switch (connectionStatus) {
//       case 'connected': return <Wifi color="success" />;
//       case 'disconnected': return <WifiOff color="error" />;
//       case 'error': return <ErrorOutline color="warning" />;
//       default: return <CircularProgress size={20} />;
//     }
//   };

//   if (error) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh',
//         flexDirection: 'column',
//         gap: 2
//       }}>
//         <Typography color="error" variant="h6">{error}</Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<Refresh />}
//           onClick={handleRefresh}
//         >
//           Retry Connection
//         </Button>
//       </Box>
//     );
//   }

//   if (loading) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh',
//         flexDirection: 'column',
//         gap: 2
//       }}>
//         <CircularProgress />
//         <Typography>Connecting to AC device {deviceId}...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       <StyledCard>
//         <CardContent>
//           <Box sx={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             alignItems: 'center',
//             mb: 2
//           }}>
//             <Typography variant="h5" component="div">
//               AC Control (ID: {deviceId})
//             </Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               {getConnectionIcon()}
//               <StatusChip 
//                 label={connectionStatus} 
//                 status={connectionStatus.split(' ')[0]} 
//                 size="small" 
//               />
//             </Box>
//           </Box>

//           {acState.lastUpdated && (
//             <Typography variant="caption" color="textSecondary" display="block" align="right">
//               Last updated: {new Date(acState.lastUpdated).toLocaleString()}
//             </Typography>
//           )}

//           {/* Power Button */}
//           <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
//             <Grid item>
//               <Button
//                 variant="contained"
//                 color={acState.power ? 'primary' : 'secondary'}
//                 startIcon={<PowerSettingsNew />}
//                 onClick={handlePowerToggle}
//                 size="large"
//               >
//                 {acState.power ? 'ON' : 'OFF'}
//               </Button>
//             </Grid>
//           </Grid>

//           {/* Current Temperature Display */}
//           <Box sx={{ textAlign: 'center', mb: 3 }}>
//             <Typography variant="h6">
//               Current room temperature: {acState.currentTemperature}°C
//             </Typography>
//             <Typography variant="body2" color="textSecondary">
//               Humidity: {acState.humidity}%
//             </Typography>
//           </Box>

//           {/* Temperature Control */}
//           <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 3 }}>
//             <Grid item>
//               <IconButton 
//                 onClick={() => handleTemperatureChange('decrease')} 
//                 disabled={!acState.power}
//                 size="large"
//               >
//                 <Remove fontSize="large" />
//               </IconButton>
//             </Grid>
//             <Grid item>
//               <Paper 
//                 elevation={3} 
//                 sx={{ 
//                   padding: 3, 
//                   borderRadius: '50%', 
//                   display: 'flex', 
//                   justifyContent: 'center', 
//                   alignItems: 'center',
//                   backgroundColor: acState.power ? 'primary.light' : 'grey.300',
//                   color: acState.power ? 'primary.contrastText' : 'grey.600'
//                 }}
//               >
//                 <Typography variant="h3" align="center">
//                   {acState.targetTemperature}°C
//                 </Typography>
//               </Paper>
//             </Grid>
//             <Grid item>
//               <IconButton 
//                 onClick={() => handleTemperatureChange('increase')} 
//                 disabled={!acState.power}
//                 size="large"
//               >
//                 <Add fontSize="large" />
//               </IconButton>
//             </Grid>
//           </Grid>

//           {/* Mode Selection */}
//           <Typography variant="h6" align="center" gutterBottom>
//             Mode
//           </Typography>
//           <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//             {[
//               { value: 'cool', label: 'Cool', icon: <AcUnit fontSize="large" /> },
//               { value: 'heat', label: 'Heat', icon: <Whatshot fontSize="large" /> },
//               { value: 'fan_only', label: 'Fan', icon: <ModeFanOff fontSize="large" /> },
//               { value: 'dry', label: 'Dry', icon: <BeachAccess fontSize="large" /> },
//               { value: 'auto', label: 'Auto', icon: <SettingsInputAntenna fontSize="large" /> },
//               { value: 'off', label: 'Off', icon: <PowerSettingsNew fontSize="large" /> }
//             ].map((option) => (
//               <Grid item xs={4} key={option.value}>
//                 <Button
//                   fullWidth
//                   variant={acState.mode === option.value ? 'contained' : 'outlined'}
//                   onClick={() => handleModeChange(option.value)}
//                   disabled={!acState.power && option.value !== 'off'}
//                   sx={{ 
//                     display: 'flex', 
//                     flexDirection: 'column', 
//                     alignItems: 'center',
//                     padding: 2
//                   }}
//                 >
//                   {option.icon}
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     {option.label}
//                   </Typography>
//                 </Button>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Fan Speed Selection */}
//           <Typography variant="h6" align="center" gutterBottom>
//             Fan Speed
//           </Typography>
//           <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//             {['low', 'medium', 'high', 'auto'].map((speed) => (
//               <Grid item xs={3} key={speed}>
//                 <Button
//                   fullWidth
//                   variant={acState.fanSpeed === speed ? 'contained' : 'outlined'}
//                   onClick={() => handleFanSpeedChange(speed)}
//                   disabled={!acState.power}
//                   sx={{ textTransform: 'capitalize' }}
//                 >
//                   {speed}
//                 </Button>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Swing Selection */}
//           <Typography variant="h6" align="center" gutterBottom>
//             Swing
//           </Typography>
//           <Grid container spacing={2}>
//             {['off', 'auto', 'horizontal', 'vertical'].map((swingOption) => (
//               <Grid item xs={3} key={swingOption}>
//                 <Button
//                   fullWidth
//                   variant={acState.swing === swingOption ? 'contained' : 'outlined'}
//                   onClick={() => handleSwingChange(swingOption)}
//                   disabled={!acState.power}
//                   sx={{ textTransform: 'capitalize' }}
//                 >
//                   {swingOption}
//                 </Button>
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </StyledCard>

//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={() => setSnackbarOpen(false)}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={() => setSnackbarOpen(false)} 
//           severity={snackbarSeverity}
//           sx={{ width: '100%' }}
//         >
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default ACControl;































// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, Typography, Grid, Button, IconButton, Paper, Box } from '@mui/material';
// import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
// import AddIcon from '@mui/icons-material/Add';
// import RemoveIcon from '@mui/icons-material/Remove';
// import AcUnitIcon from '@mui/icons-material/AcUnit';
// import WhatshotIcon from '@mui/icons-material/Whatshot';
// import ModeFanOffIcon from '@mui/icons-material/ModeFanOff';
// import BeachAccessIcon from '@mui/icons-material/BeachAccess';
// import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
// import { useParams } from 'react-router-dom';
// import CircularProgress from '@mui/material/CircularProgress';
// import { useWebSocket } from '../../context/useWebsocket';

// const ACControl = () => {
//   const { deviceId } = useParams();
//   const socket = useWebSocket();
//   const [acState, setAcState] = useState({
//     power: false,
//     currentTemperature: 25,
//     targetTemperature: 24,
//     humidity: 50,
//     mode: 'cool',
//     fanSpeed: 'medium',
//     swing: 'auto'
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!socket || !deviceId) return;

//     // Connect to the AC device
//     socket.emit('connect_ac_device', deviceId);

//     // Listen for state updates
//     const handleStateUpdate = ({ deviceId: updatedDeviceId, state }) => {
//       if (updatedDeviceId === deviceId) {
//         setAcState(state);
//         setLoading(false);
//         setError(null);
//       }
//     };

//     // Listen for errors
//     const handleError = ({ message }) => {
//       setError(message);
//       setLoading(false);
//     };

//     socket.on('ac_state', handleStateUpdate);
//     socket.on('ac_error', handleError);

//     return () => {
//       socket.off('ac_state', handleStateUpdate);
//       socket.off('ac_error', handleError);
//     };
//   }, [socket, deviceId]);

//   // Send command to the server
//   const sendCommand = (command, value) => {
//     if (!socket || !deviceId) return;
//     socket.emit('ac_command', {
//       deviceId,
//       command,
//       value
//     });
//   };

//   // Handle temperature change
//   const handleTemperatureChange = (action) => {
//     let newTemp = acState.targetTemperature;
//     if (action === 'increase' && newTemp < 30) {
//       newTemp += 1;
//     } else if (action === 'decrease' && newTemp > 16) {
//       newTemp -= 1;
//     }
//     sendCommand('temperature', newTemp);
//   };

//   // Handle power toggle
//   const handlePowerToggle = () => {
//     sendCommand('power', !acState.power);
//   };

//   // Handle mode change
//   const handleModeChange = (newMode) => {
//     sendCommand('mode', newMode);
//   };

//   // Handle fan speed change
//   const handleFanSpeedChange = (newSpeed) => {
//     sendCommand('fanSpeed', newSpeed);
//   };

//   // Handle swing mode change
//   const handleSwingChange = (newSwing) => {
//     sendCommand('swing', newSwing);
//   };

//   if (error) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <Typography color="error" variant="h6">{error}</Typography>
//       </Box>
//     );
//   }

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Card sx={{ maxWidth: 500, margin: 'auto', marginTop: 1, padding: 1 }}>
//       <CardContent>
//         <Typography variant="h5" component="div" align="center" gutterBottom>
//           AC Control (ID: {deviceId})
//         </Typography>

//         {/* Power Button */}
//         <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
//           <Grid item>
//             <Button
//               variant="contained"
//               color={acState.power ? 'primary' : 'secondary'}
//               startIcon={<PowerSettingsNewIcon />}
//               onClick={handlePowerToggle}
//             >
//               {acState.power ? 'ON' : 'OFF'}
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Current Temperature Display */}
//         <Box sx={{ textAlign: 'center' }}>
//           <Typography variant="h6">Current room temperature {acState.currentTemperature}°C</Typography>
//           <Typography variant="body2">Humidity: {acState.humidity}%</Typography>
//         </Box>

//         {/* Temperature Control */}
//         <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item>
//             <IconButton onClick={() => handleTemperatureChange('decrease')} disabled={!acState.power}>
//               <RemoveIcon />
//             </IconButton>
//           </Grid>
//           <Grid item>
//             <Paper elevation={3} sx={{ padding: 3, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//               <Typography variant="h4" align="center">{acState.targetTemperature}°C</Typography>
//             </Paper>
//           </Grid>
//           <Grid item>
//             <IconButton onClick={() => handleTemperatureChange('increase')} disabled={!acState.power}>
//               <AddIcon />
//             </IconButton>
//           </Grid>
//         </Grid>

//         {/* Mode Selection */}
//         <Typography variant="h6" align="center" gutterBottom>
//           Mode
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {['cool', 'heat', 'FAN_ONLY', 'dry', 'auto', 'off'].map((option) => {
//             let Icon;
//             switch (option) {
//               case 'cool': Icon = AcUnitIcon; break;
//               case 'heat': Icon = WhatshotIcon; break;
//               case 'FAN_ONLY': Icon = ModeFanOffIcon; break;
//               case 'dry': Icon = BeachAccessIcon; break;
//               case 'auto': Icon = SettingsInputAntennaIcon; break;
//               case 'off': Icon = PowerSettingsNewIcon; break;
//               default: Icon = AcUnitIcon;
//             }
//             return (
//               <Grid item xs={4} key={option}>
//                 <Button
//                   fullWidth
//                   variant={acState.mode === option ? 'contained' : 'outlined'}
//                   onClick={() => handleModeChange(option)}
//                   disabled={!acState.power && option !== 'off'}
//                   sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
//                 >
//                   <Icon fontSize="large" />
//                   <Typography variant="body2">{option.charAt(0).toUpperCase() + option.slice(1)}</Typography>
//                 </Button>
//               </Grid>
//             );
//           })}
//         </Grid>

//         {/* Fan Speed Selection */}
//         <Typography variant="h6" align="center" gutterBottom>
//           Fan Speed
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {['low', 'medium', 'high'].map((speed) => (
//             <Grid item xs={4} key={speed}>
//               <Button
//                 fullWidth
//                 variant={acState.fanSpeed === speed ? 'contained' : 'outlined'}
//                 onClick={() => handleFanSpeedChange(speed)}
//                 disabled={!acState.power}
//               >
//                 {speed.charAt(0).toUpperCase() + speed.slice(1)}
//               </Button>
//             </Grid>
//           ))}
//         </Grid>

//         {/* Swing Selection */}
//         <Typography variant="h6" align="center" gutterBottom>
//           Swing
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {['off', 'auto', 'horizontal', 'vertical'].map((swingOption) => (
//             <Grid item xs={4} key={swingOption}>
//               <Button
//                 fullWidth
//                 variant={acState.swing === swingOption ? 'contained' : 'outlined'}
//                 onClick={() => handleSwingChange(swingOption)}
//                 disabled={!acState.power}
//               >
//                 {swingOption.charAt(0).toUpperCase() + swingOption.slice(1)}
//               </Button>
//             </Grid>
//           ))}
//         </Grid>
//       </CardContent>
//     </Card>
//   );
// };

// export default ACControl;

















import React, { useState, useEffect } from 'react';

import { Card, CardContent, Typography, Grid, Button, IconButton, Paper, Box } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
// import FanIcon from '@mui/icons-material/Fan';
import ModeFanOffIcon from '@mui/icons-material/ModeFanOff';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import mqtt from 'mqtt';
import { useLocation } from 'react-router-dom'; // Import useLocation hook
import AddAirConditionerForm from './AcForm';
import CircularProgress from '@mui/material/CircularProgress';

const ACControl = () => {
  const location = useLocation();
  const device = location.state?.device;
  const [power, setPower] = useState(true);
  const [currentTemperature, setCurrentTemperature] = useState(25); // Default initial temperature
  const [targetTemperature, setTargetTemperature] = useState(24);
  const [humidity, setHumidity] = useState(50); // Default initial humidity
  const [mode, setMode] = useState('cool');
  const [fanSpeed, setFanSpeed] = useState('medium');
  const [swing, setSwing] = useState('auto');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
const mqttOptions={
  clean: false,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  reconnectPeriod: 1000,
  keepalive: 60,
  username: 'CloudIotAutomation',   
  password: 'CloudIotAutomation1710',  

}
  

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://attendance.thecloudserv.com:9001/ws', {
      clean: false,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      reconnectPeriod: 1000,
      keepalive: 60,
        username: 'mqtt',   
  password: 'iot199920',
    });
  
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(
        [
          `thecldiot/head_office_b17_b1/${device.deviceID}/current_temperature`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/current_humidity`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/action`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/fan_mode`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/mode`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/swing_mode`,
        `thecldiot/head_office_b17_b1/${device.deviceID}/target_temperature`
        ],
        { qos: 1 },
        (err, granted) => {
          if (err) {
            console.error('Subscription error:', err);
          } else {
            console.log('Subscribed to topics:', granted.map((g) => g.topic).join(', '));
          }
        }
      );
    });
  
    mqttClient.on('message', (topic, message) => {
      console.log(`Message received on ${topic}: ${message.toString()}`);

      switch (topic) {
        case `thecldiot/head_office_b17_b1/${device.deviceID}/current_temperature`:
          setCurrentTemperature(Number(message.toString())); // Update temperature state
          console.log('Current Temperature:', message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/current_humidity`:
          setHumidity(Number(message.toString())); // Update humidity state
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/action`:
          console.log('AC Action:', message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/fan_mode`:
          setFanSpeed(message.toString()); // Update fan mode state
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/mode`:
          setMode(message.toString());
          if(message.toString() === "off"){
            setPower(false);
            } else {
            setPower(true);
  
          }
          // Update mode state
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/swing_mode`:
          setSwing(message.toString()); // Update swing mode state
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/target_temperature`:
          setTargetTemperature(Number(message.toString())); // Update target temperature state
          break;
        default:
          console.log(`Unhandled topic: ${topic}`);
      }
      setLoading(false);
    });
  
    mqttClient.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });
  
    mqttClient.on('disconnect', (packet) => {
      console.log('Disconnected from broker:', packet);
    });
  
    mqttClient.on('reconnect', () => {
      console.log('Reconnecting to MQTT broker...');
    });
  
    setClient(mqttClient);
  
    return () => {
      if (mqttClient) {
        mqttClient.end(true);
      }
    };
  }, [device.deviceID]);
  



  // Handle sending MQTT messages for each action
  // const sendMQTTMessage = (topic, message) => {
  //   if (client) {
  //     client.publish(topic, message, { qos: 1 }, (err) => {
  //       if (err) {
  //         console.error('Error sending MQTT message', err);
  //       }
  //     });
  //   }
  // };

  const sendMQTTMessage=(topic,message)=>{
    if(!client){
      console.error("MQTT client is not initialized. Call connectMQTT first.")
    } else
    {
      client.publish(topic,message,{qos:0},(err)=>{
        if(err){
          console.error('Error sending MQTT message', err);
        }
      });
    }
  }
  // Handle temperature change (increase/decrease)
  const handleTemperatureChange = (action) => {
    let newTemp = targetTemperature;
    if (action === 'increase' && newTemp < 30) {
      newTemp += 1;
    } else if (action === 'decrease' && newTemp > 16) {
      newTemp -= 1;
    }
    setTargetTemperature(newTemp);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_temperature`, newTemp.toString());
  };

  // Handle power toggle
  const handlePowerToggle = () => {
    setPower(!power);
    const topic = power ? `thecldiot/head_office_b17_b1/${device.deviceID}/off` : `thecldiot/head_office_b17_b1/${device.deviceID}/on`;
    sendMQTTMessage(topic, power ? 'OFF' : 'ON');
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_mode`, newMode);
  };

  // Handle fan speed change
  const handleFanSpeedChange = (newSpeed) => {
    setFanSpeed(newSpeed);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_fan_mode`, newSpeed);
  };

  // Handle swing mode change
  const handleSwingChange = (newSwing) => {
    setSwing(newSwing);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_swing_mode`, newSwing);
  };

  return (
    <>
    {loading ? (
    <Box sx={{display:"flex", justifyContent:"center", alignItems:"center",height:"100vh"}}>
      <CircularProgress/>
    </Box>

    ):
    ( 
    <Card sx={{ maxWidth: 500, margin: 'auto', marginTop: 1, padding: 1 }}>
      <CardContent>
        <Typography variant="h5" component="div" align="center" gutterBottom>
          {device.devicename} Ac
        </Typography>

        {/* Power Button */}
        <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
          <Grid item>
            <Button
              variant="contained"
              color={power ? 'primary' : 'secondary'}
              startIcon={<PowerSettingsNewIcon />}
              onClick={handlePowerToggle}
            >
              {power ? 'ON' : 'OFF'}
            </Button>
          </Grid>
        </Grid>

 {/* Current Temperature and Humidity Display */}
 <Box sx={{ textAlign: 'center',}}>
            <Typography variant="h6">Current room temperature {currentTemperature}°C </Typography>
            {/* <Typography variant="h6">{currentTemperature}°C</Typography> */}
            
          </Box>
        {/* Temperature Control with Circular Display */}
        <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ marginBottom: 3 }}>
          <Grid item>
            <IconButton onClick={() => handleTemperatureChange('decrease')} disabled={!power}>
              <RemoveIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h4" align="center">{targetTemperature}°C</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <IconButton onClick={() => handleTemperatureChange('increase')} disabled={!power}>
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>

        {/* Mode Selection with Icons */}
        <Typography variant="h6" align="center" gutterBottom>
          Mode
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {['cool', 'heat', 'FAN_ONLY', 'dry', 'auto',"off"].map((option) => {
            let Icon;
            switch(option) {
              case 'cool': Icon = AcUnitIcon; break;
              case 'heat': Icon = WhatshotIcon; break;
              case 'FAN_ONLY': Icon = ModeFanOffIcon; break;
              case 'dry': Icon = BeachAccessIcon; break;
              case 'auto': Icon = SettingsInputAntennaIcon; break;
              case 'off': Icon = PowerSettingsNewIcon; break;
              default: Icon = AcUnitIcon;
            }
            return (
              <Grid item xs={4} key={option}>
                <Button
                  fullWidth
                  variant={mode === option ? 'contained' : 'outlined'}
                  onClick={() => handleModeChange(option)}
                  disabled={!power}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Icon fontSize="large" />
                  <Typography variant="body2">{option.charAt(0).toUpperCase() + option.slice(1)}</Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {/* Fan Speed Selection */}
        <Typography variant="h6" align="center" gutterBottom>
          Fan Speed
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {['Low', 'Medium', 'High'].map((speed) => (
            <Grid item xs={4} key={speed}>
              <Button
                fullWidth
                variant={fanSpeed.toLowerCase() === speed.toLowerCase() ? 'contained' : 'outlined'}
                onClick={() => handleFanSpeedChange(speed.toLowerCase())}
                disabled={!power}
              >
                {speed}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Swing Selection */}
        <Typography variant="h6" align="center" gutterBottom>
          Swing
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {[ 'OFF', 'Auto', 'Horizontal', 'Vertical'].map((swingOption) => (
            <Grid item xs={4} key={swingOption}>
              <Button
                fullWidth
                variant={swing.toLowerCase() === swingOption.toLowerCase() ? 'contained' : 'outlined'}
                onClick={() => handleSwingChange(swingOption.toLowerCase())}
                disabled={!power}
              >
                {swingOption}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
    )}
    <AddAirConditionerForm/>
  
      </>
  );
};

export default ACControl;
