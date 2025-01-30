import { Box, Button, TextField, FormControlLabel, Checkbox, Snackbar } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import { useState } from "react"; 
import axiosInstance from '../../axiosInstence'; 
// const ApiUrl= process.env.REACT_APP_API_URL;
const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
    
      const response = await axiosInstance.post("/device/add", values);
      console.log("Response:", response.data);
      setSuccessMessage("Device added successfully!");
      resetForm(); // Reset form fields
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Error submitting form. Please try again.");
    }
  };

  return (
    <Box m="20px">
      <Header title="New Device" subtitle="Add a New Device" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Name Of Device"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                   variant="outlined"
                    checked={values.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Is Active"
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="start" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add New Device
              </Button>
            </Box>
          </form>
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
  name: yup.string().required("Required"),
  isActive: yup.boolean(),
});

const initialValues = {
  name: "",
  isActive: false,
};

export default Form;







//
// import { Box, Button, TextField, FormControlLabel, Checkbox, Snackbar } from "@mui/material";
// import { Formik } from "formik";
// import * as yup from "yup";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import Header from "../../components/Header";
// import axios from "axios";
// import { useState } from "react"; 
// import axiosInstance from '../../axiosInstence'; 
// const apiEndPoint = process.env.React_API_EndPoint;
// const Form = () => {
//   const isNonMobile = useMediaQuery("(min-width:600px)");

//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleFormSubmit = async (values, { resetForm }) => {
//     try {
    
//       const response = await axiosInstance.post("device/add", values);
//       console.log("Response:", response.data);
//       setSuccessMessage("Device added successfully!");
//       resetForm(); // Reset form fields
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       setErrorMessage("Error submitting form. Please try again.");
//     }
//   };

//   return (
//     <Box m="20px">
//       <Header title="New Device" subtitle="Add a New Device" />

//       <Formik
//         onSubmit={handleFormSubmit}
//         initialValues={initialValues}
//         validationSchema={checkoutSchema}
//       >
//         {({
//           values,
//           errors,
//           touched,
//           handleBlur,
//           handleChange,
//           handleSubmit,
//         }) => (
//           <form onSubmit={handleSubmit}>
//             <Box
//               display="grid"
//               gap="30px"
//               gridTemplateColumns="repeat(4, minmax(0, 1fr))"
//               sx={{
//                 "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
//               }}
//             >
//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 type="text"
//                 label="Name Of Device"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.name}
//                 name="name"
//                 error={!!touched.name && !!errors.name}
//                 helperText={touched.name && errors.name}
//                 sx={{ gridColumn: "span 2" }}
//               />
//                    <TextField
//                 fullWidth
//                 variant="outlined"
//                 type="text"
//                 label="IP Of Device"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.ip}
//                 name="ip"
//                 error={!!touched.ip && !!errors.ip}
//                 helperText={touched.ip && errors.ip}
//                 sx={{ gridColumn: "span 2" }}
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                    variant="outlined"
//                     checked={values.isActive}
//                     onChange={handleChange}
//                     name="isActive"
//                   />
//                 }
//                 label="Is Active"
//                 sx={{ gridColumn: "span 2" }}
//               />
//             </Box>
//             <Box display="flex" justifyContent="start" mt="20px">
//               <Button type="submit" color="secondary" variant="contained">
//                 Add New Device
//               </Button>
//             </Box>
//           </form>
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
//   name: yup.string().required("Required"),
//   ip:yup.string().required("Required"),
//   isActive: yup.boolean(),
// });

// const initialValues = {
//   name: "",
//   ip:"",
//   isActive: false,
// };

// export default Form;
