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
  useTheme,
  Switch
} from '@mui/material';
import { 
  ElectricMeter as MeterIcon,
  Share as ShareIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import WfsPulseCounter from './WfsPulseCounter';
const ApiUrl = process.env.REACT_APP_API_URL;


const WmsMotorsComponent = () => {
  const [Entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const [wmsEntities, setWmsEntities] = useState([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch(`${ApiUrl}/wms/motors`);
        const data = await response.json();
        setEntities(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch energy meters.");
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);
useEffect(()=>{
  const fetchAllWmsEntities = async()=>{
    try{
      const response= await fetch(`${ApiUrl}/wms/get-all-wms-entities`);
      const data= await response.json();
      if(response.ok){
        setWmsEntities(data.data);
        setLoading(false);
        console.log("WMS Entities fetched successfully:", data.data);
      }
      else{
        setError(data.error || "Failed to fetch WMS entities.");
        setLoading(false);
      }

    
  }catch(error){
setError("Failed to fetch all WMS entities.");
setLoading(false);
    }
  }
  fetchAllWmsEntities();
},[]);

  const getStateColor = (state) => {
    if (state === "ON") return theme.palette.success.main;
    if (state === "OFF") return theme.palette.error.main;
    return '#482880';
  };
  
  // Function to determine the progress value based on energy state
  const getProgressValue = (state) => {
    if (state === "ON" || state === "OFF") return 100;
    else
    return 0;
    };
  if (loading) {
    return (
     
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Entities data...
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
   
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Water Managment System
      </Typography>
      
      <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <MeterIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5">
             All Motors
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {Entities.map((entity) => (
          <Grid item xs={12} sm={6} md={4} key={entity._id}>
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
                value={getProgressValue(entity.state)}
                size={60}
                sx={{ color: getStateColor(entity.state) }}
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
                        {entity.state}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {entity.deviceName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entity.entityName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<InfoIcon />}
                  onClick={() => navigate(`/wms/motors/history/detail/${entity._id}`, {
                    state: {
                      deviceName: entity.deviceName,
                      entityName: entity.entityName,
                      state: entity.state,
                      entityId: entity._id,
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
    <WfsPulseCounter/>
  <CardContent>
  {wmsEntities.map((entity) => (
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
            console.log(
              `Toggling ${entity.entityName} to ${entity.state === 'ON' ? 'OFF' : 'ON'}`
            )
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


    </>
  );
};

export default WmsMotorsComponent;