const cron = require('node-cron');
const Order = require("../Models/OrderModel");// delete razorpay orders unpayed

function DeadOrderRemover() {
    // Schedule a cron job to run daily at 12 am (0th hour)
    cron.schedule('0 0 * * *', async () => {
        try {
            // Calculate the date for orders older than a day
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            // Delete orders that are at least a day old and have paymentStatus set to false
            const result = await Order.deleteMany({ date: { $lte: oneDayAgo }, paymentStatus: false });

            console.log(`${result.deletedCount} orders deleted.`);
        } catch (error) {
            console.error('Error deleting orders:', error);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Set your timezone
    });
}

module.exports = DeadOrderRemover;
