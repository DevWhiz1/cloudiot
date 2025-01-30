import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  ElectricMeter as MeterIcon,
  Share as ShareIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AirConditioner from "../airConditioner/AcForm"
const ApiUrl = process.env.REACT_APP_API_URL;

const EnergyMeters = () => {
  const [energyMeters, setEnergyMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchEnergyMeters = async () => {
      try {
        const response = await fetch(`${ApiUrl}/energy/meters`);
        const data = await response.json();
        setEnergyMeters(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch energy meters.");
        setLoading(false);
      }
    };

    fetchEnergyMeters();
  }, []);

  const getTotalEnergy = () => {
    return energyMeters.reduce((total, meter) => total + parseInt(meter.state, 10), 0);
  };

  // Function to determine color based on energy state
  const getStateColor = (state) => {
    const value = parseInt(state, 10);
    if (value > 400) return theme.palette.error.main;
    if (value > 300) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  if (loading) {
    return (
     
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading energy meters data...
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
    <>
    <AirConditioner/>
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Energy Meters Dashboard
      </Typography>
      
      <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <MeterIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5">
              Total Energy Consumption: {getTotalEnergy()} Wh
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {energyMeters.map((meter) => (
          <Grid item xs={12} sm={6} md={4} key={meter._id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box position="relative" display="inline-flex" mr={2}>
                    <CircularProgress
                      variant="determinate"
                      value={(parseInt(meter.state, 10) / 500) * 100}
                      size={60}
                      sx={{ color: getStateColor(meter.state) }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {meter.state}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {meter.deviceName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meter.entityName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<InfoIcon />}
                  onClick={() => navigate(`/energy/meters/detail/${meter._id}`, {
                    state: {
                      deviceName: meter.deviceName,
                      entityName: meter.entityName,
                      state: meter.state,
                      meterId: meter._id,
                    },
                  })}
                >
                  More Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    </>
  );
};

export default EnergyMeters;