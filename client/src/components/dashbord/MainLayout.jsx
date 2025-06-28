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
  Grid,
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Switch,
  Tooltip,
  IconButton,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import Slider from '@mui/material/Slider';
import WfsPulseCounter from '../waterManagmentSystem/WfsPulseCounter';

const IOTDashboard = () => {
  const [socket, setSocket] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const ApiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const socket = io(`${ApiUrl}`);
    setSocket(socket);

    socket.on('initial_state', (data) => {
      setDevices(data.devices);
      setLoading(false);
    });

    socket.on('state_update', ({ entityId, state }) => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => ({
          ...device,
          entities: device.entities.map((entity) =>
            entity._id === entityId ? { ...entity, state } : entity
          ),
        }))
      );
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
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

  if (loading) return <div>Loading...</div>;

  return (
    <>
    {/* <WfsPulseCounter/> */}
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'space-between',
        }}
      >
        {devices.map((device) => (
          <Card
            key={device._id}
            sx={{
              flex: '1 1 calc(25% - 16px)',
              minWidth: '300px',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <CardHeader
              action={
                <Tooltip title="More Options">
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              }
              title={device.deviceName}
            />
            <CardContent>
              {device.entities.map((entity) => (
                <Box
                  key={entity._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <OnlinePredictionIcon sx={{ mr: 2 }} />
                  <Typography variant="body1">{entity.entityName}</Typography>

                  {entity.stateType === "switch" ? (
                    <Switch
                      sx={{ ml: 'auto' }}
                      checked={entity.state === 'ON'}
                      onChange={() =>
                        handleEntityUpdate(
                          entity.publishTopic,
                          entity.state === 'ON' ? 'OFF' : 'ON'
                        )
                      }
                    />
                  ) : entity.stateType === "dimmer" ? (
                    <Slider
                      sx={{ ml: 'auto', width: '100px' }}
                      defaultValue={parseInt(entity.state)}
                      aria-label="speed"
                      valueLabelDisplay="auto"
                      // marks
                      min={0}
                      max={100}
                      onChange={(e, value) =>
                        handleEntityUpdate(entity.publishTopic, value)
                      }
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        ml: 'auto',
                        fontSize: '16px',
                      }}
                    >
                      {entity.state}
                    </Typography>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
    </>
  );
};

export default IOTDashboard;