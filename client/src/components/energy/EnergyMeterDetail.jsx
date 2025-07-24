import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem, Grid, Box, useTheme, Chip, Avatar, Stack, Divider } from "@mui/material";
import { format, subHours, subDays, subMonths, subYears, startOfHour, startOfDay, startOfMonth, eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import axios from "axios";

const typeMap = {
  '24h': 'hourly',
  '7d': 'daily',
  '30d': 'daily',
  '12m': 'monthly',
  'yearly': 'yearly'
};

// Define the special meter IDs and their pairs
const specialMeterPairs = {
  '686b58ec216df753a7cb6088': ['6801053b097550e68a379420'], // Same ID for second API
  // '67f8d1634233a1f71aea4b2f': ['682da36bc4753587e7c25817'],
  '680102fc097550e68a37940e': ['686b6c24e3a6c731e66cc9a0'],
  '6856bc0a9829f2f0badf259d': ['6856bc689829f2f0badf259f', '6856bc8e9829f2f0badf25a1'] // Three charts case
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
      start = subMonths(now, 12);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
  const [additionalEnergyData, setAdditionalEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [additionalLoading, setAdditionalLoading] = useState([]);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [associatedEntities, setAssociatedEntities] = useState([]);
  const [additionalAssociatedEntities, setAdditionalAssociatedEntities] = useState([]);
  const [additionalDeviceInfo, setAdditionalDeviceInfo] = useState([]);
  const ApiUrl = process.env.REACT_APP_API_URL;
  // Check if this is a special meter that needs additional charts
  const isSpecialMeter = useMemo(() => Object.keys(specialMeterPairs).includes(meterId), [meterId]);
  const additionalMeterIds = useMemo(() => isSpecialMeter ? specialMeterPairs[meterId] : [], [isSpecialMeter, meterId]);

  // Enhanced color palette
  const colorPalette = {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    success: '#4facfe',
    warning: '#f093fb',
    info: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    entityColors: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ]
  };

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours', color: '#667eea' },
    { value: '7d', label: 'Last 7 Days', color: '#764ba2' },
    { value: '30d', label: 'Last 30 Days', color: '#f093fb' },
    { value: '12m', label: 'Last 12 Months', color: '#4facfe' },
    { value: 'yearly', label: 'Yearly', color: '#43e97b' }
  ];

  // Helper function to get unit for entity
  const getEntityUnit = (entityName) => {
    const name = entityName.toLowerCase();
    if (name.includes('current')) return 'A';
    if (name.includes('voltage')) return 'V';
    if (name.includes('power') && !name.includes('factor')) return 'W';
    if (name.includes('energy')) return 'Wh';
    if (name.includes('frequency')) return 'Hz';
    if (name.includes('factor')) return '';
    return '';
  };

  // Helper function to get icon for entity
  const getEntityIcon = (entityName) => {
    const name = entityName.toLowerCase();
    if (name.includes('current')) return '⚡';
    if (name.includes('voltage')) return '🔌';
    if (name.includes('power') && !name.includes('factor')) return '💡';
    if (name.includes('energy')) return '🔋';
    if (name.includes('frequency')) return '📊';
    if (name.includes('factor')) return '📈';
    return '⚙️';
  };

  const fetchEnergyData = async (meterId, index = -1) => {
    const { start, end, type } = getRange(timeRange);
    try {
      if (index >= 0) {
        // Update loading state for additional chart
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = true;
          return newLoading;
        });
      } else {
        setLoading(true);
      }
      
      const res = await axios.get(`${ApiUrl}/energy/energy-meter-data`, {
        params: {
          entityId: meterId,
          type,
          start,
          end
        }
      });
      
      const sortedData = res.data.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      if (index >= 0) {
        // Update data for additional chart
        setAdditionalEnergyData(prev => {
          const newData = [...prev];
          newData[index] = sortedData;
          return newData;
        });
        // Update loading state
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      } else {
        setEnergyData(sortedData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching energy data:', err);
      setError("Failed to fetch energy data. Please try again.");
      if (index >= 0) {
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      } else {
        setLoading(false);
      }
    }
  };

  const fetchAssociatedEntities = async (meterId, index = -1) => {
    try {
      const res = await axios.get(`${ApiUrl}/energy/device-with-entities/${meterId}`);
      
      if (index >= 0) {
        // Update associated entities for additional chart
        setAdditionalAssociatedEntities(prev => {
          const newEntities = [...prev];
          newEntities[index] = res.data.associatedEntities;
          return newEntities;
        });
        // Update device info for additional chart
        setAdditionalDeviceInfo(prev => {
          const newInfo = [...prev];
          newInfo[index] = {
            deviceName: res.data.deviceName,
            entityName: res.data.entityName,
            state: res.data.state
          };
          return newInfo;
        });
      } else {
        setAssociatedEntities(res.data.associatedEntities);
      }
    } catch (err) {
      console.error('Failed to fetch associated entities:', err);
    }
  };

  useEffect(() => {
    if (meterId) {
      // Initialize states based on how many additional charts we need
      const additionalCount = isSpecialMeter ? specialMeterPairs[meterId].length : 0;
      setAdditionalEnergyData(Array(additionalCount).fill([]));
      setAdditionalLoading(Array(additionalCount).fill(true));
      setAdditionalAssociatedEntities(Array(additionalCount).fill([]));
      setAdditionalDeviceInfo(Array(additionalCount).fill(null));

      // Fetch data for main chart
      fetchEnergyData(meterId);
      fetchAssociatedEntities(meterId);
      
      // Fetch data for additional charts if needed
      if (isSpecialMeter) {
        specialMeterPairs[meterId].forEach((id, index) => {
          fetchEnergyData(id, index);
          fetchAssociatedEntities(id, index);
        });
      }
    }
  }, [meterId, timeRange]);

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

  const additionalChartData = useMemo(() => {
    return additionalEnergyData.map(data => {
      if (!data.length) return [];
      
      return data.map(item => {
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
    });
  }, [additionalEnergyData, timeRange]);

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
          p: 2, 
          background: colorPalette.gradient,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: 'none',
          borderRadius: 2
        }}>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
            {dateString}
          </Typography>
          <Typography variant="body2">
            Consumption: <span style={{ fontWeight: 700 }}>{payload[0].value.toLocaleString()} Wh</span>
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
          fill={colorPalette.primary}
          fontSize={12}
          fontWeight={600}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

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

  const additionalStats = useMemo(() => {
    return additionalEnergyData.map(data => {
      if (!data.length) return null;
      
      const totalUsage = data.reduce((sum, item) => sum + item.totalValue, 0);
      let averageUsage;
      let peakUsage = Math.max(...data.map(item => item.totalValue));
      
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
    });
  }, [additionalEnergyData, timeRange]);

  const isLoading = loading || additionalLoading.some(loading => loading);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="300px"
        sx={{
          background: colorPalette.gradient,
          borderRadius: 3,
          p: 4,
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: 'white', mb: 2 }} size={60} />
        <Typography variant="h6" fontWeight={600}>Loading Energy Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        p: 4, 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        color: 'white',
        borderRadius: 3
      }}>
        <Typography variant="h6" fontWeight={600}>{error}</Typography>
      </Card>
    );
  }

  const renderChart = (data, deviceInfo, associatedEntities, stats, index = -1) => {
    const chartColors = [
      { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', primary: '#667eea' },
      { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', primary: '#4facfe' },
      { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', primary: '#43e97b' },
      { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', primary: '#fa709a' }
    ];
    
    const colorIndex = index >= 0 ? (index % chartColors.length) : 0;
    const colors = index >= 0 ? chartColors[colorIndex] : chartColors[0];

    return (
      <Grid container spacing={3} key={index}>
        {/* Main Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              background: colors.gradient,
              p: 3,
              color: 'white'
            }}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {deviceInfo.deviceName}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {deviceInfo.entityName} • Current: <strong>{deviceInfo.state} Wh</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <FormControl size="small" variant="outlined">
                    <Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white'
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
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <defs>
                      <linearGradient id={`barGradient${index >= 0 ? index : ''}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity={1}/>
                        <stop offset="100%" stopColor={colors.primary} stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false}  
                      stroke="rgba(102, 126, 234, 0.1)"
                    />
                    <XAxis
                      dataKey="time"
                      tick={<XAxisTick />}
                      interval={timeRange === '24h' ? 3 : timeRange === 'yearly' ? 0 : 'preserveEnd'}
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: 'Energy (Wh)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                          fill: colors.primary,
                          fontSize: 14,
                          fontWeight: 600
                        }
                      }}
                      tick={{ fontSize: 12, fill: colors.primary, fontWeight: 600 }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ 
                        fill: 'rgba(102, 126, 234, 0.1)',
                        radius: 4
                      }}
                    />
                    <Bar
                      dataKey="totalValue"
                      fill={`url(#barGradient${index >= 0 ? index : ''})`}
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Summary Stats with Entities */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Summary Stats */}
            <Card elevation={0} sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ 
                background: colors.gradient,
                p: 2,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Summary
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                {stats && (
                  <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: colors.gradient,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                          💡 Total
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.totalUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Wh</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: colors.gradient,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                          📈 Average Daily
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.averageUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Wh</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: colors.gradient,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                          ⚡ Peak
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.peakUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Wh</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Associated Entities */}
            <Card elevation={0} sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ 
                background: colors.gradient,
                p: 2,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔌 Entities
                </Typography>
              </Box>

              <CardContent sx={{ p: 2 }}>
                {associatedEntities.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: 1.5
                  }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      📭 No entities found
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {associatedEntities.map((entity, entityIndex) => (
                      <Box 
                        key={entity._id}
                        sx={{ 
                          background: colors.gradient,
                          borderRadius: 1.5,
                          p: 1.5,
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                            {getEntityIcon(entity.entityName)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={600} 
                            sx={{ 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '120px'
                            }}
                          >
                            {entity.entityName.replace('PZEM-004T V3 ', '')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                          {entity.state} {getEntityUnit(entity.entityName)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: colorPalette.gradient,
        borderRadius: 3,
        p: 4,
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        mb: 3
      }}>
        <Typography variant="h3" fontWeight={700} gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          ⚡ Energy Consumption Analysis
        </Typography>
      </Box>

      {/* First Chart */}
      {renderChart(
        chartData, 
        { deviceName, entityName, state }, 
        associatedEntities, 
        stats
      )}

      {/* Additional Charts (if special meter) */}
      {isSpecialMeter && additionalDeviceInfo.map((deviceInfo, index) => (
        deviceInfo && (
          <React.Fragment key={index}>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" fontWeight={600} color="text.secondary" sx={{ textAlign: 'center' }}>
                {index === 0 ? 'Second' : 'Third'} Meter Data
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
            
            {renderChart(
              additionalChartData[index], 
              deviceInfo, 
              additionalAssociatedEntities[index], 
              additionalStats[index],
              index
            )}
          </React.Fragment>
        )
      ))}
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
