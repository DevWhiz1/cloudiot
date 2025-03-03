import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Box,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const DetailComponent = () => {
  const location = useLocation();
  const { deviceName, entityName, state, entityId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [filter, setFilter] = useState("24h"); // Default filter is "24h"
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const parseValue = (value) => {
    if (value === "ON") {
      return "ON";
    }
    if (value === "OFF") {
      return "OFF";
    }
    return parseFloat(value); // For numeric values like "50.4"
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString(); // Format time to a readable format
  };

  const filterDataByDate = (data, date) => {
    if (!date) return data;
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();
    return data.filter((item) => {
      const itemDate = new Date(item.time);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    });
  };

  const filterDataByRange = (data, range) => {
    const now = new Date();
    let filteredData = [];
    switch (range) {
      case '24h':
        now.setHours(now.getHours() - 24);
        filteredData = data.filter(item => new Date(item.time) >= now);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        filteredData = data.filter(item => new Date(item.time) >= now);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        filteredData = data.filter(item => new Date(item.time) >= now);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        filteredData = data.filter(item => new Date(item.time) >= now);
        break;
      default:
        filteredData = data;
    }
    return filteredData;
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
        );
        const data = await response.json();
console.log(data);
        const formattedData = data.map((item) => ({
          time: formatTime(item.time),
          value: parseValue(item.value),
        }));

        setGraphData(formattedData);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [entityId]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const filteredData = filterDataByDate(filterDataByRange(graphData, filter), selectedDate);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Data...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Energy Meter Details
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device: {deviceName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            Entity: {entityName}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Current State: {state}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} onChange={handleFilterChange}>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(props) => <TextField {...props} />}
          />
        </LocalizationProvider>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DetailComponent;