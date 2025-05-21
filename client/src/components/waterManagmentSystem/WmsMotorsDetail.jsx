// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import dayjs from "dayjs";
// import { Card, CardContent, Typography, Box, TextField, CircularProgress } from "@mui/material";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// const DetailComponent = () => {
//   const location = useLocation();
//   const { deviceName, entityName, state, entityId } = location.state || {};
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchGraphData = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
//         );
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const data = await response.json();

//         // Format data into segments
//         const formattedData = data
//           .map((item, index, array) => {
//             const startTime = new Date(item.time);
//             const endTime = index < array.length - 1 ? new Date(array[index + 1].time) : new Date();
//             const duration = (endTime - startTime) / 1000; // Duration in seconds
//             return {
//               startTime,
//               endTime,
//               duration,
//               state: item.value || "unavailable", // Default to "unavailable" if no value
//             };
//           })
//           .filter((item) => item.duration > 0); // Filter out invalid segments

//         setData(formattedData);
//       } catch (error) {
//         setError("Failed to fetch data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGraphData();
//   }, [entityId]);

//   const handleDateChange = (newDate) => {
//     setSelectedDate(newDate);
//   };

//   // Custom tooltip for the chart
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const { startTime, endTime, state, duration } = payload[0].payload;
//       return (
//         <div style={{ backgroundColor: "white", padding: "5px", border: "1px solid #ccc" }}>
//           <p>State: {state}</p>
//           <p>Start: {startTime.toLocaleTimeString()}</p>
//           <p>End: {endTime.toLocaleTimeString()}</p>
//           <p>Duration: {(duration / 60).toFixed(2)} minutes</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (loading) return <CircularProgress />;
//   if (error) return <Typography color="error">{error}</Typography>;

//   return (
//     <div style={{ padding: "20px" }}>
//       <Typography variant="h4" gutterBottom>
//         WMS Motor Details
//       </Typography>

//       <Card elevation={3}>
//         <CardContent>
//           <Typography variant="h6">Device: {deviceName}</Typography>
//           <Typography variant="subtitle1">Entity: {entityName}</Typography>
//           <Typography variant="body2">Current State: {state}</Typography>
//         </CardContent>
//       </Card>

//       <Box sx={{ my: 2 }}>
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DatePicker
//             label="Select Date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             renderInput={(props) => <TextField {...props} />}
//           />
//         </LocalizationProvider>
//       </Box>

//       {/* Recharts BarChart for Timeline Visualization */}
//       <ResponsiveContainer width="100%" height={100}>
//         <BarChart
//           data={data}
//           layout="vertical"
//           margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//         >
//           <XAxis type="number" hide />
//           <YAxis type="category" hide />
//           <Tooltip content={<CustomTooltip />} />
//           <Bar
//             dataKey="duration"
//             fill="#8884d8"
//             shape={(props) => {
//               const { state } = props.payload;
//               let fillColor;
//               if (state === "ON") fillColor = "green";
//               else if (state === "OFF") fillColor = "red";
//               else fillColor = "#666"; // Dark white for unavailable
//               return <rect {...props} fill={fillColor} />;
//             }}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default DetailComponent;



// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   Typography,
//   CircularProgress,
//   FormControl,
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
//   const [selectedDate, setSelectedDate] = useState(dayjs());

//   const processDataIntoIntervals = (data) => {
//     if (data.length === 0) return [];
//     const sortedData = [...data].sort((a, b) => a.time - b.time);
//     const intervals = [];
//     let currentState = sortedData[0].value;
//     let startTime = sortedData[0].time;
//     let endTime = startTime;

//     for (let i = 1; i < sortedData.length; i++) {
//       const item = sortedData[i];
//       if (item.value === currentState) {
//         endTime = item.time;
//       } else {
//         intervals.push({ state: currentState, start: startTime, end: endTime });
//         currentState = item.value;
//         startTime = item.time;
//         endTime = item.time;
//       }
//     }
//     intervals.push({ state: currentState, start: startTime, end: endTime });
//     return intervals;
//   };

//   const filterDataByDate = (data, date) => {
//     if (!date) return data;
//     const startOfDay = date.startOf('day').toDate();
//     const endOfDay = date.endOf('day').toDate();
//     return data.filter(item => 
//       item.time >= startOfDay && item.time <= endOfDay
//     );
//   };

//   useEffect(() => {
//     const fetchGraphData = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
//         );
//         const data = await response.json();

//         const formattedData = data
//           .filter(item => item.value === "ON" || item.value === "OFF")
//           .map(item => ({
//             time: new Date(item.time),
//             value: item.value,
//           }));

//         setGraphData(formattedData);
//         setLoading(false);
//       } catch (error) {
//         setError("Failed to fetch data.");
//         setLoading(false);
//       }
//     };

//     fetchGraphData();
//   }, [entityId]);

//   const handleDateChange = (newDate) => {
//     setSelectedDate(newDate);
//   };

//   if (loading) return <CircularProgress />;
//   if (error) return <Typography color="error">{error}</Typography>;

//   const filteredData = filterDataByDate(graphData, selectedDate);
//   const intervals = processDataIntoIntervals(filteredData);

//   const chartData = intervals.map(interval => {
//     const startMinutes = interval.start.getHours() * 60 + interval.start.getMinutes();
//     const endMinutes = interval.end.getHours() * 60 + interval.end.getMinutes();
//     return {
//       x0: startMinutes,
//       x: endMinutes,
//       state: interval.state,
//       start: interval.start,
//       end: interval.end,
//       date: selectedDate.format('MM/DD/YYYY'),
//     };
//   });

//   return (
//     <div style={{ padding: "20px" }}>
//       <Typography variant="h4" gutterBottom>
//         Water Management System Details
//       </Typography>

//       <Card elevation={3}>
//         <CardContent>
//           <Typography variant="h6">Device: {deviceName}</Typography>
//           <Typography variant="subtitle1">Entity: {entityName}</Typography>
//           <Typography variant="body2">Current State: {state}</Typography>
//         </CardContent>
//       </Card>

//       <Box sx={{ my: 2 }}>
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DatePicker
//             label="Select Date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             renderInput={(props) => <TextField {...props} />}
//           />
//         </LocalizationProvider>
//       </Box>

//       <ResponsiveContainer width="100%" height={100}>
//         <BarChart
//           layout="vertical"
//           data={chartData}
//           margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             type="number"
//             domain={[0, 1440]}
//             tickFormatter={(tick) => {
//               const hours = Math.floor(tick / 60);
//               const minutes = tick % 60;
//               const ampm = hours >= 12 ? 'PM' : 'AM';
//               const formattedHours = hours % 12 || 12;
//               return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
//             }}
//             ticks={[0, 180, 360, 540, 720, 900, 1080, 1260, 1440]}
//           />
//           <YAxis
//             type="category"
//             dataKey="date"
//             tick={{ fontSize: 12 }}
//           />
//           <Tooltip
//             content={({ active, payload }) => {
//               if (active && payload?.[0]) {
//                 const { start, end, state } = payload[0].payload;
//                 const durationInMinutes = (end - start) / 1000 / 60;
//                 const hours = Math.floor(durationInMinutes / 60);
//                 const minutes = Math.floor(durationInMinutes % 60);

//                 return (
//                   <div style={{ background: 'white', padding: 10, border: '1px solid #ccc' }}>
//                     <div>State: {state}</div>
//                     <div>Start: {start.toLocaleTimeString()}</div>
//                     <div>End: {end.toLocaleTimeString()}</div>
//                     <div>
//                       Duration: {hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}
//                       {minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}
//                     </div>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//           <Bar dataKey="x" dataStartKey="x0">
//             {chartData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={entry.state === 'ON' ? '#4CAF50' : '#F44336'}
//               />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default DetailComponent;







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
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
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

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/energy/meters/detail/${entityId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const rawData = await response.json();
        setGraphData(rawData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [entityId]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Process data for the selected date
  const prepareChartData = () => {
    if (!graphData || graphData.length === 0) return [];
    
    // Filter data for selected date
    const startOfDay = selectedDate.startOf('day').toDate();
    const endOfDay = selectedDate.endOf('day').toDate();
    
    const filteredData = graphData.filter(item => {
      const itemDate = new Date(item.time);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    });
    
    if (filteredData.length === 0) return [];
    
    // Sort data by time
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.time) - new Date(b.time)
    );
    
    // Generate data points for every minute of the day
    const minutesInDay = 24 * 60;
    const timelineData = new Array(minutesInDay).fill(null);
    
    // Initialize with state from first entry if exists
    // Default to 'OFF' if no data point is available
    let lastState = 'OFF';
    
    sortedData.forEach(point => {
      const time = new Date(point.time);
      const minuteOfDay = time.getHours() * 60 + time.getMinutes();
      
      if (minuteOfDay >= 0 && minuteOfDay < minutesInDay) {
        lastState = point.value;
        timelineData[minuteOfDay] = {
          time,
          state: point.value,
          minuteOfDay
        };
      }
    });
    
    // Fill in the gaps with the last known state
    for (let i = 0; i < minutesInDay; i++) {
      if (timelineData[i] === null) {
        // Find the next non-null entry
        let nextState = lastState;
        for (let j = i + 1; j < minutesInDay; j++) {
          if (timelineData[j] !== null) {
            break;
          }
        }
        
        const time = new Date(startOfDay);
        time.setMinutes(time.getMinutes() + i);
        
        timelineData[i] = {
          time,
          state: lastState,
          minuteOfDay: i
        };
      } else {
        // Update last state when we encounter data
        lastState = timelineData[i].state;
      }
    }
    
    // Compress consecutive entries with the same state
    const compressedData = [];
    let currentEntry = null;
    
    for (let i = 0; i < timelineData.length; i++) {
      const entry = timelineData[i];
      
      if (!currentEntry) {
        currentEntry = {
          state: entry.state,
          startTime: entry.time,
          endTime: entry.time,
          startMinute: entry.minuteOfDay,
          endMinute: entry.minuteOfDay
        };
      } else if (entry.state === currentEntry.state) {
        // Extend the current entry
        currentEntry.endTime = entry.time;
        currentEntry.endMinute = entry.minuteOfDay;
      } else {
        // Save the current entry and start a new one
        compressedData.push(currentEntry);
        currentEntry = {
          state: entry.state,
          startTime: entry.time,
          endTime: entry.time,
          startMinute: entry.minuteOfDay,
          endMinute: entry.minuteOfDay
        };
      }
    }
    
    // Don't forget to add the last entry
    if (currentEntry) {
      compressedData.push(currentEntry);
    }
    
    return compressedData;
  };
  
  const chartData = prepareChartData();

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box p={2}>
      <Typography color="error">Error: {error}</Typography>
    </Box>
  );

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Motor Operation Timeline
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Device: {deviceName}</Typography>
          <Typography variant="subtitle1">Entity: {entityName}</Typography>
          <Typography variant="body1">
            Current State: <span style={{ 
              color: state === 'ON' ? '#4CAF50' : '#F44336', 
              fontWeight: 'bold' 
            }}>
              {state}
            </span>
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Box>

      {chartData.length === 0 ? (
        <Typography variant="subtitle1" align="center" sx={{ my: 4 }}>
          No data available for selected date
        </Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Activity Timeline for {selectedDate.format('MMMM D, YYYY')}
          </Typography>
          
          <Box sx={{ height: 200, border: '1px solid #eee', position: 'relative' }}>
            {/* Time references */}
            <Box sx={{ 
              position: 'relative', 
              height: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex'
            }}>
              {[...Array(13)].map((_, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    position: 'absolute',
                    left: `${(i * 2) * 100/24}%`, 
                    borderLeft: i > 0 ? '1px solid #ddd' : 'none',
                    height: '15px',
                    width: '1px'
                  }}
                >
                  <Typography variant="caption" sx={{ position: 'absolute', left: '-15px', top: '15px' }}>
                    {i*2}:00
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Timeline */}
            <Box sx={{ position: 'relative', height: '50px', mt: 4 }}>
              {chartData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    left: `${(item.startMinute / 1440) * 100}%`,
                    width: `${((item.endMinute - item.startMinute) / 1440) * 100}%`,
                    height: '30px',
                    backgroundColor: item.state === 'ON' ? '#4CAF50' : '#F44336',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0px 0px 5px rgba(0,0,0,0.3)',
                      zIndex: 2
                    }
                  }}
                  title={`${item.state}: ${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}
                  `}
                >
                  {((item.endMinute - item.startMinute) > 30) && item.state}
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#4CAF50', borderRadius: '2px', mr: 1 }}></Box>
              <Typography variant="body2">ON</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#F44336', borderRadius: '2px', mr: 1 }}></Box>
              <Typography variant="body2">OFF</Typography>
            </Box>
          </Box> */}
        </>
      )}
      
      {/* Duration statistics */}
      {chartData.length > 0 && (
        <Card elevation={3} sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Statistics</Typography>
            
            {(() => {
              // Calculate total ON time
              const totalOnMinutes = chartData
                .filter(item => item.state === 'ON')
                .reduce((total, item) => total + (item.endMinute - item.startMinute), 0);
              
              const hours = Math.floor(totalOnMinutes / 60);
              const minutes = totalOnMinutes % 60;
              
              return (
                <>
                  <Typography variant="body1">
                    Total ON time: <strong>{hours} hours, {minutes} minutes</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({(totalOnMinutes / (24 * 60) * 100).toFixed(1)}% of the day)
                  </Typography>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailComponent;