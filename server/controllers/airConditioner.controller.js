
const { response } = require("express");
const Airconditioner =require("../models/airConditioner.model");

const saveAcData = async (req, res) => {
  try {
    const airConditionerData = req.body;
    const airConditioner = new Airconditioner(airConditionerData); // Use the correct model name
    await airConditioner.save();
    res.status(201).json({ message: "Air conditioner data saved successfully", airConditioner });
  } catch (error) {
    console.error("Error saving air conditioner data:", error);
    res.status(500).json({ message: "Error saving air conditioner data", error });
  }
};

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
module.exports = { saveAcData,getAllAc };