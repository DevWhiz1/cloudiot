import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem, Grid, Box, useTheme } from "@mui/material";
import { format, subHours, subDays, subMonths, subYears, startOfHour, startOfDay, startOfMonth, eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import axios from "axios";

const typeMap = {
  '24h': 'hourly',
  '7d': 'daily',
  '30d': 'daily',
  '12m': 'monthly',
  'yearly': 'yearly'
};

const getRange = (timeRange) => {
  const now = new Date();
  let start;
  switch (timeRange) {
    case '24h': 
      start = subHours(now, 24);
      return { 
        start: startOfHour(start).toISOString(), 
        end: startOfHour(now).toISOString(),
        type: 'hourly'
      };
    case '7d':
      start = subDays(now, 7);
      return { 
        start: startOfDay(start).toISOString(), 
        end: startOfDay(now).toISOString(),
        type: 'daily'
      };
    case '30d':
      start = subDays(now, 30);
      return { 
        start: startOfDay(start).toISOString(), 
        end: startOfDay(now).toISOString(),
        type: 'daily'
      };
    case '12m':
      start = subMonths(now, 12);  // Start 12 months ago
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month
      return { 
        start: startOfMonth(start).toISOString(), 
        end: end.toISOString(), 
        type: 'monthly'
      };
    case 'yearly':
      start = subYears(now, 1);
      return { 
        start: startOfMonth(start).toISOString(), 
        end: startOfMonth(now).toISOString(),
        type: 'yearly'
      };
    default: 
      start = subHours(now, 24);
      return { 
        start: startOfHour(start).toISOString(), 
        end: startOfHour(now).toISOString(),
        type: 'hourly'
      };
  }
};


const DetailPage = () => {
  const location = useLocation();
  const { deviceName, entityName, state, meterId } = location.state || {};
  const theme = useTheme();

  const [energyData, setEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Time range options
  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '12m', label: 'Last 12 Months' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    const fetchEnergyData = async () => {
      const { start, end, type } = getRange(timeRange);
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/energy/energy-meter-data`, {
          params: {
            entityId: meterId,
            type,
            start,
            end
          }
        });
        console.log('Fetched energy data:', res.data);
        // Ensure data is sorted by timestamp
        const sortedData = res.data.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setEnergyData(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching energy data:', err);
        setError("Failed to fetch energy data. Please try again.");
        setLoading(false);
      }
    };
    
    if (meterId) {
      fetchEnergyData();
    }
  }, [meterId, timeRange]);

  // Process data for chart display
  const chartData = useMemo(() => {
    if (!energyData.length) return [];
    
    return energyData.map(item => {
      const date = new Date(item.timestamp);
      let timeLabel;
      
      switch (timeRange) {
        case '24h':
          timeLabel = format(date, 'h aaa');
          break;
        case '7d':
        case '30d':
          timeLabel = format(date, 'MMM d');
          break;
        case '12m':
        case 'yearly':
          timeLabel = format(date, 'MMM yyyy');
          break;
        default:
          timeLabel = format(date, 'h aaa');
      }
      
      return {
        time: timeLabel,
        totalValue: item.totalValue,
        timestamp: item.timestamp,
        fullDate: date
      };
    });
  }, [energyData, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let dateString;
      
      switch (timeRange) {
        case '24h':
          dateString = format(data.fullDate, 'MMM d, yyyy h aaa');
          break;
        case '7d':
        case '30d':
          dateString = format(data.fullDate, 'EEEE, MMM d, yyyy');
          break;
        case '12m':
        case 'yearly':
          dateString = format(data.fullDate, 'MMMM yyyy');
          break;
        default:
          dateString = format(data.fullDate, 'MMM d, yyyy h aaa');
      }
      
      return (
        <Card sx={{ 
          p: 1.5, 
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            {dateString}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consumption: <span style={{ fontWeight: 600 }}>{payload[0].value.toLocaleString()} wh</span>
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

  // Calculate statistics
  const stats = useMemo(() => {
    if (!energyData.length) return null;
    
    const totalUsage = energyData.reduce((sum, item) => sum + item.totalValue, 0);
    let averageUsage;
    let peakUsage = Math.max(...energyData.map(item => item.totalValue));
    
    switch (timeRange) {
      case '24h':
        averageUsage = totalUsage / 24;
        break;
      case '7d':
        averageUsage = totalUsage / 7;
        break;
      case '30d':
        averageUsage = totalUsage / 30;
        break;
      case '12m':
      case 'yearly':
        averageUsage = totalUsage / 12;
        break;
      default:
        averageUsage = totalUsage;
    }
    
    return {
      totalUsage,
      averageUsage: Math.round(averageUsage),
      peakUsage
    };
  }, [energyData, timeRange]);

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
                    data={chartData}
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
                      interval={timeRange === '24h' ? 3 : timeRange === 'yearly' ? 0 : 'preserveEnd'}
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: 'Energy (wh)',
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
                      dataKey="totalValue"
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
              
              {stats && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Usage
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {stats.totalUsage.toLocaleString()} wh
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Average Daily
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {stats.averageUsage.toLocaleString()} wh
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
                        {stats.peakUsage.toLocaleString()} wh
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
