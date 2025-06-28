import { useState, useEffect } from 'react';
import axios from 'axios';

const allDevices= () => {
  const [device, setDevice] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDeviceOptions = async () => {
      try {
        const response = await axios.get("http://localhost:3000/device/getall");
        setDeviceOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching device options:", error);
        setErrorMessage("Failed to load device options.");
      }
    };

    loadDeviceOptions();
  }, []);

 
};

export default allDevices;
