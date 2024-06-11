const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');


const deleteDuplicateNotifications = async () => {
    try {
        // Find all notifications
        const notifications = await Notification.find();

        // Create an object to store unique notification keys
        const uniqueNotificationKeys = {};

        // Filter out duplicate notifications
        const uniqueNotifications = notifications.filter(notification => {
            const notificationKey = `${notification.type}_${notification.invoiceId || notification.customerId}`;
            if (uniqueNotificationKeys.hasOwnProperty(notificationKey)) {
                // Duplicate notification found, return false to filter it out
                return false;
            } else {
                // Add notification key to the object
                uniqueNotificationKeys[notificationKey] = true;
                return true;
            }
        });

        // Delete duplicate notifications from the database
        const duplicateNotificationIds = notifications
            .filter(notification => !uniqueNotifications.includes(notification))
            .map(notification => notification._id);

        if (duplicateNotificationIds.length > 0) {
            await Notification.deleteMany({ _id: { $in: duplicateNotificationIds } });
            console.log(`${duplicateNotificationIds.length} duplicate notifications deleted.`);
        } else {
            console.log('No duplicate notifications found.');
        }
    } catch (err) {
        console.error('Error deleting duplicate notifications:', err.message);
    }
};

// Function to delete all notifications
const deleteAllNotifications = async () => {
    try {
      await Notification.deleteMany({});
      console.log('All notifications deleted successfully');
    } catch (err) {
      console.error('Error deleting notifications:', err.message);
    }
  };


const findInactiveCustomers = async () => {
    // Find IDs of customers who have invoices created more than the last two months
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const recentInvoices = await Invoice.find({
        date: { $lte: twoMonthsAgo }
    }).distinct('customer');

    return recentInvoices;
};
  

const generateNotifications = async () => {    
    const now = new Date();
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));

    // Pending Invoices
    const pendingInvoices = await Invoice.find({ paymentStatus: 'Pending' });
    pendingInvoices.forEach(async (invoice) => {
        const weeksPending = Math.floor((new Date() - new Date(invoice.date)) / (1000 * 60 * 60 * 24 * 7));
        if (weeksPending > 0) {
            const existingNotification = await Notification.findOne({
                type: 'Pending Invoice',
                invoiceId: invoice._id
            });

            if(!existingNotification){
                await Notification.create({
                    type: 'Pending Invoice',
                    message: `Invoice #${invoice.invoiceNumber} has been pending for ${weeksPending} week(s).`,
                    customerId: invoice.customer,
                    invoiceId: invoice._id,
                    user: invoice.user
                });
            }
        }
    });


    // Customers who haven't returned for 2 months
    // const invoicesForLastTwoMonths = await Invoice.find({
    //     date: { $gte: twoMonthsAgo } // Find invoices from the last two months
    // }).distinct('customer')

    // console.log(invoicesForLastTwoMonths)
    // console.log(inactiveCustomers)

    let inactiveCustomersIds = await findInactiveCustomers();
    const inactiveCustomers = await Customer.find({
        _id: { $in: inactiveCustomersIds } // Find customers who don't have invoices in the last two months
    });
    // console.log(inactiveCustomers)
    inactiveCustomers.forEach(async (customer) => {
        
        const existingNotification = await Notification.findOne({
            type: 'Inactive Customer',
            customerId: customer._id
        });

        if (!existingNotification) {
            await Notification.create({
                type: 'Inactive Customer',
                message: `Customer ${customer.name} hasn't returned for more than 2 months.`,
                customerId: customer._id,
                user: customer.user
            });
        }
    });

    // inactiveCustomers.forEach(async (customer) => {
    //     console.log(customer)
    //     const associatedInvoices = await Invoice.find({ customer: customer._id });
    //     console.log(customer._id)
    //     console.log(associatedInvoices)
    //     // Check if the customer has any associated invoices
    //     if (associatedInvoices.length > 0) {
    //         // Check if a notification for this customer already exists
    //         const existingNotification = await Notification.findOne({
    //             type: 'Inactive Customer',
    //             customerId: customer._id
    //         });
    
    //         // Create notification only if it doesn't already exist
    //         if (!existingNotification) {
    //             await Notification.create({
    //                 type: 'Inactive Customer',
    //                 message: `Customer ${customer.name} hasn't returned for more than 2 months.`,
    //                 customerId: customer._id
    //             });
    //         }
    //     }
    // });
};

module.exports = generateNotifications;
