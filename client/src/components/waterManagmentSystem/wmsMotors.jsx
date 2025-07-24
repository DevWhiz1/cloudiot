import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Box,
  Divider,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Switch,
  Paper,
  Badge,
  Stack
} from '@mui/material';
import { 
  ElectricBolt as PowerIcon,
  Waves as WaterIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Opacity as FlowIcon,
  DeviceThermostat as TempIcon,
  Sensors as SensorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

const ApiUrl = process.env.REACT_APP_API_URL;

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'ON' ? theme.palette.success.main : theme.palette.error.main,
    color: status === 'ON' ? theme.palette.success.contrastText : theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'ON' ? `${pulse} 2s infinite` : 'none',
      border: status === 'ON' ? '1px solid currentColor' : 'none',
      content: '""',
    }
  }
}));

const WaterManagementSystem = () => {
  const [motors, setMotors] = useState([]);
  const [pulseCounters, setPulseCounters] = useState([]);
  const [wmsEntities, setWmsEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const motorsRes = await fetch(`${ApiUrl}/wms/motors`);
        const motorsData = await motorsRes.json();
        setMotors(motorsData);
        
        const pulseRes = await fetch(`${ApiUrl}/wms/wfs/pulse/counter`);
        const pulseData = await pulseRes.json();
        setPulseCounters(pulseData);
        
        const wmsRes = await fetch(`${ApiUrl}/wms/get-all-wms-entities`);
        const wmsData = await wmsRes.json();
        if (wmsRes.ok) {
          setWmsEntities(wmsData.data);
        } else {
          throw new Error(wmsData.error || "Failed to fetch WMS entities");
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStateColor = (state) => {
    if (state === "ON") return theme.palette.success.main;
    if (state === "OFF") return theme.palette.error.main;
    if (!isNaN(state)) return theme.palette.info.main;
    return theme.palette.warning.main;
  };

  const renderEntityCard = (entity, icon, color, isPulse = false) => (
    <Grid item xs={12} key={entity._id}>
      <StyledCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <StatusBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                status={entity.state}
              >
                <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                  {React.cloneElement(icon, { fontSize: "medium" })}
                </Avatar>
              </StatusBadge>
              <Box ml={2}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {entity.deviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {entity.entityName}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"    
              size="small"
              endIcon={<InfoIcon />} 
              onClick={() => {
                if (isPulse) {
                  navigate(`/entities/history/detail/${entity._id}`);
                } else {
                  navigate(`/wms/motors/history/detail/${entity._id}}`, {
                    state: {
                      deviceName: entity.deviceName,
                      entityName: entity.entityName,
                      state: entity.state,
                      entityId: entity._id,
                    },
                  });
                }
              }}
            >
              More Details
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Grid>
  );

  const renderStatusItem = (entity) => (
    <Box
      key={entity._id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        mb: 1,
        backgroundColor: theme.palette.grey[100],
        borderRadius: 1
      }}
    >
      <Box display="flex" alignItems="center">
        {entity.stateType === "switch" ? (
          <SensorIcon sx={{ mr: 1.5, color: getStateColor(entity.state) }} />
        ) : entity.entityName.includes('Water Level') ? (
          <WaterIcon sx={{ mr: 1.5, color: getStateColor(entity.state) }} />
        ) : (
          <FlowIcon sx={{ mr: 1.5, color: getStateColor(entity.state) }} />
        )}
        <Typography variant="body2">
          {entity.entityName}
        </Typography>
      </Box>
      {entity.stateType === "switch" ? (
        <Switch
          size="small"
          checked={entity.state === 'ON'}
          onChange={() => console.log(`Toggling ${entity.entityName}`)}
          color={entity.state === 'ON' ? 'success' : 'default'}
        />
      ) : (
        <Chip
          label={entity.state}
          size="small"
          sx={{
            backgroundColor: getStateColor(entity.state),
            color: theme.palette.getContrastText(getStateColor(entity.state)),
            minWidth: 60
          }}
        />
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Water Management System...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <WaterIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        Water Management System
        <Chip label="B17" color="primary" variant="outlined" sx={{ ml: 2 }} />
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Column - Motors and Sensors */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PowerIcon color="primary" sx={{ mr: 1 }} />
              Motor Controllers
            </Typography>
            <Grid container spacing={2}>
              {motors.map(motor => renderEntityCard(
                motor,
                <PowerIcon />,
                theme.palette.primary.light
              ))}
            </Grid>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <FlowIcon color="secondary" sx={{ mr: 1 }} />
              Flow Sensors
            </Typography>
            <Grid container spacing={2}>
              {pulseCounters.map(counter => renderEntityCard(
                counter,
                <FlowIcon />,
                theme.palette.secondary.light,
                true // isPulse
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right Column - System Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <SettingsIcon color="action" sx={{ mr: 1 }} />
              System Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {wmsEntities.map(entity => renderStatusItem(entity))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WaterManagementSystem;