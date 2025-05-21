import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  FormControl,
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
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const processDataIntoIntervals = (data) => {
    if (data.length === 0) return [];
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    const intervals = [];
    let currentState = sortedData[0].value;
    let startTime = sortedData[0].time;
    let endTime = startTime;

    for (let i = 1; i < sortedData.length; i++) {
      const item = sortedData[i];
      if (item.value === currentState) {
        endTime = item.time;
      } else {
        intervals.push({ state: currentState, start: startTime, end: endTime });
        currentState = item.value;
        startTime = item.time;
        endTime = item.time;
      }
    }
    intervals.push({ state: currentState, start: startTime, end: endTime });
    return intervals;
  };

  const filterDataByDate = (data, date) => {
    if (!date) return data;
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();
    return data.filter(item => 
      item.time >= startOfDay && item.time <= endOfDay
    );
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
        );
        const data = await response.json();

        const formattedData = data
          .filter(item => item.value === "ON" || item.value === "OFF")
          .map(item => ({
            time: new Date(item.time),
            value: item.value,
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

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const filteredData = filterDataByDate(graphData, selectedDate);
  const intervals = processDataIntoIntervals(filteredData);

  const chartData = intervals.map(interval => {
    const startMinutes = interval.start.getHours() * 60 + interval.start.getMinutes();
    const endMinutes = interval.end.getHours() * 60 + interval.end.getMinutes();
    return {
      x0: startMinutes,
      x: endMinutes,
      state: interval.state,
      start: interval.start,
      end: interval.end,
      date: selectedDate.format('MM/DD/YYYY'),
    };
  });

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Energy Meter Details
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6">Device: {deviceName}</Typography>
          <Typography variant="subtitle1">Entity: {entityName}</Typography>
          <Typography variant="body2">Current State: {state}</Typography>
        </CardContent>
      </Card>

      <Box sx={{ my: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(props) => <TextField {...props} />}
          />
        </LocalizationProvider>
      </Box>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 1440]}
            tickFormatter={(tick) => {
              const hours = Math.floor(tick / 60);
              const minutes = tick % 60;
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const formattedHours = hours % 12 || 12;
              return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }}
            ticks={[0, 180, 360, 540, 720, 900, 1080, 1260, 1440]}
          />
          <YAxis
            type="category"
            dataKey="date"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const { start, end, state } = payload[0].payload;
                const durationInMinutes = (end - start) / 1000 / 60;
                const hours = Math.floor(durationInMinutes / 60);
                const minutes = Math.floor(durationInMinutes % 60);

                return (
                  <div style={{ background: 'white', padding: 10, border: '1px solid #ccc' }}>
                    <div>State: {state}</div>
                    <div>Start: {start.toLocaleTimeString()}</div>
                    <div>End: {end.toLocaleTimeString()}</div>
                    <div>
                      Duration: {hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}
                      {minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="x" dataStartKey="x0">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.state === 'ON' ? '#4CAF50' : '#F44336'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DetailComponent;