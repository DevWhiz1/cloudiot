// const mongoose = require('mongoose');
// const moment = require('moment-timezone');
// const energyRawHistory = require('../models/energyMeterRawHistory.model');
// const EnergyHourly = require('../models/energyMeterModels/energyHourly.model');
// const EnergyDaily = require('../models/energyMeterModels/energyDaily.model');
// const EnergyMonthly = require('../models/energyMeterModels/energyMonthly.model');
// const EnergyYearly = require('../models/energyMeterModels/energyYearly.model');

// const TIMEZONE = 'Asia/Karachi'; // Adjust to your local timezone

// async function connectDB() {
//   await mongoose.connect('');
//   console.log('✅ Connected to MongoDB');
// }

// function getStartOfUnit(unit) {
//   return moment().tz(TIMEZONE).startOf(unit).toDate();
// }

// function getEndOfUnit(unit) {
//   return moment().tz(TIMEZONE).endOf(unit).toDate();
// }

// async function upsertAggregatedData(model, query, data) {
//   await model.updateOne(query, { $set: data }, { upsert: true });
// }

// async function aggregateHourly() {
//   const start = getStartOfUnit('hour');
//   const end = getEndOfUnit('hour');

//   const results = await energyRawHistory.aggregate([
//     { $match: { time: { $gte: start, $lte: end } } },
//     { $sort: { time: 1 } },
//     {
//       $group: {
//         _id: {
//           entityId: "$entityId",
//           year: { $year: "$time" },
//           month: { $month: "$time" },
//           day: { $dayOfMonth: "$time" },
//           hour: { $hour: "$time" }
//         },
//         first: { $first: "$value" },
//         last: { $last: "$value" }
//       }
//     },
//     {
//       $project: {
//         entityId: "$_id.entityId",
//         totalValue: { $subtract: ["$last", "$first"] },
//         timestamp: {
//           $dateFromParts: {
//             year: "$_id.year",
//             month: "$_id.month",
//             day: "$_id.day",
//             hour: "$_id.hour"
//           }
//         }
//       }
//     }
//   ]);

//   for (const entry of results) {
//     const { entityId, totalValue, timestamp } = entry;
//     await upsertAggregatedData(EnergyHourly, { entityId, timestamp }, { entityId, totalValue, timestamp });
//   }

//   console.log(`✅ Hourly aggregation done (${results.length} records)`);
// }

// async function aggregateDaily() {
//   const start = getStartOfUnit('day');
//   const end = getEndOfUnit('day');

//   const results = await EnergyHourly.aggregate([
//     { $match: { timestamp: { $gte: start, $lte: end } } },
//     {
//       $group: {
//         _id: {
//           entityId: "$entityId",
//           year: { $year: "$timestamp" },
//           month: { $month: "$timestamp" },
//           day: { $dayOfMonth: "$timestamp" }
//         },
//         totalValue: { $sum: "$totalValue" }
//       }
//     },
//     {
//       $project: {
//         entityId: "$_id.entityId",
//         totalValue: 1,
//         timestamp: {
//           $dateFromParts: {
//             year: "$_id.year",
//             month: "$_id.month",
//             day: "$_id.day"
//           }
//         }
//       }
//     }
//   ]);

//   for (const entry of results) {
//     await upsertAggregatedData(EnergyDaily, { entityId: entry.entityId, timestamp: entry.timestamp }, entry);
//   }

//   console.log(`✅ Daily aggregation done (${results.length} records)`);
// }

// async function aggregateMonthly() {
//   const start = getStartOfUnit('month');
//   const end = getEndOfUnit('month');

//   const results = await EnergyDaily.aggregate([
//     { $match: { timestamp: { $gte: start, $lte: end } } },
//     {
//       $group: {
//         _id: {
//           entityId: "$entityId",
//           year: { $year: "$timestamp" },
//           month: { $month: "$timestamp" }
//         },
//         totalValue: { $sum: "$totalValue" }
//       }
//     },
//     {
//       $project: {
//         entityId: "$_id.entityId",
//         totalValue: 1,
//         timestamp: {
//           $dateFromParts: {
//             year: "$_id.year",
//             month: "$_id.month",
//             day: 1
//           }
//         }
//       }
//     }
//   ]);

//   for (const entry of results) {
//     await upsertAggregatedData(EnergyMonthly, { entityId: entry.entityId, timestamp: entry.timestamp }, entry);
//   }

//   console.log(`✅ Monthly aggregation done (${results.length} records)`);
// }

// async function aggregateYearly() {
//   const start = getStartOfUnit('year');
//   const end = getEndOfUnit('year');

//   const results = await EnergyMonthly.aggregate([
//     { $match: { timestamp: { $gte: start, $lte: end } } },
//     {
//       $group: {
//         _id: {
//           entityId: "$entityId",
//           year: { $year: "$timestamp" }
//         },
//         totalValue: { $sum: "$totalValue" }
//       }
//     },
//     {
//       $project: {
//         entityId: "$_id.entityId",
//         totalValue: 1,
//         timestamp: {
//           $dateFromParts: {
//             year: "$_id.year",
//             month: 1,
//             day: 1
//           }
//         }
//       }
//     }
//   ]);

//   for (const entry of results) {
//     await upsertAggregatedData(EnergyYearly, { entityId: entry.entityId, timestamp: entry.timestamp }, entry);
//   }

//   console.log(`✅ Yearly aggregation done (${results.length} records)`);
// }

// async function main() {
//   try {
//     await connectDB();

//     await aggregateHourly();   // Run each level in order
//     await aggregateDaily();
//     await aggregateMonthly();
//     await aggregateYearly();

//     console.log('🎯 All aggregations completed successfully!');
//   } catch (err) {
//     console.error('❌ Error during aggregation:', err);
//   } finally {
//     await mongoose.disconnect();
//     console.log('🔌 MongoDB connection closed');
//   }
// }

// main();
// const mongoose = require('mongoose');
// const energyRawHistory = require('../models/energyMeterRawHistory.model');
// const energyHourly = require('../models/energyMeterModels/energyHourly.model');

// async function testHourlyAggregation() {
//   await mongoose.connect('');

//   console.log('✅ Connected to MongoDB');

//   const now = new Date();
//   const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

//   const hourlyData = await energyRawHistory.aggregate([
//     { $match: { time: { $gte: oneHourAgo, $lt: now } } },
//     { $sort: { time: 1 } },
//     {
//       $group: {
//         _id: {
//           entityId: "$entityId",
//           year: { $year: "$time" },
//           month: { $month: "$time" },
//           day: { $dayOfMonth: "$time" },
//           hour: { $hour: "$time" }
//         },
//         first: { $first: "$value" },
//         last: { $last: "$value" }
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         entityId: "$_id.entityId",
//         totalValue: {
//           $subtract: [
//             { $toDouble: "$last" },
//             { $toDouble: "$first" }
//           ]
//         },
//         timestamp: {
//           $dateFromParts: {
//             year: "$_id.year",
//             month: "$_id.month",
//             day: "$_id.day",
//             hour: "$_id.hour"
//           }
//         }
//       }
//     }
//   ]);

//   if (hourlyData.length === 0) {
//     console.log('⚠️ No hourly data to aggregate');
//   } else {
//     console.log('📦 Aggregated hourly data:', hourlyData);
//     await energyHourly.insertMany(hourlyData);
//     console.log('✅ Inserted to energyhourlies');
//   }

//   await mongoose.disconnect();
//   console.log('🔚 Done');
// }

// testHourlyAggregation();




const mongoose = require('mongoose');
  const energyRawHistory = require('../models/energyMeterRawHistory.model');
  const energyHourly = require('../models/energyMeterModels/energyHourly.model');
  const energyDaily = require('../models/energyMeterModels/energyDaily.model');
  const energyMonthly = require('../models/energyMeterModels/energyMonthly.model');
  const energyYearly = require('../models/energyMeterModels/energyYearly.model');

async function aggregateAllLevels() {
  await mongoose.connect('');
  console.log('✅ Connected to MongoDB');

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // HOURLY AGGREGATION
  const hourlyData = await energyRawHistory.aggregate([
    { $match: { time: { $gte: oneHourAgo, $lt: now } } },
    { $sort: { time: 1 } },
    {
      $group: {
        _id: {
          entityId: "$entityId",
          year: { $year: "$time" },
          month: { $month: "$time" },
          day: { $dayOfMonth: "$time" },
          hour: { $hour: "$time" }
        },
        first: { $first: "$value" },
        last: { $last: "$value" }
      }
    },
    {
      $project: {
        _id: 0,
        entityId: "$_id.entityId",
        totalValue: {
          $subtract: [
            { $toDouble: "$last" },
            { $toDouble: "$first" }
          ]
        },
        timestamp: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            hour: "$_id.hour"
          }
        }
      }
    }
  ]);

  if (hourlyData.length > 0) {
    await energyHourly.insertMany(hourlyData);
    console.log(`✅ Inserted ${hourlyData.length} hourly documents`);
  } else {
    console.log("⚠️ No hourly data");
  }

  // DAILY AGGREGATION
  const dailyData = await energyHourly.aggregate([
    {
      $group: {
        _id: {
          entityId: "$entityId",
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" }
        },
        totalValue: { $sum: "$totalValue" }
      }
    },
    {
      $project: {
        _id: 0,
        entityId: "$_id.entityId",
        totalValue: 1,
        timestamp: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day"
          }
        }
      }
    }
  ]);

  if (dailyData.length > 0) {
    await energyDaily.insertMany(dailyData);
    console.log(`✅ Inserted ${dailyData.length} daily documents`);
  } else {
    console.log("⚠️ No daily data");
  }

  // MONTHLY AGGREGATION
  const monthlyData = await energyDaily.aggregate([
    {
      $group: {
        _id: {
          entityId: "$entityId",
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" }
        },
        totalValue: { $sum: "$totalValue" }
      }
    },
    {
      $project: {
        _id: 0,
        entityId: "$_id.entityId",
        totalValue: 1,
        timestamp: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: 1
          }
        }
      }
    }
  ]);

  if (monthlyData.length > 0) {
    await energyMonthly.insertMany(monthlyData);
    console.log(`✅ Inserted ${monthlyData.length} monthly documents`);
  } else {
    console.log("⚠️ No monthly data");
  }

  // YEARLY AGGREGATION
  const yearlyData = await energyMonthly.aggregate([
    {
      $group: {
        _id: {
          entityId: "$entityId",
          year: { $year: "$timestamp" }
        },
        totalValue: { $sum: "$totalValue" }
      }
    },
    {
      $project: {
        _id: 0,
        entityId: "$_id.entityId",
        totalValue: 1,
        timestamp: {
          $dateFromParts: {
            year: "$_id.year",
            month: 1,
            day: 1
          }
        }
      }
    }
  ]);

  if (yearlyData.length > 0) {
    await energyYearly.insertMany(yearlyData);
    console.log(`✅ Inserted ${yearlyData.length} yearly documents`);
  } else {
    console.log("⚠️ No yearly data");
  }

  await mongoose.disconnect();
  console.log('🔚 All aggregations done and DB disconnected');
}

aggregateAllLevels();

