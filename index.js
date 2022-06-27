const { DbConnection, getSubscriptionPending, getSubscriptionMetaInfo, updateSubscriptionStatus, updateSubscriptionEndDate } = require("./query");
const moment = require('moment');
require("dotenv").config();
module.exports.handler = async (event, context) => {
    let db = DbConnection();
    try {

        let pendingSubscription, subscription, schduleEndDate;

        pendingSubscription = await getSubscriptionPending(db, 'wc-pending-cancel', 'shop_subscription');

        for (let index in pendingSubscription) {

            subscription = pendingSubscription[index];
            schduleEndDate = await getSubscriptionMetaInfo(db, subscription['ID'], '_schedule_end');            
            schduleEndDate.forEach(function (schduleEndDateMeta) {
                endDate = schduleEndDateMeta.meta_value;
            })

            today = moment().format('YYYY-MM-DD hh:mm:ss');

            if(today >= endDate){

                let updatedSubscriptionStatus = await updateSubscriptionStatus(db, subscription['ID'], 'wc-cancelled');
                let updatedSubscriptionEndDate = await updateSubscriptionEndDate(db, subscription['ID'], '_schedule_end', today);

                console.log('Status changed from pending-cancel to cancelled of ' + updatedSubscriptionStatus.affectedRows + ' subscriptions');
                console.log('After status change of subscription end date also removed from DB for ' + updatedSubscriptionEndDate.affectedRows + ' subscriptions');

            }   

        }

    }
    catch (e) {
        console.log(e)
    }

}

this.handler()