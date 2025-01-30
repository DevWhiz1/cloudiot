import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
const ApiUrl= process.env.REACT_APP_API_URL;
// Define the columns for the DataGrid
const columns = [
  // { field: "_id", headerName: "ID", },
  { field: "deviceName", headerName: "Device Name", flex:1 },
  // { field: "createdAt", headerName: "Device IP", flex:1},
  { field: "entityName", headerName: "Entity Name", flex:1},
  { field: "entityId", headerName: "Entity ID", flex:1 },
  // { field: "stateType", headerName: "State Type", flex:1 },
  { field: "state", headerName: "State", type: "boolean" },
  { field: "IsActive", headerName: "Is Active", type: "boolean" },
];

const DevicesAndEntities = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to hold the data
  const [data, setData] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${ApiUrl}/entity/getentities`);
        if (response.data.success) {
          setData(response.data.data); 
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); 

  return (
    <Box m="20px">
      <Header
        title="Entities"
        subtitle="List of Entities"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default DevicesAndEntities;