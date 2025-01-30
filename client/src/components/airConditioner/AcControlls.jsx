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

  

  useEffect(() => {
    const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
      clean: false,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      reconnectPeriod: 1000,
      keepalive: 60,
    });
  
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(
        [
          `thecld/${device.deviceID}/au/ac/current_temperature`,
        `thecld/${device.deviceID}/au/ac/current_humidity`,
        `thecld/${device.deviceID}/au/ac/action`,
        `thecld/${device.deviceID}/au/ac/fan_mode`,
        `thecld/${device.deviceID}/au/ac/mode`,
        `thecld/${device.deviceID}/au/ac/swing_mode`,
        `thecld/${device.deviceID}/au/ac/target_temperature`
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
        case `thecld/${device.deviceID}/au/ac/current_temperature`:
          setCurrentTemperature(Number(message.toString())); // Update temperature state
          console.log('Current Temperature:', message.toString());
          break;
        case `thecld/${device.deviceID}/au/ac/current_humidity`:
          setHumidity(Number(message.toString())); // Update humidity state
          break;
        case `thecld/${device.deviceID}/au/ac/action`:
          console.log('AC Action:', message.toString());
          break;
        case `thecld/${device.deviceID}/au/ac/fan_mode`:
          setFanSpeed(message.toString()); // Update fan mode state
          break;
        case `thecld/${device.deviceID}/au/ac/mode`:
          setMode(message.toString());
          if(message.toString() === "off"){
            setPower(false);
            } else {
            setPower(true);
  
          }
          // Update mode state
          break;
        case `thecld/${device.deviceID}/au/ac/swing_mode`:
          setSwing(message.toString()); // Update swing mode state
          break;
        case `thecld/${device.deviceID}/au/ac/target_temperature`:
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
    sendMQTTMessage(`thecld/${device.deviceID}/au/set_temperature`, newTemp.toString());
  };

  // Handle power toggle
  const handlePowerToggle = () => {
    setPower(!power);
    const topic = power ? `thecld/${device.deviceID}/au/ac/off` : `thecld/${device.deviceID}/au/ac/on`;
    sendMQTTMessage(topic, power ? 'OFF' : 'ON');
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    sendMQTTMessage(`thecld/${device.deviceID}/au/set_mode`, newMode);
  };

  // Handle fan speed change
  const handleFanSpeedChange = (newSpeed) => {
    setFanSpeed(newSpeed);
    sendMQTTMessage(`thecld/${device.deviceID}/au/set_fan_mode`, newSpeed);
  };

  // Handle swing mode change
  const handleSwingChange = (newSwing) => {
    setSwing(newSwing);
    sendMQTTMessage(`thecld/${device.deviceID}/au/set_swing_mode`, newSwing);
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






