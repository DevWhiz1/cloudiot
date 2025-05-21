import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Breadcrumbs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Devices as DevicesIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const EntityManagement = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ name: "Device" });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch all entities for the device
  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/entity/getbydeviceId/${deviceId}`);
      setEntities(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch entities');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single entity details
  const fetchEntity = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/entity/getByEntityId/${id}`);
      setCurrentEntity(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch entity details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update entity
  const updateEntity = async (id, data) => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      const response = await axios.put(`${API_URL}/entity/update/${id}`, data);
      return response.data;
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update entity');
      throw err;
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete entity
  const deleteEntity = async (id) => {
    try {
      await axios.delete(`${API_URL}/entity/delete/${id}`);
      return { status: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entity');
      throw err;
    }
  };

  useEffect(() => {
    fetchEntities();
    // Fetch device info if needed
    // axios.get(`${API_URL}/device/get/${deviceId}`).then(res => setDeviceInfo(res.data.data));
  }, [deviceId]);

  const handleEditClick = async (entity) => {
    try {
      const entityData = await fetchEntity(entity._id);
      setCurrentEntity(entityData);
      setEditDialogOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (entity) => {
    setCurrentEntity(entity);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteEntity(currentEntity._id);
      fetchEntities();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await updateEntity(currentEntity._id, {
        entityName: currentEntity.entityName,
        subscribeTopic: currentEntity.subscribeTopic,
        publishTopic: currentEntity.publishTopic,
        stateType: currentEntity.stateType,
        isActive: currentEntity.isActive,
        state: currentEntity.state
      });
      
      setSaveSuccess(true);
      fetchEntities();
      setTimeout(() => {
        setEditDialogOpen(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCurrentEntity({
      ...currentEntity,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Devices
        </Link>
        <Typography color="text.primary">
          <DevicesIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {deviceInfo.name} Entities
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">
          {deviceInfo.name} Entities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to={`/entityform`}
        >
          Add Entity
        </Button>
      </Box>

      {loading && !editDialogOpen ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Table stickyHeader aria-label="entities table">
              <TableHead>
                <TableRow>
                  <TableCell>Entity Name</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscribe Topic</TableCell>
                  <TableCell>Publish Topic</TableCell>
                  <TableCell>Current State</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entities.length > 0 ? entities.map((entity) => (
                  <TableRow key={entity._id} hover>
                    <TableCell>{entity.entityName}</TableCell>
                    <TableCell>{entity.entityId}</TableCell>
                    <TableCell>
                      <Chip label={entity.stateType} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entity.isActive ? 'Active' : 'Inactive'}
                        color={entity.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entity.subscribeTopic}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entity.publishTopic || 'N/A'}
                    </TableCell>
                    <TableCell>{entity.state || 'N/A'}</TableCell>
                    <TableCell>{formatDate(entity.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(entity)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(entity)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No entities found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the entity "{currentEntity?.entityName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={saveLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle>Edit Entity</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Entity updated successfully!
              </Alert>
            )}
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            
            <TextField
              label="Entity Name"
              name="entityName"
              value={currentEntity?.entityName || ''}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            />

            <TextField
              label="Entity ID"
              name="entityId"
              value={currentEntity?.entityId || ''}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              disabled
              helperText="Unique identifier (cannot be changed)"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>State Type</InputLabel>
              <Select
                name="stateType"
                value={currentEntity?.stateType || 'sensor'}
                label="State Type"
                onChange={handleChange}
                required
              >
                <MenuItem value="sensor">Sensor</MenuItem>
                <MenuItem value="switch">Switch</MenuItem>
                <MenuItem value="dimmer">Dimmer</MenuItem>
                <MenuItem value="meter">Meter</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Subscribe Topic"
              name="subscribeTopic"
              value={currentEntity?.subscribeTopic || ''}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              helperText="MQTT topic to subscribe to for updates"
            />

            <TextField
              label="Publish Topic"
              name="publishTopic"
              value={currentEntity?.publishTopic || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="MQTT topic to publish commands to (if applicable)"
            />

            <TextField
              label="State"
              name="state"
              value={currentEntity?.state || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Current state of the entity"
            />

            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={currentEntity?.isActive || false}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Active"
              sx={{ mt: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip label={`Created: ${formatDate(currentEntity?.createdAt)}`} variant="outlined" />
              <Chip label={`Last Updated: ${formatDate(currentEntity?.updatedAt)}`} variant="outlined" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            startIcon={<CloseIcon />}
            disabled={saveLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            color="primary" 
            variant="contained" 
            startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saveLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntityManagement;