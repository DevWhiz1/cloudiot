import React, { useState, useEffect, useMemo } from "react";
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
  Box,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DetailComponent = () => {
  const location = useLocation();
  const { deviceName, entityName, state, entityId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Parse value based on type (ON/OFF or numeric)
  const parseValue = (value) => {
    if (value === "ON") return 1;
    if (value === "OFF") return 0;
    return parseFloat(value) || 0;
  };

  // Format time based on selected range for better X-axis readability
  const formatTime = (time, range) => {
    const date = dayjs(time);
    switch (range) {
      case "24h":
        return date.format("h A"); // 12 AM, 1 AM, etc.
      case "week":
        return date.format("ddd h A"); // Mon 12 AM, Tue 1 PM, etc.
      case "month":
        return date.format("MMM D"); // Jan 1, Jan 2, etc.
      case "year":
        return date.format("MMM YYYY"); // Jan 2023, Feb 2023, etc.
      default:
        return date.format("MMM D, h A");
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
        );
        const data = await response.json();
        
        const formattedData = data.map((item) => ({
          time: item.time, // Store original time for filtering
          displayTime: formatTime(item.time, timeRange), // Formatted for display
          value: parseValue(item.value),
          rawValue: item.value // Keep original value for tooltip
        }));

        setGraphData(formattedData);
        setLoading(false);
      } catch (error) {
        setError("No historic data avalaible for this rntity.");
        setLoading(false);
        console.error("Fetch error:", error);
      }
    };

    fetchGraphData();
  }, [entityId]);

  // Filter data based on selected time range and date
  const filteredData = useMemo(() => {
    if (!graphData.length) return [];
    
    const now = dayjs();
    let startDate;
    
    switch (timeRange) {
      case "24h":
        startDate = now.subtract(24, 'hour');
        break;
      case "week":
        startDate = now.subtract(1, 'week');
        break;
      case "month":
        startDate = now.subtract(1, 'month');
        break;
      case "year":
        startDate = now.subtract(1, 'year');
        break;
      default:
        startDate = dayjs(0); // Beginning of time
    }

    // Apply date filter if selected
    let result = graphData.filter(item => 
      dayjs(item.time).isSameOrAfter(startDate)
    );

    if (timeRange !== "24h" && selectedDate) {
      const startOfDay = selectedDate.startOf('day');
      const endOfDay = selectedDate.endOf('day');
      result = result.filter(item => 
        dayjs(item.time).isSameOrAfter(startOfDay) && 
        dayjs(item.time).isSameOrBefore(endOfDay)
      );
    }

    // Update display times based on current range
    return result.map(item => ({
      ...item,
      displayTime: formatTime(item.time, timeRange)
    }));
  }, [graphData, timeRange, selectedDate]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Custom tooltip formatter
  const renderTooltipContent = (data) => {
    if (!data.payload || !data.payload.length) return null;
    
    const { time, rawValue } = data.payload[0].payload;
    const formattedDate = dayjs(time).format("MMM D, YYYY h:mm A");
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p>{formattedDate}</p>
        <p><strong>Value:</strong> {rawValue}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Loading Energy Data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Energy Meter Analytics
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {deviceName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {entityName}
          </Typography>
          <Typography variant="body1" mt={1}>
            <strong>Status:</strong> {state}
          </Typography>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} onChange={handleTimeRangeChange} label="Time Range">
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last 12 Months</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} sx={{ minWidth: 180 }} />}
            maxDate={dayjs()}
            disableFuture
          />
        </LocalizationProvider>
      </Box>

      <Box height={400} width="100%">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayTime" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                interval={Math.ceil(filteredData.length / 10)} // Prevent label crowding
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={renderTooltipContent}
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4361ee"
                strokeWidth={2}
                dot={filteredData.length < 100} // Only show dots if not too many points
                activeDot={{ r: 6, stroke: '#4361ee', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6" color="textSecondary">
              No data available for the selected period
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DetailComponent;















// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   Typography,
//   CircularProgress,
//   FormControl,
//   Select,
//   MenuItem,
//   InputLabel,
//   Button,
//   Box,
//   TextField,
// } from "@mui/material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import dayjs from "dayjs";

// const DetailComponent = () => {
//   const location = useLocation();
//   const { deviceName, entityName, state, entityId } = location.state || {};

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [graphData, setGraphData] = useState([]);
//   const [filter, setFilter] = useState("24h"); // Default filter is "24h"
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   const parseValue = (value) => {
//     if (value === "ON") {
//       return "ON";
//     }
//     if (value === "OFF") {
//       return "OFF";
//     }
//     return parseFloat(value); // For numeric values like "50.4"
//   };

//   const formatTime = (time) => {
//     const date = new Date(time);
//     return date.toLocaleString(); // Format time to a readable format
//   };

//   const filterDataByDate = (data, date) => {
//     if (!date) return data;
//     const startOfDay = date.startOf('day').toDate();
//     const endOfDay = date.endOf('day').toDate();
//     return data.filter((item) => {
//       const itemDate = new Date(item.time);
//       return itemDate >= startOfDay && itemDate <= endOfDay;
//     });
//   };

//   const filterDataByRange = (data, range) => {
//     const now = new Date();
//     let filteredData = [];
//     switch (range) {
//       case '24h':
//         now.setHours(now.getHours() - 24);
//         filteredData = data.filter(item => new Date(item.time) >= now);
//         break;
//       case 'week':
//         now.setDate(now.getDate() - 7);
//         filteredData = data.filter(item => new Date(item.time) >= now);
//         break;
//       case 'month':
//         now.setMonth(now.getMonth() - 1);
//         filteredData = data.filter(item => new Date(item.time) >= now);
//         break;
//       case 'year':
//         now.setFullYear(now.getFullYear() - 1);
//         filteredData = data.filter(item => new Date(item.time) >= now);
//         break;
//       default:
//         filteredData = data;
//     }
//     return filteredData;
//   };

//   useEffect(() => {
//     const fetchGraphData = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
//         );
//         const data = await response.json();
// console.log(data);
//         const formattedData = data.map((item) => ({
//           time: formatTime(item.time),
//           value: parseValue(item.value),
//         }));

//         setGraphData(formattedData);
//         setLoading(false);
//       } catch (error) {
//         setError("Failed to fetch data.");
//         setLoading(false);
//       }
//     };

//     fetchGraphData();
//   }, [entityId]);

//   const handleFilterChange = (event) => {
//     setFilter(event.target.value);
//   };

//   const handleDateChange = (newDate) => {
//     setSelectedDate(newDate);
//   };

//   const filteredData = filterDataByDate(filterDataByRange(graphData, filter), selectedDate);

//   if (loading) {
//     return (
//       <div style={{ padding: "20px" }}>
//         <CircularProgress size={60} />
//         <Typography variant="h6" sx={{ mt: 2 }}>
//           Loading Data...
//         </Typography>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: "20px" }}>
//         <Typography variant="h6" color="error">
//           {error}
//         </Typography>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       <Typography variant="h4" gutterBottom>
//         Energy Meter Details
//       </Typography>

//       <Card elevation={3}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Device: {deviceName}
//           </Typography>
//           <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
//             Entity: {entityName}
//           </Typography>
//           <Typography variant="body2" sx={{ fontWeight: "bold" }}>
//             Current State: {state}
//           </Typography>
//         </CardContent>
//       </Card>

//       <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
//         <FormControl sx={{ minWidth: 120 }}>
//           <InputLabel>Filter</InputLabel>
//           <Select value={filter} onChange={handleFilterChange}>
//             <MenuItem value="24h">Last 24 Hours</MenuItem>
//             <MenuItem value="week">This Week</MenuItem>
//             <MenuItem value="month">This Month</MenuItem>
//             <MenuItem value="year">This Year</MenuItem>
//           </Select>
//         </FormControl>

//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DatePicker
//             label="Select Date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             renderInput={(props) => <TextField {...props} />}
//           />
//         </LocalizationProvider>
//       </Box>

//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={filteredData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" />
//           <YAxis />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="value"
//             stroke="#8884d8"
//             activeDot={{ r: 8 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default DetailComponent;