import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";

const DeviceManager = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [name, setName] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch devices
  useEffect(() => {
    axios
      .get(`${API_URL}/device/getall`)
      .then((res) => setDevices(res.data.data))
      .catch(console.error);
  }, []);

  const handleEditClick = (device) => {
    setSelectedDevice(device);
    setName(device.name);
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    axios
      .put(`${API_URL}/device/edit/${selectedDevice._id}`, { name })
      .then(() => {
        setDevices((devices) =>
          devices.map((d) =>
            d._id === selectedDevice._id ? { ...d, name } : d
          )
        );
        setEditModalOpen(false);
      })
      .catch(console.error);
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id); // Set the device ID to delete
    setDeleteModalOpen(true); // Open the delete confirmation dialog
  };

  const handleDeleteConfirm = () => {
    axios
      .delete(`${API_URL}/device/delete/${deviceToDelete}`)
      .then(() => {
        setDevices((prev) => prev.filter((d) => d._id !== deviceToDelete));
        setDeleteModalOpen(false); // Close the dialog
        setDeviceToDelete(null); // Clear the device ID
      })
      .catch(console.error);
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device._id}>
                <TableCell>{device.name}</TableCell>
                <TableCell>
                  {device.isActive ? "Active" : "Inactive"}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(device)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteClick(device._id)}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/devices/${device._id}/entities`}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Device Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            <Edit />  {/* Edit icon */}
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this device?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DeviceManager;