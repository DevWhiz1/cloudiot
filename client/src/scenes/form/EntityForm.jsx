import { Box, Button, TextField, FormControlLabel, MenuItem, Select, InputLabel, FormHelperText, Snackbar, FormControl, Switch } from "@mui/material";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import { useState, useEffect } from "react";

const EntityForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const ApiUrl= process.env.REACT_APP_API_URL;
  useEffect(() => {
    const loadDeviceOptions = async () => {
      try {
        const alldevices = await axios.get(`${ApiUrl}/device/getall`);
        setDeviceOptions(alldevices.data.data);
      } catch (error) {
        console.error("Error fetching device options:", error);
        setErrorMessage("Failed to load device options.");
      }
    };
    loadDeviceOptions();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const payload = { 
        ...values,
        state: String(values.state), // Ensure state is stored as a string
      };
      const response = await axios.post(`${ApiUrl}/entity/add`, payload);
      console.log("Response:", response.data);
      setSuccessMessage("Entity added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Error submitting form. Please try again.");
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE DEVICE" subtitle="Create a New Device Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Box
              display="grid"
              gap="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <Field name="device">
                {({ field }) => (
                  <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                    <InputLabel id="deviceName-label">Device Name</InputLabel>
                    <Select
                      {...field}
                      labelId="deviceName-label"
                      id="device"
                      label="Device Name"
                      onChange={(e) => setFieldValue("device", e.target.value)}
                    >
                      {deviceOptions.map(option => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      <ErrorMessage name="device" />
                    </FormHelperText>
                  </FormControl>
                )}
              </Field>

              <TextField
                fullWidth
                variant="outlined"
                label="Entity Name"
                name="entityName"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.entityName}
                error={!!touched.entityName && !!errors.entityName}
                helperText={touched.entityName && errors.entityName}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Entity ID"
                name="entityId"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.entityId}
                error={!!touched.entityId && !!errors.entityId}
                helperText={touched.entityId && errors.entityId}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="MQTT Subscribe Topic"
                name="subscribeTopic"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.subscribeTopic}
                error={!!touched.subscribeTopic && !!errors.subscribeTopic}
                helperText={touched.subscribeTopic && errors.subscribeTopic}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="MQTT Publish Topic"
                name="publishTopic"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.publishTopic}
                error={!!touched.publishTopic && !!errors.publishTopic}
                helperText={touched.publishTopic && errors.publishTopic}
                sx={{ gridColumn: "span 2" }}
              />

              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel id="state-type-label">State Type</InputLabel>
                <Select
                  labelId="state-type-label"
                  id="state-type"
                  label="State Type"
                  value={values.stateType || "switch"} // Default to 'switch' (lowercase)
                  onChange={(e) => {
                    const selectedType = e.target.value;
                    setFieldValue("stateType", selectedType);
                    
                    // Reset state value when switching between 'switch' and 'sensor'
                    if (selectedType === "sensor") {
                      setFieldValue("state", "");
                    } // Set empty string for sensor
                    else if(selectedType === "dimmer"){
                        setFieldValue("state", "50"); // Set empty string for sensor
                      }
                    else {
                      setFieldValue("state", "OFF"); // Default value for switch
                    }
                  }}
                >
                  <MenuItem value="switch">Switch</MenuItem>
                  <MenuItem value="sensor">Sensor</MenuItem>
                  <MenuItem value="dimmer">Dimmer</MenuItem>
                </Select>
                <FormHelperText>
                  <ErrorMessage name="stateType" />
                </FormHelperText>
              </FormControl>

              {/* Conditionally display state input */}
              {values.stateType === "switch" ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.state === "ON"} // State is stored as a string, e.g., "ON" or "OFF"
                      onChange={(e) => setFieldValue("state", e.target.checked ? "ON" : "OFF")}
                      name="state"
                    />
                  }
                  label="State"
                  sx={{ gridColumn: "span 2" }}
                />
              ) : (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="State"
                  name="state"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.state}
                  error={!!touched.state && !!errors.state}
                  helperText={touched.state && errors.state}
                  sx={{ gridColumn: "span 2" }}
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={values.isActive}
                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                    name="isActive"
                  />
                }
                label="Is Active"
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            <Box display="flex" justifyContent="start" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add New Entity
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Snackbar for success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        action={<Button color="inherit" onClick={() => setSuccessMessage('')}>Close</Button>}
      />

      {/* Snackbar for error message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
        action={<Button color="inherit" onClick={() => setErrorMessage('')}>Close</Button>}
      />
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  device: yup.string().required("Required"),
  entityName: yup.string().required("Entity name is Required"),
  entityId: yup.string().required("Required"),
  isActive: yup.boolean(),
});

const initialValues = {
  device: "",
  entityName: "",
  entityId: "",
  subscribeTopic: "",
  publishTopic: "",
  state: "", // Default state as empty string (for sensor)
  stateType: "switch", // Default to 'switch' (lowercase)
  isActive: false,
};

export default EntityForm;






























// all past correct one 
// import { Box, Button, TextField, FormControlLabel, Checkbox, Switch, MenuItem, Select, InputLabel, FormHelperText, Snackbar, FormControl } from "@mui/material";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as yup from "yup";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import Header from "../../components/Header";
// import axios from "axios";
// import { useState, useEffect } from "react";

// const EntityForm = () => {
//   const isNonMobile = useMediaQuery("(min-width:600px)");

//   const [deviceOptions, setDeviceOptions] = useState([]);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [stateType, setStateType] = useState('boolean'); // Track state type (boolean or string)

//   useEffect(() => {
//     const loadDeviceOptions = async () => {
//       try {
//         const alldevices = await axios.get("http://localhost:3000/device/getall");
//         setDeviceOptions(alldevices.data.data);
//       } catch (error) {
//         console.error("Error fetching device options:", error);
//         setErrorMessage("Failed to load device options.");
//       }
//     };
//     loadDeviceOptions();
//   }, []);

//   const handleFormSubmit = async (values, { resetForm }) => {
//     try {
//       // Ensure stateType is sent along with the state value
//       const payload = { 
//         ...values, 
//         state: stateType === 'boolean' ? values.state : String(values.state),
//         stateType // Include stateType in the request
//       };
//       const response = await axios.post("http://localhost:3000/entity/add", payload);
//       console.log("Response:", response.data);
//       setSuccessMessage("Entity added successfully!");
//       resetForm();
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       setErrorMessage("Error submitting form. Please try again.");
//     }
//   };
  
//   return (
//     <Box m="20px">
//       <Header title="CREATE DEVICE" subtitle="Create a New Device Profile" />

//       <Formik
//         onSubmit={handleFormSubmit}
//         initialValues={initialValues}
//         validationSchema={checkoutSchema}
//       >
//         {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
//           <Form>
//             <Box
//               display="grid"
//               gap="20px"
//               gridTemplateColumns="repeat(4, minmax(0, 1fr))"
//               sx={{
//                 "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
//               }}
//             >
//               <Field name="device">
//                 {({ field }) => (
//                   <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
//                     <InputLabel id="deviceName-label">Device Name</InputLabel>
//                     <Select
//                       {...field}
//                       labelId="deviceName-label"
//                       id="device"
//                       label="Device Name"
//                       onChange={(e) => setFieldValue("device", e.target.value)}
//                     >
//                       {deviceOptions.map(option => (
//                         <MenuItem key={option._id} value={option._id}>
//                           {option.name}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     <FormHelperText>
//                       <ErrorMessage name="device" />
//                     </FormHelperText>
//                   </FormControl>
//                 )}
//               </Field>

//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 label="Entity Name"
//                 name="entityName"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.entityName}
//                 error={!!touched.entityName && !!errors.entityName}
//                 helperText={touched.entityName && errors.entityName}
//                 sx={{ gridColumn: "span 2" }}
//               />

//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 label="Entity ID"
//                 name="entityId"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.entityId}
//                 error={!!touched.entityId && !!errors.entityId}
//                 helperText={touched.entityId && errors.entityId}
//                 sx={{ gridColumn: "span 2" }}
//               />

//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 label="Subscribe Topic"
//                 name="subscribe"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.subscribe}
//                 error={!!touched.subscribe && !!errors.subscribe}
//                 helperText={touched.subscribe && errors.subscribe}
//                 sx={{ gridColumn: "span 2" }}
//               />

// <TextField
//                 fullWidth
//                 variant="outlined"
//                 label="Publish Topic"
//                 name="publishTopic"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.publishTopic}
//                 error={!!touched.publishTopic && !!errors.publishTopic}
//                 helperText={touched.publishTopic && errors.publishTopic}
//                 sx={{ gridColumn: "span 2" }}
//               />
//               <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
//                 <InputLabel id="state-type-label">State Type</InputLabel>
//                 <Select
//                   labelId="state-type-label"
//                   id="state-type"
//                   label="State Type"
//                   value={stateType}
//                   onChange={(e) => setStateType(e.target.value)}
//                 >
//                   <MenuItem value="boolean">Switch</MenuItem>
//                   <MenuItem value="string">Sensor</MenuItem>
//                 </Select>
//                 <FormHelperText>
//                   <ErrorMessage name="stateType" />
//                 </FormHelperText>
//               </FormControl>

//               {stateType === 'boolean' ? (
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={values.state}
//                       onChange={(e) => setFieldValue("state", e.target.checked)}
//                       name="state"
//                       color="secondary"
//                     />
//                   }
//                   label="State"
//                   sx={{ gridColumn: "span 2" }}
//                 />
//               ) : (
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   label="State"
//                   name="state"
//                   onBlur={handleBlur}
//                   onChange={handleChange}
//                   value={values.state}
//                   error={!!touched.state && !!errors.state}
//                   helperText={touched.state && errors.state}
//                   sx={{ gridColumn: "span 2" }}
//                 />
//               )}

//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={values.isActive}
//                     onChange={(e) => setFieldValue("isActive", e.target.checked)}
//                     name="isActive"
//                   />
//                 }
//                 label="Is Active"
//                 sx={{ gridColumn: "span 2" }}
//               />
//             </Box>

//             <Box display="flex" justifyContent="start" mt="20px">
//               <Button type="submit" color="secondary" variant="contained">
//                 Add New Entity
//               </Button>
//             </Box>
//           </Form>
//         )}
//       </Formik>

//       {/* Snackbar for success message */}
//       <Snackbar
//         open={!!successMessage}
//         autoHideDuration={6000}
//         onClose={() => setSuccessMessage('')}
//         message={successMessage}
//         action={<Button color="inherit" onClick={() => setSuccessMessage('')}>Close</Button>}
//       />

//       {/* Snackbar for error message */}
//       <Snackbar
//         open={!!errorMessage}
//         autoHideDuration={6000}
//         onClose={() => setErrorMessage('')}
//         message={errorMessage}
//         action={<Button color="inherit" onClick={() => setErrorMessage('')}>Close</Button>}
//       />
//     </Box>
//   );
// };

// const checkoutSchema = yup.object().shape({
//   device: yup.string().required("Required"),
//   entityName: yup.string().required("Entity name is Required"),
//   entityId: yup.string().required("Required"),
//   domain: yup.string().required("Required"),
//   isActive: yup.boolean(),
// });

// const initialValues = {
//   device: "",
//   entityName: "",
//   entityId: "",
//   domain: "",
//   state: false,
//   isActive: false,
// };

// export default EntityForm;