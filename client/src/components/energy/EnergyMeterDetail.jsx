import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem, Grid, Box, useTheme } from "@mui/material";
import { format, subHours, subDays, subMonths, subYears, startOfHour, startOfDay, startOfMonth, eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval } from "date-fns";

const DetailPage = () => {
  const location = useLocation();
  const { deviceName, entityName, state, meterId } = location.state || {};
  const theme = useTheme();

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Time range options with labels and time functions
  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours', subFn: () => subHours(new Date(), 24) },
    { value: 'week', label: 'Last 7 Days', subFn: () => subDays(new Date(), 7) },
    { value: 'month', label: 'Last 30 Days', subFn: () => subDays(new Date(), 30) },
    { value: 'year', label: 'Last 12 Months', subFn: () => subYears(new Date(), 1) }
  ];

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/energy/meters/detail/${meterId}`);
        const data = await response.json();
        setRawData(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        console.error("Fetch error:", error);
      }
    };

    fetchGraphData();
  }, [meterId]);

  // Process data based on time range
  const processedData = useMemo(() => {
    if (!rawData.length) return [];

    // Convert raw data to a more usable format
    const meterReadings = rawData.map(item => ({
      time: new Date(item.time),
      value: parseInt(item.value)
    })).sort((a, b) => a.time - b.time);

    const now = new Date();
    let startDate;
    let timeFormat;
    let intervalFn;
    let dataKeyFormat;

    switch (timeRange) {
      case '24h':
        startDate = subHours(now, 24);
        timeFormat = 'h aaa';
        intervalFn = eachHourOfInterval;
        dataKeyFormat = 'yyyy-MM-dd-HH';
        break;
      case 'week':
        startDate = subDays(now, 7);
        timeFormat = 'EEE, MMM d';
        intervalFn = eachDayOfInterval;
        dataKeyFormat = 'yyyy-MM-dd';
        break;
      case 'month':
        startDate = subDays(now, 30);
        timeFormat = 'MMM d';
        intervalFn = eachDayOfInterval;
        dataKeyFormat = 'yyyy-MM-dd';
        break;
      case 'year':
        startDate = subYears(now, 1);
        timeFormat = 'MMM yyyy';
        intervalFn = eachMonthOfInterval;
        dataKeyFormat = 'yyyy-MM';
        break;
      default:
        return [];
    }

    // Create time buckets
    const timeBuckets = intervalFn({ start: startDate, end: now }).reduce((acc, date) => {
      const key = format(date, dataKeyFormat);
      acc[key] = {
        time: format(date, timeFormat),
        startTime: date,
        readings: []
      };
      return acc;
    }, {});

    // Distribute readings into time buckets
    meterReadings.forEach(reading => {
      let bucketKey;
      if (timeRange === '24h') {
        bucketKey = format(startOfHour(reading.time), dataKeyFormat);
      } else if (timeRange === 'year') {
        bucketKey = format(startOfMonth(reading.time), dataKeyFormat);
      } else {
        bucketKey = format(startOfDay(reading.time), dataKeyFormat);
      }

      if (timeBuckets[bucketKey]) {
        timeBuckets[bucketKey].readings.push(reading.value);
      }
    });

    // Calculate usage for each bucket
    return Object.values(timeBuckets).map(bucket => {
      if (bucket.readings.length === 0) {
        return {
          time: bucket.time,
          usage: 0,
          startTime: bucket.startTime
        };
      }

      const minReading = Math.min(...bucket.readings);
      const maxReading = Math.max(...bucket.readings);
      const usage = Math.max(0, maxReading - minReading);

      return {
        time: bucket.time,
        usage,
        startTime: bucket.startTime
      };
    }).sort((a, b) => a.startTime - b.startTime);

  }, [rawData, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ 
          p: 1.5, 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usage: <span style={{ fontWeight: 600 }}>{payload[0].value.toLocaleString()} wh</span>
          </Typography>
        </Card>
      );
    }
    return null;
  };

  const XAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill={theme.palette.text.secondary}
          fontSize={12}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', backgroundColor: theme.palette.error.light }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Energy Consumption Analysis
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%'
          }}>
            <CardContent>
              <Grid container alignItems="center" justifyContent="space-between" mb={3}>
                <Grid item>
                  <Typography variant="h6" fontWeight={600}>
                    {deviceName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entityName} • Current: {state} wh
                  </Typography>
                </Grid>
                <Grid item>
                  <FormControl size="small" variant="outlined">
                    <Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider
                        }
                      }}
                    >
                      {timeRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="time"
                      tick={<XAxisTick />}
                      interval={timeRange === '24h' ? 3 : timeRange === 'year' ? 0 : 'preserveEnd'}
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: 'Energy Usage (wh)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                          fill: theme.palette.text.primary,
                          fontSize: 12
                        }
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ 
                        fill: theme.palette.action.hover,
                        fillOpacity: 0.3
                      }}
                    />
                    <Bar
                      dataKey="usage"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Summary
              </Typography>
              
              {processedData.length > 0 && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Usage
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {processedData.reduce((sum, item) => sum + item.usage, 0).toLocaleString()} wh
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Average Daily
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {Math.round(processedData.reduce((sum, item) => sum + item.usage, 0) / 
                          (timeRange === '24h' ? 1 : 
                           timeRange === 'week' ? 7 : 
                           timeRange === 'month' ? 30 : 12)).toLocaleString()} wh
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Time Period
                      </Typography>
                      <Typography variant="body1">
                        {timeRanges.find(r => r.value === timeRange)?.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Peak Usage
                      </Typography>
                      <Typography variant="body1">
                        {Math.max(...processedData.map(item => item.usage)).toLocaleString()} wh
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetailPage;




// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem } from "@mui/material";

// const DetailPage = () => {
//   const location = useLocation();
//   const { deviceName, entityName, state, meterId } = location.state || {};

//   const [graphData, setGraphData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('24h'); 

//   useEffect(() => {
//     const fetchGraphData = async () => {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/energy/meters/detail/${meterId}`);
//         const data = await response.json();
//         const processedData = processData(data, timeRange);
//         setGraphData(processedData);
//         setLoading(false);
//       } catch (error) {
//         setError("Failed to fetch data.");
//         setLoading(false);
//       }
//     };

//     fetchGraphData();
//   }, [timeRange, meterId]);

//   const processData = (data, range) => {
//     const now = new Date();
//     let filteredData = [];
//     switch (range) {
//       case '24h':
//         now.setHours(now.getHours() - 24);
//         filteredData = aggregateByHour(data, now);
//         break;

//       case 'week':
//         now.setDate(now.getDate() - 7);
//         filteredData = aggregateByDay(data, now);
//         break;

//       case 'month':
//         now.setDate(now.getDate() - 30);
//         filteredData = aggregateByDay(data, now);
//         break;

//       case 'year':
//         now.setFullYear(now.getFullYear() - 1);
//         filteredData = aggregateByMonth(data, now);
//         break;

//       default:
//         filteredData = aggregateByHour(data, now);
//     }

//     return filteredData;
//   };

//   const aggregateByHour = (data, startTime) => {
//     const hourlyMap = new Map();
    
//     data.forEach(item => {
//       const timestamp = new Date(item.time);
//       if (timestamp >= startTime) {
//         const hourKey = timestamp.toISOString().slice(0, 13);
//         const currentValue = parseInt(item.value);
        
//         if (!hourlyMap.has(hourKey)) {
//           hourlyMap.set(hourKey, {
//             time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             total: currentValue,
//             usage: 0,
//             firstReading: currentValue
//           });
//         } else {
//           const existing = hourlyMap.get(hourKey);
//           existing.usage = Math.max(0, currentValue - existing.firstReading);
//           existing.total = currentValue;
//         }
//       }
//     });

//     return Array.from(hourlyMap.values())
//       .sort((a, b) => new Date(a.time) - new Date(b.time));
//   };

//   const aggregateByDay = (data, startTime) => {
//     const dailyMap = new Map();
    
//     data.forEach(item => {
//       const timestamp = new Date(item.time);
//       if (timestamp >= startTime) {
//         const dayKey = timestamp.toISOString().slice(0, 10);
//         const currentValue = parseInt(item.value);
        
//         if (!dailyMap.has(dayKey)) {
//           dailyMap.set(dayKey, {
//             time: timestamp.toLocaleDateString(),
//             total: currentValue,
//             usage: 0,
//             firstReading: currentValue
//           });
//         } else {
//           const existing = dailyMap.get(dayKey);
//           existing.usage = Math.max(0, currentValue - existing.firstReading);
//           existing.total = currentValue;
//         }
//       }
//     });

//     return Array.from(dailyMap.values())
//       .sort((a, b) => new Date(a.time) - new Date(b.time));
//   };

//   const aggregateByMonth = (data, startTime) => {
//     const monthlyMap = new Map();
    
//     data.forEach(item => {
//       const timestamp = new Date(item.time);
//       if (timestamp >= startTime) {
//         const monthKey = timestamp.toISOString().slice(0, 7);
//         const currentValue = parseInt(item.value);
        
//         if (!monthlyMap.has(monthKey)) {
//           monthlyMap.set(monthKey, {
//             time: timestamp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
//             total: currentValue,
//             usage: 0,
//             firstReading: currentValue
//           });
//         } else {
//           const existing = monthlyMap.get(monthKey);
//           existing.usage = Math.max(0, currentValue - existing.firstReading);
//           existing.total = currentValue;
//         }
//       }
//     });

//     return Array.from(monthlyMap.values())
//       .sort((a, b) => new Date(a.time) - new Date(b.time));
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <Card sx={{ p: 1, backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
//           <Typography variant="body2">{`Time: ${label}`}</Typography>
//           <Typography variant="body2" fontWeight="bold">
//             {`Usage: ${payload[0].value.toLocaleString()} wh`}
//           </Typography>
//         </Card>
//       );
//     }
//     return null;
//   };

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
//             Current State: {state} wh
//           </Typography>
//         </CardContent>
//       </Card>

//       <Card elevation={3} sx={{ marginTop: "20px" }}>
//         <CardContent>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
//             <Typography variant="h6">
//               Energy Usage Over Time
//             </Typography>
//             <FormControl sx={{ minWidth: 120 }}>
//               <Select
//                 value={timeRange}
//                 onChange={(e) => setTimeRange(e.target.value)}
//                 size="small"
//               >
//                 <MenuItem value="24h">Last 24 Hours</MenuItem>
//                 <MenuItem value="week">This Week</MenuItem>
//                 <MenuItem value="month">This Month</MenuItem>
//                 <MenuItem value="year">This Year</MenuItem>
//               </Select>
//             </FormControl>
//           </div>
          
//           <div style={{ height: "400px" }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={graphData}
//                 margin={{
//                   top: 10,
//                   right: 30,
//                   left: 20,
//                   bottom: 40,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                 <XAxis
//                   dataKey="time"
//                   angle={-45}
//                   textAnchor="end"
//                   height={60}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis
//                   label={{
//                     value: 'Usage (wh)',
//                     angle: -90,
//                     position: 'insideLeft',
//                     offset: 0,
//                   }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar
//                   dataKey="usage"
//                   fill="#1976d2"
//                   radius={[4, 4, 0, 0]}
//                   maxBarSize={50}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default DetailPage;
