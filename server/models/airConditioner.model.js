// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const AirConditionerSchema = new Schema({
//   Devicename: {
//     type: String,
//     required: true,
//   },
//   power: {
//     state: {
//       type: String, // Change this to a valid type like String, or if it's intended to be Mixed, use Mixed directly.
//       default: "off",
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   mode: {
//     state: {
//       type: String, // Same here, use a valid type like String
//       default: "HEAT", 
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   targetTemperature: {
//     state: {
//       type: Number, // Use Number for temperatures
//       default: 28,
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   currentTemperature: {
//     state: {
//       type: Number, // Use Number for temperatures
//       default: 24,
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   swingMode: {
//     state: {
//       type: String, // Use String for state values
//       default: "off", 
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   fanMode: {
//     state: {
//       type: String, // Use String for state values
//       default: "auto", 
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   currentHumidity: {
//     state: {
//       type: Number, // Use Number for humidity
//       default: 50, 
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   presetState: {
//     state: {
//       type: String, // Use String for preset states
//       default: "COMFORT", 
//     },
//     subscribeTopic: String,
//     publishTopic: String,
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, {
//   timestamps: true,
// });

// const AirConditionerModel = mongoose.model("Airconditioner", AirConditionerSchema);
// module.exports = AirConditionerModel ;



const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AirConditionerSchema = new Schema({
  devicename: {
    type: String,
    required: true,
  },
  deviceID:{
    type: String,
    required: true,
  },
  power: {
   type:String,
   default: "off",
  },
  mode: {
    type: String,
    default: "Heat",
  },
  targetTemperature: {
     type: Number,
      default: 26,
  },
  currentTemperature: {
   type: Number,
    default: 18,
  },
  swingMode: {
    type: String,
    default: "off",
  },
  fanMode: {
    type: String,
    default: "auto",
  },
  currentHumidity: {
    type: Number,
    default: 40,
  },
  presetState: {
    type: String,
    default: "auto",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const AirConditionerModel = mongoose.model("Airconditioner", AirConditionerSchema);
module.exports = AirConditionerModel ;
