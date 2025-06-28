import React, { useState } from "react";
import axios from "axios";
import defaultFloorPlan from "../../images/defaultfloor.jpg";
import floorDoorLight from "../../images/floordoorlight1.jpg";
import allLighton from "../../images/allon.jpg";
import washroomLight from "../../images/washroom.jpg";
import leftLight from "../../images/left.jpg";
import RightLight from "../../images/right.jpg";
import bothLeftRight from "../../images/fb.jpg";
import leftRightWashroom from "../../images/leftrightwashroom.jpg";
import doorLeftRight from "../../images/floorPlan/doorLeftRight.jpg";
import doorLeft from "../../images/floorPlan/doorLeft.jpg";
import doorRight from "../../images/floorPlan/doorRight.jpg";
import washroomLeft from "../../images/floorPlan/washroomLeft.jpg";
import washroomRight from "../../images/floorPlan/washroomRight.jpg";
import washroomDoor from "../../images/floorPlan/washroomDoor.jpg";
import washroomDoorRight from "../../images/floorPlan/washroomDoorRight.jpg";
import washroomDoorLeft from "../../images/floorPlan/washroomDoorLeft.jpg";
import { Box, Grid } from "@mui/material";

const FloorPlan = () => {
  const [image, setImage] = useState(defaultFloorPlan);
  const [areaStates, setAreaStates] = useState({
    door: false,
    washroom: false,
    left: false,
    right: false,
  });

  const areas = [
    {
      id: "door",
      coords: "83,24,302,79",
      ip: "livingroomyaml.local",
      domain: "switch",
      entityId: "switch_1",
      imageOn: floorDoorLight,
      imageOff: defaultFloorPlan,
    },
    {
      id: "washroom",
      coords: "118,247,174,307",
      ip: "livingroomyaml.local",
      domain: "switch",
      entityId: "switch_2",
      imageOn: washroomLight,
      imageOff: defaultFloorPlan,
    },
    {
      id: "left",
      coords: "501,55,548,108",
      ip: "livingroomyaml.local",
      domain: "switch",
      entityId: "switch_3",
      imageOn: leftLight,
      imageOff: defaultFloorPlan,
    },
    {
      id: "right",
      coords: "844,53,978,510",
      ip: "livingroomyaml.local",
      domain: "switch",
      entityId: "switch_4",
      imageOn: RightLight,
      imageOff: defaultFloorPlan,
    },
  ];

  const determineImage = (updatedState) => {
    if (
      updatedState.left &&
      updatedState.right &&
      updatedState.washroom &&
      updatedState.door
    ) {
      return allLighton;
    }
    if (updatedState.left && updatedState.right && updatedState.washroom) {
      return leftRightWashroom;
    }
    if (updatedState.left && updatedState.right && updatedState.door) {
      return doorLeftRight;
    }
    if (updatedState.washroom && updatedState.door && updatedState.right) {
      return washroomDoorRight;
    }
    if (updatedState.washroom && updatedState.door && updatedState.left) {
      return washroomDoorLeft;
    }
    if (updatedState.left && updatedState.right) {
      return bothLeftRight;
    }
    if (updatedState.door && updatedState.left) {
      return doorLeft;
    }
    if (updatedState.door && updatedState.right) {
      return doorRight;
    }
    if (updatedState.washroom && updatedState.left) {
      return washroomLeft;
    }
    if (updatedState.washroom && updatedState.right) {
      return washroomRight;
    }
    if (updatedState.washroom && updatedState.door) {
      return washroomDoor;
    }
    const activeArea = areas.find((a) => updatedState[a.id]);
    return activeArea ? activeArea.imageOn : defaultFloorPlan;
  };

  const handleAreaClick = async (area) => {
    const currentState = areaStates[area.id];
    const endpoint = currentState
      ? `http://${area.ip}/${area.domain}/${area.entityId}/turn_off`
      : `http://${area.ip}/${area.domain}/${area.entityId}/turn_on`;

    try {
      const response = await axios.post(endpoint, "");
      if (response.status !== 200) {
        throw new Error("Failed to toggle the state");
      }

      setAreaStates((prevState) => {
        const updatedState = { ...prevState, [area.id]: !currentState };
        setImage(determineImage(updatedState));
        return updatedState;
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div id="floorplan">
        <Grid container sm={12} xs={12}>
          <Grid container>
            <Grid item sm={12} xs={12} lg={12} md={12}>
              <img
                src={image}
                alt="Workplace"
                useMap="#workmap"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  padding: 0,
                  margin: 0,
                  marginLeft: "90px",
                  marginTop: "50px",
                }}
              />
              <map name="workmap">
                {areas.map((area, index) => (
                  <area
                    key={index}
                    shape="rect"
                    coords={area.coords}
                    alt="Clickable Area"
                    onClick={() => handleAreaClick(area)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </map>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default FloorPlan;
