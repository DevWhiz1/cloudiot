import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import PowerIcon from "@mui/icons-material/Power"; // On/Off icon
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useNavigate } from "react-router-dom"; // Correct import
import AddAirConditionerForm from "./AcForm";
const ApiUrl= process.env.REACT_APP_API_URL;
const AllAirConditioner = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Correct way to use the hook

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(`${ApiUrl}/ac/get/allac`);
        setDevices(response.data.data);
      } catch (err) {
        setError("Error fetching devices");
      }
    };

    fetchDevices();
  }, []);

  // Handle box click and navigate to the details page
  const handleDeviceClick = (device) => {
    navigate(`/ac/dashbord/device/controll/${device._id}`, { state: { device } }); // Use the navigate hook to go to the device details page
  };

  return (
    <>
    <Box sx={{ padding: 2 }}>
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={4} md={4} key={device._id}>
            <Card
              sx={{
                height: 250,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: device.power === "on" ? "#e3f2fd" : "#f5f5f5", // Change background based on power state
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleDeviceClick(device)} // Handle click to navigate
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" component="div" gutterBottom>
                  {device.devicename}
                  {device.deviceID}
                </Typography>

                {/* Icon based on power state */}
                <AcUnitIcon
                  sx={{
                    fontSize: 40,
                    color: device.power === "on" ? "#4caf50" : "#d32f2f", // Green for on, red for off
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  Power: {device.power}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    <AddAirConditionerForm/>
    </>
  );
};

export default AllAirConditioner;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
// import PowerIcon from "@mui/icons-material/Power";
// import AcUnitIcon from '@mui/icons-material/AcUnit';
// import { useNavigate } from "react-router-dom";
// import AddAirConditionerForm from "./AcForm";
// import { useWebSocket } from "../../context/useWebsocket"; // Correct import for WebSocket context

// const ApiUrl = process.env.REACT_APP_API_URL;

// const AllAirConditioner = () => {
//   const [devices, setDevices] = useState([]);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const socket = useWebSocket();

//   // Fetch devices on component mount
//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const response = await axios.get(`${ApiUrl}/ac/get/allac`);
//         setDevices(response.data.data);
//       } catch (err) {
//         setError("Error fetching devices");
//       }
//     };

//     fetchDevices();
//   }, []);

//   // Set up WebSocket listeners for real-time updates
//   useEffect(() => {
//     if (!socket) return;

//     const handleDeviceUpdate = (updatedDevice) => {
//       setDevices(prevDevices => 
//         prevDevices.map(device => 
//           device._id === updatedDevice._id ? updatedDevice : device
//         )
//       );
//     };

//     socket.on('device_update', handleDeviceUpdate);

//     return () => {
//       socket.off('device_update', handleDeviceUpdate);
//     };
//   }, [socket]);

//   // Handle box click and navigate to the details page
//   const handleDeviceClick = (device) => {
//     // Only pass the ID, not the entire device object
//     navigate(`/ac/dashbord/device/controll/${device.deviceId}`);
//   };

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         {error && <Typography color="error">{error}</Typography>}

//         <Grid container spacing={3}>
//           {devices.map((device) => (
//             <Grid item xs={12} sm={4} md={4} key={device._id}>
//               <Card
//                 sx={{
//                   height: 250,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   cursor: "pointer",
//                   backgroundColor: device.power === "on" ? "#e3f2fd" : "#f5f5f5",
//                   boxShadow: 3,
//                   "&:hover": {
//                     boxShadow: 6,
//                   },
//                 }}
//                 onClick={() => handleDeviceClick(device)}
//               >
//                 <CardContent sx={{ textAlign: "center" }}>
//                   <Typography variant="h4" component="div" gutterBottom>
//                     {device.devicename}
//                   </Typography>
//                   {/* <Typography variant="subtitle2" color="text.secondary">
//                     ID: {device.deviceId}
//                   </Typography> */}

//                   <AcUnitIcon
//                     sx={{
//                       fontSize: 40,
//                       color: device.power === "on" ? "#4caf50" : "#d32f2f",
//                     }}
//                   />

//                   <Typography variant="body2" color="text.secondary">
//                     Power: {device.power}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//       <AddAirConditionerForm/>
//     </>
//   );
// };

// export default AllAirConditioner;