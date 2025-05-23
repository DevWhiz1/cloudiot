
const { response } = require("express");
const Airconditioner =require("../models/airConditioner.model");

const saveAcData = async (req, res) => {
  try {
    const airConditionerData = req.body;
    const airConditioner = new Airconditioner(airConditionerData);
    await airConditioner.save();
    res.status(201).json({ message: "Air conditioner data saved successfully", airConditioner });
  } catch (error) {
    console.error("Error saving air conditioner data:", error);
    res.status(500).json({ message: "Error saving air conditioner data", error });
  }
};


// const saveAcData = async (req, res) => {
//   try {
//     const { devicename, deviceID } = req.body;

//     const baseTopic = `thecldiot/head_office_b17_b1/${deviceID}`;

//     const airConditioner = new Airconditioner({
//       devicename,
//       deviceID,
//       deviceStatus: {
//         state: "offline",
//         subscribeTopic: `${baseTopic}/status`,
//       },
//       power: {
//         state: "off",
//         subscribeTopic: `${baseTopic}/mode`,
//         publishTopic: `${baseTopic}/toggle_power`,
//       },
//       mode: {
//         state: "Cool",
//         subscribeTopic: `${baseTopic}/mode`,
//         publishTopic: `${baseTopic}/set_mode`,
//       },
//       targetTemperature: {
//         state: 26,
//         subscribeTopic: `${baseTopic}/target_temperature`,
//         publishTopic: `${baseTopic}/set_temperature`,
//       },
//       currentTemperature: {
//         state: 30,
//         subscribeTopic: `${baseTopic}/current_temperature`,
//       },
//       swingMode: {
//         state: "off",
//         subscribeTopic: `${baseTopic}/swing_mode`,
//         publishTopic: `${baseTopic}/set_swing_mode`,
//       },
//       fanMode: {
//         state: "auto",
//         subscribeTopic: `${baseTopic}/fan_mode`,
//         publishTopic: `${baseTopic}/set_fan_mode`,
//       },
//       currentHumidity: {
//         state: 40,
//         subscribeTopic: `${baseTopic}/current_humidity`,
//       },
//     });

//     await airConditioner.save();
//     res.status(201).json({ message: "Air conditioner data saved successfully", airConditioner });
//   } catch (error) {
//     console.error("Error saving air conditioner data:", error);
//     res.status(500).json({ message: "Error saving air conditioner data", error });
//   }
// };







const getAllAc =async(req,res)=>{
  try{
    const acData=await Airconditioner.find({});
    return res.status(200).json({
        status:true,
        data:acData,
        msg:"Success"
    })
  }
catch{
 return res.status(500).json({
    status:false,
    error:error.message,
    msg:"Error getting Ac Data"
  })
}
}
module.exports = { saveAcData,getAllAc};