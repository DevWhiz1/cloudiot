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
                  {/* {device.deviceID} */}
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