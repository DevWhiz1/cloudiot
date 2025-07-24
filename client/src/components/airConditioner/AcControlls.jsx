
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
import ModeFanOffIcon from '@mui/icons-material/ModeFanOff';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import mqtt from 'mqtt';
import { useLocation } from 'react-router-dom';
import AddAirConditionerForm from './AcForm';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ACControl = () => {
  const location = useLocation();
  const device = location.state?.device;
  const [power, setPower] = useState(true);
  const [currentTemperature, setCurrentTemperature] = useState(25);
  const [targetTemperature, setTargetTemperature] = useState(24);
  const [humidity, setHumidity] = useState(50);
  const [mode, setMode] = useState('cool');
  const [fanSpeed, setFanSpeed] = useState('medium');
  const [swing, setSwing] = useState('auto');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const ApiUrl = process.env.REACT_APP_API_URL;
  const MqttBrokerUrl = process.env.REACT_APP_MQTT_BROKER_URL;
  const MqttPortWs = process.env.REACT_APP_MQTT_BROKER_PORT_WS;
  const MqttUsername = process.env.REACT_APP_MQTT_USERNAME;
  const MqttPassword = process.env.REACT_APP_MQTT_PASSWORD;
  
  const mqttOptions = {
    clean: false,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    reconnectPeriod: 1000,
    keepalive: 60,
    username: `${MqttUsername}`,
    password: `${MqttPassword}`,
  };

  // Fetch historical data when date changes
  const fetchHistoryData = async (date) => {
    try {
      setHistoryLoading(true);
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await fetch(
        `${ApiUrl}/ac/air-conditioner-history/${device._id}?date=${formattedDate}`
      );
      const data = await response.json();
      
      // Process the data for the chart
      const processedData = data.data.map(item => ({
        time: dayjs(item.timestamp).format('HH:mm'),
        mode: item.mode,
        // For numerical representation in the chart
        modeValue: getModeValue(item.mode)
      }));
      
      setHistoryData(processedData);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Helper function to convert mode to numerical value for the chart
  const getModeValue = (mode) => {
    switch (mode) {
      case 'off': return 0;
      case 'cool': return 1;
      case 'heat': return 2;
      case 'dry': return 3;
      case 'fan_only': return 4;
      case 'auto': return 5;
      default: return 0;
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchHistoryData(newDate);
  };

  useEffect(() => {
    // Fetch history for current date when component mounts
    fetchHistoryData(selectedDate);
    
    const mqttClient = mqtt.connect(`wss://${MqttBrokerUrl}:${MqttPortWs}/ws`, {
      clean: false,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      reconnectPeriod: 1000,
      keepalive: 60,
      username: `${MqttUsername}`,
      password: `${MqttPassword}`,
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
          setCurrentTemperature(Number(message.toString()));
          console.log('Current Temperature:', message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/current_humidity`:
          setHumidity(Number(message.toString()));
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/action`:
          console.log('AC Action:', message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/fan_mode`:
          setFanSpeed(message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/mode`:
          setMode(message.toString());
          if (message.toString() === "off") {
            setPower(false);
          } else {
            setPower(true);
          }
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/swing_mode`:
          setSwing(message.toString());
          break;
        case `thecldiot/head_office_b17_b1/${device.deviceID}/target_temperature`:
          setTargetTemperature(Number(message.toString()));
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

  const sendMQTTMessage = (topic, message) => {
    if (!client) {
      console.error("MQTT client is not initialized. Call connectMQTT first.")
    } else {
      client.publish(topic, message, { qos: 0 }, (err) => {
        if (err) {
          console.error('Error sending MQTT message', err);
        }
      });
    }
  };

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

  const handlePowerToggle = () => {
    const newPowerState = !power;
    setPower(newPowerState);
    const topic = `thecldiot/head_office_b17_b1/${device.deviceID}/power`;
    const payload = newPowerState ? 'ON' : 'OFF';
    sendMQTTMessage(topic, payload);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_mode`, newMode);
  };

  const handleFanSpeedChange = (newSpeed) => {
    setFanSpeed(newSpeed);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_fan_mode`, newSpeed);
  };

  const handleSwingChange = (newSwing) => {
    setSwing(newSwing);
    sendMQTTMessage(`thecldiot/head_office_b17_b1/${device.deviceID}/set_swing_mode`, newSwing);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p>{`Time: ${label}`}</p>
          <p>{`Mode: ${data.mode}`}</p>
        </div>
      );
    }
    return null;
  };

  // Customized Y-axis tick formatter
  const renderYAxisTick = (value) => {
    switch (value) {
      case 0: return 'Off';
      case 1: return 'Cool';
      case 2: return 'Heat';
      case 3: return 'Dry';
      case 4: return 'Fan';
      case 5: return 'Auto';
      default: return '';
    }
  };

  return (
    <>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ padding: 2 }}>
          {/* Left side - Controls */}
          <Grid item xs={12} md={6}>
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  {device.devicename} Control
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

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Current room temperature {currentTemperature}°C</Typography>
                </Box>

                {/* Temperature Control */}
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

                {/* Mode Selection */}
                <Typography variant="h6" align="center" gutterBottom>
                  Mode
                </Typography>
                <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                  {['cool', 'heat', 'FAN_ONLY', 'dry', 'auto', "off"].map((option) => {
                    let Icon;
                    switch (option) {
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
                  {['OFF', 'Auto', 'Horizontal', 'Vertical'].map((swingOption) => (
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
          </Grid>

          {/* Right side - History Graph */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Usage History
                </Typography>
                
                {/* Date Picker */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      maxDate={dayjs()}
                    />
                  </LocalizationProvider>
                </Box>

                {historyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <CircularProgress />
                  </Box>
                ) : historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={historyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis 
                        domain={[0, 5]} 
                        tickFormatter={renderYAxisTick}
                        ticks={[0, 1, 2, 3, 4, 5]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="modeValue"
                        name="AC Mode"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body1" align="center" sx={{ mt: 5 }}>
                    No data available for the selected date
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <AddAirConditionerForm />
    </>
  );
};

export default ACControl;