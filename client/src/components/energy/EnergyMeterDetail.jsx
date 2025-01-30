import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem } from "@mui/material";

const DetailPage = () => {
  const location = useLocation();
  const { deviceName, entityName, state, meterId } = location.state || {};

  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h'); 

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/energy/meters/detail/${meterId}`);
        const data = await response.json();
        const processedData = processData(data, timeRange);
        setGraphData(processedData);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [timeRange, meterId]);

  const processData = (data, range) => {
    const now = new Date();
    let filteredData = [];
    switch (range) {
      case '24h':
        now.setHours(now.getHours() - 24);
        filteredData = aggregateByHour(data, now);
        break;

      case 'week':
        now.setDate(now.getDate() - 7);
        filteredData = aggregateByDay(data, now);
        break;

      case 'month':
        now.setDate(now.getDate() - 30);
        filteredData = aggregateByDay(data, now);
        break;

      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        filteredData = aggregateByMonth(data, now);
        break;

      default:
        filteredData = aggregateByHour(data, now);
    }

    return filteredData;
  };

  const aggregateByHour = (data, startTime) => {
    const hourlyMap = new Map();
    
    data.forEach(item => {
      const timestamp = new Date(item.time);
      if (timestamp >= startTime) {
        const hourKey = timestamp.toISOString().slice(0, 13);
        const currentValue = parseInt(item.value);
        
        if (!hourlyMap.has(hourKey)) {
          hourlyMap.set(hourKey, {
            time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            total: currentValue,
            usage: 0,
            firstReading: currentValue
          });
        } else {
          const existing = hourlyMap.get(hourKey);
          existing.usage = Math.max(0, currentValue - existing.firstReading);
          existing.total = currentValue;
        }
      }
    });

    return Array.from(hourlyMap.values())
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const aggregateByDay = (data, startTime) => {
    const dailyMap = new Map();
    
    data.forEach(item => {
      const timestamp = new Date(item.time);
      if (timestamp >= startTime) {
        const dayKey = timestamp.toISOString().slice(0, 10);
        const currentValue = parseInt(item.value);
        
        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            time: timestamp.toLocaleDateString(),
            total: currentValue,
            usage: 0,
            firstReading: currentValue
          });
        } else {
          const existing = dailyMap.get(dayKey);
          existing.usage = Math.max(0, currentValue - existing.firstReading);
          existing.total = currentValue;
        }
      }
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const aggregateByMonth = (data, startTime) => {
    const monthlyMap = new Map();
    
    data.forEach(item => {
      const timestamp = new Date(item.time);
      if (timestamp >= startTime) {
        const monthKey = timestamp.toISOString().slice(0, 7);
        const currentValue = parseInt(item.value);
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            time: timestamp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            total: currentValue,
            usage: 0,
            firstReading: currentValue
          });
        } else {
          const existing = monthlyMap.get(monthKey);
          existing.usage = Math.max(0, currentValue - existing.firstReading);
          existing.total = currentValue;
        }
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
          <Typography variant="body2">{`Time: ${label}`}</Typography>
          <Typography variant="body2" fontWeight="bold">
            {`Usage: ${payload[0].value.toLocaleString()} wh`}
          </Typography>
        </Card>
      );
    }
    return null;
  };

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
            Current State: {state} wh
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ marginTop: "20px" }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
            <Typography variant="h6">
              Energy Usage Over Time
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="small"
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={graphData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{
                    value: 'Usage (wh)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="usage"
                  fill="#1976d2"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailPage;
