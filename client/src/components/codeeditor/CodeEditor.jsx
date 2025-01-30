import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const CodeEditor = () => {
  const defaultYaml = `
esphome:
  name: test

esp32:
  board: esp32dev
  framework:
    type: arduino

# Enable logging
logger:

# Enable Home Assistant API
api:
  password: "YOUR_API_PASSWORD"

ota:
  password: "YOUR_OTA_PASSWORD"

wifi:
  ssid: "YOUR_WIFI_SSID"
  password: "YOUR_WIFI_PASSWORD"

  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: "Fallback Hotspot"
    password: "FALLBACK_PASSWORD"

captive_portal:

web_server:
  port: 80
  `;

  const [yamlCode, setYamlCode] = useState(defaultYaml);
  const [fileName, setFileName] = useState('');
  const [openModal, setOpenModal] = useState(false); 
  // Handle File Upload
  const handleFileOpen = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setYamlCode(event.target.result);
    };
    reader.readAsText(file);
  };

  // Download YAML file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([yamlCode], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName || 'code'}.yaml`;
    document.body.appendChild(element);
    element.click();
    setOpenModal(false);
  };

  return (
    <div>
      <Box container marginBottom={2}>
        <Button
          variant="contained"
          component="label"
          style={{ marginTop: '30px', marginRight: '10px' }}
        >
          Open yaml File
          <input type="file" hidden onChange={handleFileOpen} />
        </Button>

        {/* Button to open modal */}
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          style={{ marginTop: '30px', marginRight: '10px' }}
        >
          Download Code
        </Button>
      </Box>
      <Editor
        height="550px"
        defaultLanguage="yaml"
        value={yamlCode}
        onChange={(value) => setYamlCode(value)}
        theme="vs-dark"
      />

      {/* Modal for file name input */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Download YAML File</DialogTitle>
        <DialogContent>
          <TextField
            label="File Name"
            variant="standard"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setOpenModal(false)} color="primary">
            Cancel
          </Button>
          <Button variant='contained' onClick={handleDownload} color="primary">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CodeEditor;
