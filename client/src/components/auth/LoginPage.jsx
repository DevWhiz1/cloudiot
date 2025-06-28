import React, { useState,useContext } from 'react';
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
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { AuthContext } from '../../hooks/useAuth';
import { useMediaQuery } from '@mui/material';
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

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleApiCall = async (values) => {
    try {
      const response = await axios.post(`${ApiUrl}/user/login`, values);
      if (response.data.token) {
        setSnackbar({ open: true, message: 'Login successful! Redirecting...', severity: 'success' });
        setTimeout(() => {
          login(response.data.token);
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Login failed', severity: 'error' });
    }
  };
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));
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
        <Container maxWidth="sm" sx={{ py: 8, height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login to <span style={{ color: '#e91e63' }}>IoT Dashboard</span>
          </Typography>
          <Divider sx={{ my: 4 }}>Continue with Email</Divider>
          <Formik
            initialValues={{ username: '', email: '', password: '' }}
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
                <GradientButton type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  LOGIN
                </GradientButton>
                <Grid container>
                  {/* <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid> */}
                  <Grid item>
                    <Link href="/user/login" variant="body2">
                      Log in with Enterprise
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
          <Link href="/user/register">
          <Button fullWidth variant="outlined" color='success' sx={{ mt: 4, height: 48 }}>
            CREATE AN ACCOUNT
          </Button>
          </Link>
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

export default LoginPage;