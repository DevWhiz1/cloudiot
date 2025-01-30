import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Header title="FAQ" subtitle="Frequently Asked Questions" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            How do I connect a new IoT device to the dashboard?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            To connect a new IoT device, go to the "Devices" section, click on "Add Device," and follow the instructions to input the device's credentials and configuration settings.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            What should I do if a device goes offline?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            If a device goes offline, check its power supply and network connection. You can also navigate to the "Troubleshooting" tab for detailed diagnostics.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            How can I set up automation for my IoT devices?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Go to the "Automation" section of the dashboard. Create a new automation rule by selecting triggers, conditions, and actions for your devices. Save the rule to activate it.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Can I monitor real-time data from my devices?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, the dashboard provides a real-time data visualization feature. Navigate to the "Live Data" section to view up-to-date metrics from your connected devices.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            How do I secure my IoT Dashboard?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            To enhance security, enable two-factor authentication, regularly update your dashboard software, and use encrypted connections (e.g., HTTPS and MQTT with TLS).
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
