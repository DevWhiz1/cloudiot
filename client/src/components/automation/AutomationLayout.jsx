import React, { useState, useEffect } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography, Button, MenuItem, Switch, TextField, FormControlLabel } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

// EntitySelect Component
const EntitySelect = ({ entityOptions, handleEntityChange, value }) => {
  return (
    <TextField
      select
      label="Select Entity"
      fullWidth
      value={value || ""}
      onChange={handleEntityChange}
    >
      {entityOptions.map((entity) => (
        <MenuItem key={entity._id} value={entity._id}>
          {entity.entityName} {entity.stateType === "string" && "(Value Changes)"}
        </MenuItem>
      ))}
    </TextField>
  );
};

// Trigger Component
const Trigger = ({ deviceOptions, onChange, index }) => {
  const [entityOptions, setEntityOptions] = useState([]);

  const fetchEntities = async (deviceId) => {
    try {
      const response = await axios.get(`http://localhost:3000/entity/get/${deviceId}`);
      setEntityOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      deviceId: "",
      entity_Id: "",
      conditionState: false,
      above: "",
      below: "",
      triggerId: "", // Specific to Trigger
    },
    validationSchema: Yup.object({
      deviceId: Yup.string().required("Device selection is required"),
      entity_Id: Yup.string().required("Entity selection is required"),
      above: Yup.number().nullable(),
      below: Yup.number().nullable(),
      triggerId: Yup.string().required("Trigger type is required"),
    }),
    onSubmit: (values) => {
      onChange(values, index);
    },
  });

  useEffect(() => {
    if (formik.values.deviceId) {
      fetchEntities(formik.values.deviceId);
    }
  }, [formik.values.deviceId]);

  const handleEntityChange = (e) => {
    const selectedEntity = entityOptions.find((entity) => entity._id === e.target.value);
    formik.setFieldValue("entity_Id", selectedEntity._id);

    if (selectedEntity.stateType === "boolean") {
      formik.setFieldValue("conditionState", false);
      formik.setFieldValue("above", null);
      formik.setFieldValue("below", null);
    } else if (selectedEntity.stateType === "string") {
      formik.setFieldValue("conditionState", null);
      formik.setFieldValue("above", "");
      formik.setFieldValue("below", "");
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Trigger {index + 1}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Additional Trigger Field */}
            <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Trigger ID"
                    name="triggerId"
                    value={formik.values.triggerId}
                    onChange={formik.handleChange}
                    error={formik.touched.triggerId && Boolean(formik.errors.triggerId)}
                    helperText={formik.touched.triggerId && formik.errors.triggerId}
                  />
                </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Select Device"
                name="deviceId"
                fullWidth
                value={formik.values.deviceId}
                onChange={formik.handleChange}
                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                helperText={formik.touched.deviceId && formik.errors.deviceId}
              >
                {deviceOptions.map((device) => (
                  <MenuItem key={device._id} value={device._id}>
                    {device.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <EntitySelect
                entityOptions={entityOptions}
                handleEntityChange={handleEntityChange}
                value={formik.values.entity_Id}
              />
            </Grid>
            {formik.values.entity_Id && entityOptions.length > 0 && (
              <>
                {entityOptions.find((entity) => entity._id === formik.values.entity_Id)?.stateType === "boolean" ? (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.conditionState}
                          onChange={formik.handleChange}
                          name="conditionState"
                        />
                      }
                      label={formik.values.conditionState ? "On" : "Off"}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Above"
                        name="above"
                        value={formik.values.above}
                        onChange={formik.handleChange}
                        error={formik.touched.above && Boolean(formik.errors.above)}
                        helperText={formik.touched.above && formik.errors.above}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Below"
                        name="below"
                        value={formik.values.below}
                        onChange={formik.handleChange}
                        error={formik.touched.below && Boolean(formik.errors.below)}
                        helperText={formik.touched.below && formik.errors.below}
                      />
                    </Grid>
                  </>
                )}
                
              </>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Trigger
              </Button>
            </Grid>
          </Grid>
        </form>
      </AccordionDetails>
    </Accordion>
  );
};

// Condition Component
const Condition = ({ deviceOptions, onChange, index }) => {
  const [entityOptions, setEntityOptions] = useState([]);

  const fetchEntities = async (deviceId) => {
    try {
      const response = await axios.get(`http://localhost:3000/entity/get/${deviceId}`);
      setEntityOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      deviceId: "",
      entity_Id: "",
      conditionState: false,
      above: "",
      below: "",
      triggeredBy: "", // Specific to Condition
    },
    validationSchema: Yup.object({
      deviceId: Yup.string().required("Device selection is required"),
      entity_Id: Yup.string().required("Entity selection is required"),
      above: Yup.number().nullable(),
      below: Yup.number().nullable(),
      triggeredBy: Yup.string().required("triggeredBy is required"),
    }),
    onSubmit: (values) => {
      onChange(values, index);
    },
  });

  useEffect(() => {
    if (formik.values.deviceId) {
      fetchEntities(formik.values.deviceId);
    }
  }, [formik.values.deviceId]);

  const handleEntityChange = (e) => {
    const selectedEntity = entityOptions.find((entity) => entity._id === e.target.value);
    formik.setFieldValue("entity_Id", selectedEntity._id);

    if (selectedEntity.stateType === "boolean") {
      formik.setFieldValue("conditionState", false);
      formik.setFieldValue("above", null);
      formik.setFieldValue("below", null);
    } else if (selectedEntity.stateType === "string") {
      formik.setFieldValue("conditionState", null);
      formik.setFieldValue("above", "");
      formik.setFieldValue("below", "");
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Condition {index + 1}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Additional Condition Field */}
            <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Triggered By"
                    name="triggeredBy"
                    value={formik.values.triggeredBy}
                    onChange={formik.handleChange}
                    error={formik.touched.triggeredBy && Boolean(formik.errors.triggeredBy)}
                    helperText={formik.touched.triggeredBy && formik.errors.triggeredBy}
                  />
                </Grid>
            <Grid item xs={12}>

              <TextField
                select
                label="Select Device"
                name="deviceId"
                fullWidth
                value={formik.values.deviceId}
                onChange={formik.handleChange}
                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                helperText={formik.touched.deviceId && formik.errors.deviceId}
              >
                {deviceOptions.map((device) => (
                  <MenuItem key={device._id} value={device._id}>
                    {device.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <EntitySelect
                entityOptions={entityOptions}
                handleEntityChange={handleEntityChange}
                value={formik.values.entity_Id}
              />
            </Grid>
            {formik.values.entity_Id && entityOptions.length > 0 && (
              <>
                {entityOptions.find((entity) => entity._id === formik.values.entity_Id)?.stateType === "boolean" ? (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.conditionState}
                          onChange={formik.handleChange}
                          name="conditionState"
                        />
                      }
                      label={formik.values.conditionState ? "On" : "Off"}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Above"
                        name="above"
                        value={formik.values.above}
                        onChange={formik.handleChange}
                        error={formik.touched.above && Boolean(formik.errors.above)}
                        helperText={formik.touched.above && formik.errors.above}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Below"
                        name="below"
                        value={formik.values.below}
                        onChange={formik.handleChange}
                        error={formik.touched.below && Boolean(formik.errors.below)}
                        helperText={formik.touched.below && formik.errors.below}
                      />
                    </Grid>
                  </>
                )}
                
              </>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Condition
              </Button>
            </Grid>
          </Grid>
        </form>
      </AccordionDetails>
    </Accordion>
  );
};

// Action Component
const Action = ({ deviceOptions, onChange, index }) => {
  const [entityOptions, setEntityOptions] = useState([]);

  const fetchEntities = async (deviceId) => {
    try {
      const response = await axios.get(`http://localhost:3000/entity/get/${deviceId}`);
      setEntityOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      deviceId: "",
      entity_Id: "",
      conditionState: false,
      above: "",
      below: "",
    },
    validationSchema: Yup.object({
      deviceId: Yup.string().required("Device selection is required"),
      entity_Id: Yup.string().required("Entity selection is required"),
      above: Yup.number().nullable(),
      below: Yup.number().nullable(),
    }),
    onSubmit: (values) => {
      onChange(values, index);
    },
  });

  useEffect(() => {
    if (formik.values.deviceId) {
      fetchEntities(formik.values.deviceId);
    }
  }, [formik.values.deviceId]);

  const handleEntityChange = (e) => {
    const selectedEntity = entityOptions.find((entity) => entity._id === e.target.value);
    formik.setFieldValue("entity_Id", selectedEntity._id);

    if (selectedEntity.stateType === "boolean") {
      formik.setFieldValue("conditionState", false);
      formik.setFieldValue("above", null);
      formik.setFieldValue("below", null);
    } else if (selectedEntity.stateType === "string") {
      formik.setFieldValue("conditionState", null);
      formik.setFieldValue("above", "");
      formik.setFieldValue("below", "");
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Action {index + 1}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Select Device"
                name="deviceId"
                fullWidth
                value={formik.values.deviceId}
                onChange={formik.handleChange}
                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                helperText={formik.touched.deviceId && formik.errors.deviceId}
              >
                {deviceOptions.map((device) => (
                  <MenuItem key={device._id} value={device._id}>
                    {device.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <EntitySelect
                entityOptions={entityOptions}
                handleEntityChange={handleEntityChange}
                value={formik.values.entity_Id}
              />
            </Grid>
            {formik.values.entity_Id && entityOptions.length > 0 && (
              <>
                {entityOptions.find((entity) => entity._id === formik.values.entity_Id)?.stateType === "boolean" ? (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.conditionState}
                          onChange={formik.handleChange}
                          name="conditionState"
                        />
                      }
                      label={formik.values.conditionState ? "On" : "Off"}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Above"
                        name="above"
                        value={formik.values.above}
                        onChange={formik.handleChange}
                        error={formik.touched.above && Boolean(formik.errors.above)}
                        helperText={formik.touched.above && formik.errors.above}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Below"
                        name="below"
                        value={formik.values.below}
                        onChange={formik.handleChange}
                        error={formik.touched.below && Boolean(formik.errors.below)}
                        helperText={formik.touched.below && formik.errors.below}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Action
              </Button>
            </Grid>
          </Grid>
        </form>
      </AccordionDetails>
    </Accordion>
  );
};

// Main App Component
const Automation = () => {
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [triggers, setTriggers] = useState([{ deviceId: "", entity_Id: "", conditionState: false, above: "", below: "" }]);
  const [conditions, setConditions] = useState([{ deviceId: "", entity_Id: "", conditionState: false, above: "", below: "" }]);
  const [actions, setActions] = useState([{ deviceId: "", entity_Id: "", conditionState: false, above: "", below: "" }]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/device/getall")
      .then((response) => {
        setDeviceOptions(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching devices: ", error);
      });
  }, []);

  const handleTriggerChange = (triggerData, index) => {
    const updatedTriggers = [...triggers];
    updatedTriggers[index] = triggerData;
    setTriggers(updatedTriggers);
  };

  const handleConditionChange = (conditionData, index) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = conditionData;
    setConditions(updatedConditions);
  };

  const handleActionChange = (actionData, index) => {
    const updatedActions = [...actions];
    updatedActions[index] = actionData;
    setActions(updatedActions);
  };

  const handleAddTrigger = () => {
    setTriggers([...triggers, { deviceId: "", entity_Id: "", conditionState: false, above: "", below: "", triggerId: "" }]);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { deviceId: "", entity_Id: "", conditionState: false, above: "", below: "", triggeredBy: "" }]);
  };

  const handleAddAction = () => {
    setActions([...actions, { deviceId: "", entity_Id: "", conditionState: false, above: "", below: "" }]);
  };

  const handleSaveAutomation = () => {
    const automationData = {
      triggers,
      conditions,
      actions,
    };
    console.log("Automation data: ", automationData);
    // Make API call to save automation data here
  
     axios.post("http://localhost:3000/automation/save",automationData).then((res)=>{
      console.log("Automation data saved successfully: ", res.data);
     }).catch((err)=>{
      console.log("Error saving automation data: ", err);
     })
     

  };

  return (
    <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Automation System
      </Typography>

      <Typography variant="h4">Triggers</Typography>
      {triggers.map((trigger, index) => (
        <Trigger key={index} deviceOptions={deviceOptions} onChange={handleTriggerChange} index={index} />
      ))}
      <Button variant="contained" onClick={handleAddTrigger} style={{ marginTop: "5px" }}>
        Add Trigger
      </Button>

      <Typography variant="h4" style={{ marginTop: "40px" }}>Conditions</Typography>
      {conditions.map((condition, index) => (
        <Condition key={index} deviceOptions={deviceOptions} onChange={handleConditionChange} index={index} />
      ))}
      <Button variant="contained" onClick={handleAddCondition} style={{ marginTop: "5px" }}>
        Add Condition
      </Button>

      <Typography variant="h4" style={{ marginTop: "40px" }}>Actions</Typography>
      {actions.map((action, index) => (
        <Action key={index} deviceOptions={deviceOptions} onChange={handleActionChange} index={index} />
      ))}
      <Button variant="contained" onClick={handleAddAction} style={{ marginTop: "5px" }}>
        Add Action
      </Button>
<br/>
      <Button variant="contained" onClick={handleSaveAutomation} style={{ marginTop: "5px",}}>
        Save Automation
      </Button>
    </div>
  );
};

export default Automation;
