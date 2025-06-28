
import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import OnDeviceTrainingIcon from '@mui/icons-material/OnDeviceTraining';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CodeIcon from '@mui/icons-material/Code';
import LoginIcon from '@mui/icons-material/Login';
import WaterDamageIcon from '@mui/icons-material/WaterDamage';
// import EditDocumentIcon from '@mui/icons-material/EditDocument';
import EditIcon from '@mui/icons-material/Edit';
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  IOT Automation
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/iots.png`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  IOT
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Cloud Services
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            {/* <Item
              title="Manage Users"
              to="/team"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            {/* <Item title="User Login"
              to="/user/login"
              icon={<LoginIcon/>}
              selected={selected}
              setSelected={setSelected}/> */}

        
            <Item
              title="All Devices"
              to="/devices"
              icon={<ListAltIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Floor Plans"
              to="/3-d/floorplan"
              icon={<ViewInArIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            {/* <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Entities
            </Typography>
            <Item
              title="Entity Dashboard"
              to="/"
              icon={<OnDeviceTrainingIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Entity Historic Data"
              to="/entities"
              icon={<OnDeviceTrainingIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Forms
            </Typography>
            <Item
              title="Add Device"
              to="/form"
              icon={<AddToQueueIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Add Entity"
              to="/entityform"
              icon={<DeviceHubIcon />}
              selected={selected}
              setSelected={setSelected}
            />
             <Item
              title="Edit Devices"
              to="/editdevices"
              icon={<EditIcon />}
              selected={selected}
              setSelected={setSelected}
            />
             {/* <Item
              title="Edit Entities"
              to="/editentities"
              icon={<EditIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Code Editor"
              to="/codeeditor"
              icon={<CodeIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

<Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Energy Dashboard
            </Typography>
            <Item
              title="Energy Meters"
              to="/energy/meters"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Air Conditioner
            </Typography>
            <Item
              title="AC Dashboard"
              to="/ac/dashboard"
              icon={<AcUnitIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Add Air Conditioner"
              to="/air-conditioner/add"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

<Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              WMS Dashboard
            </Typography>
            <Item
              title="WMS Dashboard"
              to="/wms/motors"
              icon={<WaterDamageIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
    
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;