// const cron = require('node-cron');
// const Invoice = require('./models/Invoice');

// // Function to send notifications (implement the actual notification logic)
// const sendNotification = (reminder) => {
//     console.log(`Sending notification: ${reminder.message}`);
//     // Implement the logic to send notification (e.g., email, SMS)
// };

// // Schedule a job to run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     const now = new Date();
//     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

//     const invoices = await Invoice.find({
//         'reminders.date': {
//             $gte: startOfDay,
//             $lt: endOfDay
//         }
//     });

//     invoices.forEach(invoice => {
//         invoice.reminders.forEach(reminder => {
//             if (reminder.date >= startOfDay && reminder.date < endOfDay) {
//                 sendNotification(reminder);
//             }
//         });
//     });
// });

// console.log('Reminder scheduler started.');
