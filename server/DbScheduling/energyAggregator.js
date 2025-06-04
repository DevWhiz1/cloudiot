const cron = require('node-cron');
const energyRawHistory = require('../models/energyMeterRawHistory.model');
const energyHourly = require('../models/energyMeterModels/energyHourly.model');
const energyDaily = require('../models/energyMeterModels/energyDaily.model');
const energyMonthly = require('../models/energyMeterModels/energyMonthly.model');
const energyYearly = require('../models/energyMeterModels/energyYearly.model');

// HOURLY AGGREGATION
async function aggregateHourly() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

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

  for (const doc of hourlyData) {
    await energyHourly.updateOne(
      { entityId: doc.entityId, timestamp: doc.timestamp },
      { $set: doc },
      { upsert: true }
    );
  }

  console.log(`✅ Hourly aggregation complete. Upserted ${hourlyData.length} documents.`);
}

// DAILY AGGREGATION
async function aggregateDaily() {
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

  for (const doc of dailyData) {
    await energyDaily.updateOne(
      { entityId: doc.entityId, timestamp: doc.timestamp },
      { $set: doc },
      { upsert: true }
    );
  }

  console.log(`✅ Daily aggregation complete. Upserted ${dailyData.length} documents.`);
}

// MONTHLY AGGREGATION
async function aggregateMonthly() {
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

  for (const doc of monthlyData) {
    await energyMonthly.updateOne(
      { entityId: doc.entityId, timestamp: doc.timestamp },
      { $set: doc },
      { upsert: true }
    );
  }

  console.log(`✅ Monthly aggregation complete. Upserted ${monthlyData.length} documents.`);
}

// YEARLY AGGREGATION
async function aggregateYearly() {
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

  for (const doc of yearlyData) {
    await energyYearly.updateOne(
      { entityId: doc.entityId, timestamp: doc.timestamp },
      { $set: doc },
      { upsert: true }
    );
  }

  console.log(`✅ Yearly aggregation complete. Upserted ${yearlyData.length} documents.`);
}

// CRON SCHEDULERS
function scheduleAggregations() {
  // HOURLY: every hour at minute 1
  cron.schedule('1 * * * *', () => {
    console.log('🕐 Running Hourly Aggregation');
    aggregateHourly();
  });
//   cron.schedule('* * * * *', () => {
//   console.log('🚀 Hourly test running every minute...');
//   aggregateHourly();
// });


  // DAILY: every day at 00:10 AM
  cron.schedule('10 0 * * *', () => {
    console.log('📅 Running Daily Aggregation');
    aggregateDaily();
  });
  // cron.schedule('* * * * *', () => {
  //   console.log('📅 Running Daily Aggregation every minute testing');
  //   aggregateDaily();
  // });

  // MONTHLY: on 1st of each month at 00:20 AM
  cron.schedule('20 0 1 * *', () => {
    console.log('🗓️ Running Monthly Aggregation');
    aggregateMonthly();
  });
  // cron.schedule('* * * * *', () => {
  //   console.log('🗓️ Running Monthly Aggregation for testing');
  //   aggregateMonthly();
  // });

  // YEARLY: on Jan 1st at 00:30 AM
  cron.schedule('30 0 1 1 *', () => {
    console.log('📆 Running Yearly Aggregation');
    aggregateYearly();
  });
  //   cron.schedule('* * * * *', () => {
  //   console.log('📆 Running Yearly Aggregation for testing');
  //   aggregateYearly();
  // });

  console.log('🧭 Aggregation schedulers initialized.');
}

module.exports = {
  scheduleAggregations
};






















// const cron = require('node-cron');
// const mongoose = require('mongoose');
// const moment = require('moment-timezone'); // npm install moment-timezone

// const energyRawHistorySchema = require('../models/energyMeterRawHistory.model');
// const energyHourlyModel = require('../models/energyMeterModels/energyHourly.model');
// const energyDailyModel = require('../models/energyMeterModels/energyDaily.model');
// const energyMonthlyModel = require('../models/energyMeterModels/energyMonthly.model');
// const energyYearlyModel = require('../models/energyMeterModels/energyYearly.model');

// const TIMEZONE = 'Asia/Karachi'; // set your timezone here

// // Helper function to check duplicates and insert or update
// async function upsertMany(Model, data, uniqueKeys) {
//   const bulkOps = data.map(item => {
//     const filter = {};
//     uniqueKeys.forEach(key => {
//       filter[key] = item[key];
//     });
//     return {
//       updateOne: {
//         filter,
//         update: { $set: item },
//         upsert: true
//       }
//     };
//   });
//   if (bulkOps.length > 0) {
//     await Model.bulkWrite(bulkOps);
//   }
// }

// // 1️⃣ Every hour → store hourly usage
// cron.schedule('0 * * * *', async () => {
//   try {
//     const now = moment().tz(TIMEZONE);
//     const oneHourAgo = moment(now).subtract(1, 'hours');

//     const hourlyData = await energyRawHistorySchema.aggregate([
//       {
//         $match: {
//           time: {
//             $gte: oneHourAgo.toDate(),
//             $lt: now.toDate()
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             entityId: '$entityId',
//             year: { $year: '$time' },
//             month: { $month: '$time' },
//             day: { $dayOfMonth: '$time' },
//             hour: { $hour: '$time' },
//           },
//           totalValue: { $sum: { $toDouble: '$value' } }
//         }
//       },
//       {
//         $project: {
//           entityId: '$_id.entityId',
//           year: '$_id.year',
//           month: '$_id.month',
//           day: '$_id.day',
//           hour: '$_id.hour',
//           totalValue: 1,
//           timestamp: now.toDate()
//         }
//       }
//     ]);

//     // Upsert to prevent duplicate inserts on reruns
//     await upsertMany(energyHourlyModel, hourlyData, ['entityId', 'year', 'month', 'day', 'hour']);
//     console.log('Hourly aggregation done');
//   } catch (error) {
//     console.error('Hourly aggregation error:', error);
//   }
// });

// // 2️⃣ Every night at 12:05 AM → aggregate daily
// cron.schedule('5 0 * * *', async () => {
//   try {
//     const yesterday = moment().tz(TIMEZONE).subtract(1, 'days');
//     const start = yesterday.clone().startOf('day').toDate();
//     const end = yesterday.clone().endOf('day').toDate();

//     const dailyData = await energyHourlyModel.aggregate([
//       { $match: { timestamp: { $gte: start, $lt: end } } },
//       {
//         $group: {
//           _id: { entityId: '$entityId' },
//           dailyTotal: { $sum: '$totalValue' }
//         }
//       },
//       {
//         $project: {
//           entityId: '$_id.entityId',
//           total: '$dailyTotal',
//           date: start
//         }
//       }
//     ]);

//     await upsertMany(energyDailyModel, dailyData, ['entityId', 'date']);
//     console.log('Daily aggregation done');
//   } catch (error) {
//     console.error('Daily aggregation error:', error);
//   }
// });

// // 3️⃣ Every 1st of month → aggregate monthly
// cron.schedule('10 0 1 * *', async () => {
//   try {
//     const now = moment().tz(TIMEZONE);
//     const lastMonth = now.clone().subtract(1, 'months');
//     const start = lastMonth.clone().startOf('month').toDate();
//     const end = lastMonth.clone().endOf('month').toDate();

//     const monthlyData = await energyDailyModel.aggregate([
//       { $match: { date: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: { entityId: '$entityId' },
//           monthlyTotal: { $sum: '$total' }
//         }
//       },
//       {
//         $project: {
//           entityId: '$_id.entityId',
//           total: '$monthlyTotal',
//           month: start
//         }
//       }
//     ]);

//     await upsertMany(energyMonthlyModel, monthlyData, ['entityId', 'month']);
//     console.log('Monthly aggregation done');
//   } catch (error) {
//     console.error('Monthly aggregation error:', error);
//   }
// });

// // 4️⃣ Every January 1st → aggregate yearly
// cron.schedule('20 0 1 1 *', async () => {
//   try {
//     const now = moment().tz(TIMEZONE);
//     const lastYear = now.year() - 1;
//     const start = moment.tz({ year: lastYear, month: 0, day: 1 }, TIMEZONE).startOf('day').toDate();
//     const end = moment.tz({ year: lastYear, month: 11, day: 31 }, TIMEZONE).endOf('day').toDate();

//     const yearlyData = await energyMonthlyModel.aggregate([
//       { $match: { month: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: { entityId: '$entityId' },
//           yearlyTotal: { $sum: '$total' }
//         }
//       },
//       {
//         $project: {
//           entityId: '$_id.entityId',
//           total: '$yearlyTotal',
//           year: start
//         }
//       }
//     ]);

//     await upsertMany(energyYearlyModel, yearlyData, ['entityId', 'year']);
//     console.log('Yearly aggregation done');
//   } catch (error) {
//     console.error('Yearly aggregation error:', error);
//   }
// });
























// const cron = require('node-cron');
// const mongoose = require('mongoose');
// const energyRawHistorySchema = require('../models/energyMeterRawHistory.model');
// const energyHourlyModel = require('../models/energyMeterModels/energyHourly.model');
// const energyDailyModel = require('../models/energyMeterModels/energyDaily.model');
// const energyMonthlyModel = require('../models/energyMeterModels/energyMonthly.model');
// const energyYearlyModel = require('../models/energyMeterModels/energyYearly.model');

// // 1️⃣ Every hour → store hourly usage
// cron.schedule('0 * * * *', async () => {
//     const now = new Date();
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

//     const hourlyData = await energyRawHistorySchema.aggregate([
//         { $match: { time: { $gte: oneHourAgo, $lt: now } } },
//         {
//             $group: {
//                 _id: {
//                     entityId: "$entityId",
//                     hour: { $hour: "$time" },
//                     day: { $dayOfMonth: "$time" },
//                     month: { $month: "$time" },
//                     year: { $year: "$time" }
//                 },
//                 totalValue: { $sum: { $toDouble: "$value" } }
//             }
//         },
//         {
//             $project: {
//                 entityId: "$_id.entityId",
//                 hour: "$_id.hour",
//                 totalValue: 1,
//                 timestamp: now,
//             }
//         }
//     ]);

//     await energyHourlyModel.insertMany(hourlyData);
//     console.log('Hourly aggregation done');
// });

// // 2️⃣ Every night at 12:05 AM → aggregate daily
// cron.schedule('5 0 * * *', async () => {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);

//     const start = new Date(yesterday.setHours(0, 0, 0, 0));
//     const end = new Date(yesterday.setHours(23, 59, 59, 999));

//     const dailyData = await energyHourlyModel.aggregate([
//         { $match: { timestamp: { $gte: start, $lt: end } } },
//         {
//             $group: {
//                 _id: "$entityId",
//                 dailyTotal: { $sum: "$totalValue" },
//             }
//         },
//         {
//             $project: {
//                 entityId: "$_id",
//                 total: "$dailyTotal",
//                 date: start,
//             }
//         }
//     ]);

//     await energyDailyModel.insertMany(dailyData);
//     console.log('Daily aggregation done');
// });

// // 3️⃣ Every 1st of month → aggregate monthly
// cron.schedule('10 0 1 * *', async () => {
//     const now = new Date();
//     const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
//     const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);

//     const monthlyData = await energyDailyModel.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         {
//             $group: {
//                 _id: "$entityId",
//                 monthlyTotal: { $sum: "$total" }
//             }
//         },
//         {
//             $project: {
//                 entityId: "$_id",
//                 total: "$monthlyTotal",
//                 month: start,
//             }
//         }
//     ]);

//     await energyMonthlyModel.insertMany(monthlyData);
//     console.log('Monthly aggregation done');
// });

// // 4️⃣ Every January 1st → aggregate yearly
// cron.schedule('20 0 1 1 *', async () => {
//     const now = new Date();
//     const lastYear = now.getFullYear() - 1;

//     const start = new Date(lastYear, 0, 1);
//     const end = new Date(lastYear, 11, 31, 23, 59, 59, 999);

//     const yearlyData = await energyMonthlyModel.aggregate([
//         { $match: { month: { $gte: start, $lte: end } } },
//         {
//             $group: {
//                 _id: "$entityId",
//                 yearlyTotal: { $sum: "$total" }
//             }
//         },
//         {
//             $project: {
//                 entityId: "$_id",
//                 total: "$yearlyTotal",
//                 year: start,
//             }
//         }
//     ]);

//     await energyYearlyModel.insertMany(yearlyData);
//     console.log('Yearly aggregation done');
// });
