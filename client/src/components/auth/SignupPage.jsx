import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const ApiUrl = process.env.REACT_APP_API_URL;

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
}));

const LeftSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2D1B69 0%, #1B1B3A 100%)',
  color: 'white',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
}));

// Validation schema for Signup
const validationSchema = yup.object({
  username: yup.string().min(3, 'Username should be at least 3 characters long').required('Username is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password should be at least 6 characters long').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

function SignupPage() {
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Move handleApiCall inside the component so it can access setSnackbar and navigate
  const handleApiCall = async (values) => {
    try {
      const response = await axios.post(`${ApiUrl}/user/signup`, values);
      setSnackbar({ open: true, message: 'Signup successful! Redirecting to login...', severity: 'success' });
      setTimeout(() => navigate('/user/login'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Signup failed', severity: 'error' });
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const handleMouseDownConfirmPassword = (event) => event.preventDefault();

  return (
    <Grid container>
      {!isSmallScreen && (
             <Grid item xs={12} md={6} lg={7}>
               <LeftSection>
                 <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                   <ArrowBack sx={{ mr: 1 }} />
                   Back to Homepage
                 </Link>
                 <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                   <Typography variant="h4" component="h1" gutterBottom>
                     IoT Dashboard
                   </Typography>
                   <Typography variant="h6" align="center" sx={{ maxWidth: 400, mb: 4 }}>
                     Monitor, Control, and Optimize Your IoT Devices
                   </Typography>
                   <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                     <Grid item>
                       <Box sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                         <Typography variant="subtitle2">Connected Devices</Typography>
                         <Typography variant="caption">Monitor device status in real-time</Typography>
                       </Box>
                     </Grid>
                     <Grid item>
                       <Box sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                         <Typography variant="subtitle2">Real-time Analytics</Typography>
                         <Typography variant="caption">Get insights into device performance</Typography>
                       </Box>
                     </Grid>
                     <Grid item>
                       <Box sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                         <Typography variant="subtitle2">Secure Access</Typography>
                         <Typography variant="caption">Access control for team collaboration</Typography>
                       </Box>
                     </Grid>
                   </Grid>
                 </Box>
               </LeftSection>
             </Grid>
           )}
      

      <Grid item xs={12} md={6} lg={5}>
        <Container maxWidth="sm" sx={{ py: 8, height: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Sign Up for <span style={{ color: '#e91e63' }}>IoT Dashboard</span>
          </Typography>
          <Divider sx={{ my: 4 }}>Create an Account</Divider>
          <Formik
            initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleApiCall(values);
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="username"
                    label="Username"
                    fullWidth
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email Address"
                    fullWidth
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <GradientButton type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  SIGN UP
                </GradientButton>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link href="/user/login" variant="body2">
                      Already have an account? Log in
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Container>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Grid>
    
  );
}

export default SignupPage;
