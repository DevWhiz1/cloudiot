

import React, { useState } from "react";
import { TextField, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, Fab } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
const ApiUrl= process.env.REACT_APP_API_URL;
const AddAirConditionerForm = () => {
  const [devicename, setDevicename] = useState("");
  const [deviceID, setDeviceID] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${ApiUrl}/ac/addnew`, {
        devicename,
        deviceID,
      });
      console.log("Device added:", response.data);
      setDevicename("");
      setDeviceID("");
      // setOpen(false);
    } catch (err) {
      setError("Error adding device: " + err.response.data.error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true); // Open modal
  };

  const handleClose = () => {
    setOpen(false); // Close modal
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClickOpen}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog - Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: 400 }}>
            <TextField
              label="Device Name"
              variant="outlined"
              fullWidth
              value={devicename}
              onChange={(e) => setDevicename(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              label="Device ID"
              variant="outlined"
              fullWidth
              value={deviceID}
              onChange={(e) => setDeviceID(e.target.value)}
              margin="normal"
              required
            />
            {error && <div style={{ color: "red" }}>{error}</div>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" onClick={handleSubmit}>
            Add Device
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddAirConditionerForm;

























// import React from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import axios from 'axios';
// import {
//   TextField,
//   Button,
//   Grid,
//   Paper,
//   Typography,
//   Box,
// } from '@mui/material';

// const AirConditionerForm = () => {
//   const formik = useFormik({
//     initialValues: {
//       Devicename: '',
//       power: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//       mode: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//       targetTemperature: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//       currentTemperature: {
//         subscribeTopic: '',
        
//       },
//       swingMode: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//       fanMode: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//       currentHumidity: {
//         subscribeTopic: '',
        
//       },
//       presetState: {
//         subscribeTopic: '',
//         publishTopic: '',
//       },
//     },
//     validationSchema: Yup.object({
//       Devicename: Yup.string().required('Device name is required'),
//       power: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//       mode: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//       targetTemperature: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//       currentTemperature: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
        
//       }),
//       swingMode: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//       fanMode: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//       currentHumidity: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
       
//       }),
//       presetState: Yup.object({
//         subscribeTopic: Yup.string().required('Subscribe topic is required'),
//         publishTopic: Yup.string().required('Publish topic is required'),
//       }),
//     }),
//     onSubmit: async (values) => {
//       try {
//         const response = await axios.post('http://localhost:5000/user/acsave', values);
//         console.log('Success:', response.data);
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     },
//   });

//   return (
//     <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
//       <Typography variant="h4" gutterBottom align="center">
//         Air Conditioner Control
//       </Typography>
//       <form onSubmit={formik.handleSubmit}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               id="Devicename"
//               name="Devicename"
//               label="Device Name"
//               value={formik.values.Devicename}
//               onChange={formik.handleChange}
//               error={formik.touched.Devicename && Boolean(formik.errors.Devicename)}
//               helperText={formik.touched.Devicename && formik.errors.Devicename}
//             />
//           </Grid>

//           <Grid item xs={12} container spacing={3}>
//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Power</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="power.subscribeTopic"
//                       name="power.subscribeTopic"
//                       label="Power Subscribe Topic"
//                       value={formik.values.power.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.power?.subscribeTopic && Boolean(formik.errors.power?.subscribeTopic)}
//                       helperText={formik.touched.power?.subscribeTopic && formik.errors.power?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="power.publishTopic"
//                       name="power.publishTopic"
//                       label="Power Publish Topic"
//                       value={formik.values.power.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.power?.publishTopic && Boolean(formik.errors.power?.publishTopic)}
//                       helperText={formik.touched.power?.publishTopic && formik.errors.power?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Mode</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="mode.subscribeTopic"
//                       name="mode.subscribeTopic"
//                       label="Mode Subscribe Topic"
//                       value={formik.values.mode.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.mode?.subscribeTopic && Boolean(formik.errors.mode?.subscribeTopic)}
//                       helperText={formik.touched.mode?.subscribeTopic && formik.errors.mode?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="mode.publishTopic"
//                       name="mode.publishTopic"
//                       label="Mode Publish Topic"
//                       value={formik.values.mode.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.mode?.publishTopic && Boolean(formik.errors.mode?.publishTopic)}
//                       helperText={formik.touched.mode?.publishTopic && formik.errors.mode?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Target Temperature</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="targetTemperature.subscribeTopic"
//                       name="targetTemperature.subscribeTopic"
//                       label="Target Temperature Subscribe Topic"
//                       value={formik.values.targetTemperature.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.targetTemperature?.subscribeTopic && Boolean(formik.errors.targetTemperature?.subscribeTopic)}
//                       helperText={formik.touched.targetTemperature?.subscribeTopic && formik.errors.targetTemperature?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="targetTemperature.publishTopic"
//                       name="targetTemperature.publishTopic"
//                       label="Target Temperature Publish Topic"
//                       value={formik.values.targetTemperature.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.targetTemperature?.publishTopic && Boolean(formik.errors.targetTemperature?.publishTopic)}
//                       helperText={formik.touched.targetTemperature?.publishTopic && formik.errors.targetTemperature?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

           

//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Swing Mode</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="swingMode.subscribeTopic"
//                       name="swingMode.subscribeTopic"
//                       label="Swing Mode Subscribe Topic"
//                       value={formik.values.swingMode.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.swingMode?.subscribeTopic && Boolean(formik.errors.swingMode?.subscribeTopic)}
//                       helperText={formik.touched.swingMode?.subscribeTopic && formik.errors.swingMode?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="swingMode.publishTopic"
//                       name="swingMode.publishTopic"
//                       label="Swing Mode Publish Topic"
//                       value={formik.values.swingMode.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.swingMode?.publishTopic && Boolean(formik.errors.swingMode?.publishTopic)}
//                       helperText={formik.touched.swingMode?.publishTopic && formik.errors.swingMode?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Fan Mode</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="fanMode.subscribeTopic"
//                       name="fanMode.subscribeTopic"
//                       label="Fan Mode Subscribe Topic"
//                       value={formik.values.fanMode.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.fanMode?.subscribeTopic && Boolean(formik.errors.fanMode?.subscribeTopic)}
//                       helperText={formik.touched.fanMode?.subscribeTopic && formik.errors.fanMode?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="fanMode.publishTopic"
//                       name="fanMode.publishTopic"
//                       label="Fan Mode Publish Topic"
//                       value={formik.values.fanMode.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.fanMode?.publishTopic && Boolean(formik.errors.fanMode?.publishTopic)}
//                       helperText={formik.touched.fanMode?.publishTopic && formik.errors.fanMode?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>

            

//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Preset State</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="presetState.subscribeTopic"
//                       name="presetState.subscribeTopic"
//                       label="Preset State Subscribe Topic"
//                       value={formik.values.presetState.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.presetState?.subscribeTopic && Boolean(formik.errors.presetState?.subscribeTopic)}
//                       helperText={formik.touched.presetState?.subscribeTopic && formik.errors.presetState?.subscribeTopic}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="presetState.publishTopic"
//                       name="presetState.publishTopic"
//                       label="Preset State Publish Topic"
//                       value={formik.values.presetState.publishTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.presetState?.publishTopic && Boolean(formik.errors.presetState?.publishTopic)}
//                       helperText={formik.touched.presetState?.publishTopic && formik.errors.presetState?.publishTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Current Temperature</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="currentTemperature.subscribeTopic"
//                       name="currentTemperature.subscribeTopic"
//                       label="Current Temperature Subscribe Topic"
//                       value={formik.values.currentTemperature.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.currentTemperature?.subscribeTopic && Boolean(formik.errors.currentTemperature?.subscribeTopic)}
//                       helperText={formik.touched.currentTemperature?.subscribeTopic && formik.errors.currentTemperature?.subscribeTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 2 }}>
//                 <Typography variant="h6" gutterBottom>Current Humidity</Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       id="currentHumidity.subscribeTopic"
//                       name="currentHumidity.subscribeTopic"
//                       label="Current Humidity Subscribe Topic"
//                       value={formik.values.currentHumidity.subscribeTopic}
//                       onChange={formik.handleChange}
//                       error={formik.touched.currentHumidity?.subscribeTopic && Boolean(formik.errors.currentHumidity?.subscribeTopic)}
//                       helperText={formik.touched.currentHumidity?.subscribeTopic && formik.errors.currentHumidity?.subscribeTopic}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>
//             <Grid item xs={12}>
//               <Button 
//                 color="primary" 
//                 variant="contained" 
//                 fullWidth 
//                 type="submit"
//                 sx={{ mt: 2 }}
//               >
//                 Submit Configuration
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </form>
//     </Paper>
//   );
// };

// export default AirConditionerForm;


