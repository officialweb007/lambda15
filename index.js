const { DbConnection, getSubscriptions, getUserMetaInfo, updateUserMetaInfo, getSubscriptionMeta, checkGiftUser, getSubscriptionMetaInfo } = require("./query");
const moment = require('moment');
require("dotenv").config();
module.exports.handler = async (event, context) => {
    let db = DbConnection();
    try {

        let rows, subscription, subscriptionEndDate;

        rows = await getSubscriptions(db);

        const moment = require('moment');
        var nodemailer = require("nodemailer");
        var fs = require("fs");
        var path = require("path");
        var ejs = require("ejs");
        var mandrillTransport = require('nodemailer-mandrill-transport');

        var smtpTransport = nodemailer.createTransport(mandrillTransport({
            auth: {
              apiKey : process.env.MANDRILL_KEY
            }
        }));
       
        
        for (let index in rows) {

            subscription = rows[index];

            let subscriptionId = subscription['ID'];

            let subscriptionEnd1 = await getSubscriptionMetaInfo(db, subscriptionId, '_schedule_end')
            let userIdMeta = await getSubscriptionMetaInfo(db, subscriptionId, '_customer_user')
            let subscriptionMetaCanc = await getSubscriptionMetaInfo(db, subscriptionId, '_schedule_cancelled')
            let userEmailMeta = await getSubscriptionMetaInfo(db, subscriptionId, '_billing_email')
            let userFirstNameMeta = await getSubscriptionMetaInfo(db, subscriptionId, '_billing_first_name')

            userIdMeta.forEach(function (userMeta) {  
                userId = userMeta.meta_value;
            });
            userEmailMeta.forEach(function (userEmail) {  
                userEmailAdd = userEmail.meta_value;
            });
            subscriptionEnd1.forEach(function (subscriptionEnd) {  
                subscriptionEndDate = subscriptionEnd.meta_value;
            });
            subscriptionMetaCanc.forEach(function (cancelledDate) {  
                subscriptionCancelDate = cancelledDate.meta_value;
            });
            userFirstNameMeta.forEach(function (userFirstName) {  
                userFName = userFirstName.meta_value;
            });

            let printCreditsMeta = await getUserMetaInfo(db, userId, '_user_credits');
            let orderCreditsMeta = await getUserMetaInfo(db, userId, 'order_credits');

            printCreditsMeta.forEach(function (printCreditsMetaInfo) {  
                printCredits = printCreditsMetaInfo.meta_value;
            });
            orderCreditsMeta.forEach(function (orderCreditsMetaInfo) {  
                orderCredits = orderCreditsMetaInfo.meta_value;
            });

                date1 = moment();
                date2 = moment(subscriptionEndDate);

                console.log(date1);
                console.log(date2);
                console.log(printCredits);

                dayDiff = date2.diff(date1, 'days');
                minutesDiff = date2.diff(date1, 'minutes');
                console.log('day difference ' + dayDiff);
                console.log('minutes difference ' + minutesDiff);
                console.log(subscriptionEndDate);   
                subscriptionEndDateFormat = moment(subscriptionEndDate).format('MM/DD/YYYY');

                let couponUsed = await checkGiftUser(db, subscriptionId);

                if(couponUsed.length > 0){
                    giftUser = true;
                }else{
                    giftUser = false;
                }

                if(dayDiff == 60 && printCredits > 0){
                    
                    if(giftUser == true){
                        var emailTemp = fs.readFileSync(path.resolve("./templates/giftuser_cancellation_email_template_60D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "Your Mootsh gift membership expired: A chance to begin again";
                    }else{
                        var emailTemp = fs.readFileSync(path.resolve("./templates/cancellation_email_template_60D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "You have " + dayDiff + " days to use any remaining Mootsh credits";
                    }    

                    var options = {
                        userFName: userFName,
                        subscriptionEndDateFormat: subscriptionEndDateFormat,
                        orderCredits: orderCredits,
                        printCredits: printCredits
                    };

                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : subject,
                        html : emailHtml
                     };
                     
                     // Sending email.
                     smtpTransport.sendMail(mailOptions, function(error, response){
                       if(error) {
                          throw new Error("Error in sending email");
                       }
                       console.log("Message sent: " + JSON.stringify(response));
                     });
                
                }else if(dayDiff == 30 && printCredits > 0){
                
                    if(giftUser == true){
                        var emailTemp = fs.readFileSync(path.resolve("./templates/giftuser_cancellation_email_template_30D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "You have credits in your Mootsh account";
                    }else{
                        var emailTemp = fs.readFileSync(path.resolve("./templates/cancellation_email_template_30D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "You have " + dayDiff + " days to use any remaining Mootsh credits";
                    }   

                    var options = {
                        userFName: userFName,
                        subscriptionEndDateFormat: subscriptionEndDateFormat,
                        orderCredits: orderCredits,
                        printCredits: printCredits
                    };
                    
                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : subject,
                        html : emailHtml
                     };
                     
                     // Sending email.
                     smtpTransport.sendMail(mailOptions, function(error, response){
                       if(error) {
                          throw new Error("Error in sending email");
                       }
                       console.log("Message sent: " + JSON.stringify(response));
                     });
                
                }else if(dayDiff == 7 && printCredits > 0){
                    
                    if(giftUser == true){
                        var emailTemp = fs.readFileSync(path.resolve("./templates/giftuser_cancellation_email_template_7D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "Our Mootsh account is deactivating soon";
                    }else{
                        var emailTemp = fs.readFileSync(path.resolve("./templates/cancellation_email_template_7D.html"), "utf8");
                        var emailHtml = ejs.render(emailTemp, options);
                        var subject = "Last reminder: Your Mootsh credits expire in " + dayDiff + " days";
                    }   

                    var options = {
                        userFName: userFName,
                        subscriptionEndDateFormat: subscriptionEndDateFormat,
                        orderCredits: orderCredits,
                        printCredits: printCredits
                    };

                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : subject,
                        html : emailHtml
                     };
                     
                     // Sending email.
                     smtpTransport.sendMail(mailOptions, function(error, response){
                       if(error) {
                          throw new Error("Error in sending email");
                       }
                       console.log("Message sent: " + JSON.stringify(response));
                     });
                    
                }else if(dayDiff <= 0 && minutesDiff <= 0){
                
                        let orderCreditsMeta = await getUserMetaInfo(db, userId, 'order_credits');
                        let userCreditsMeta = await getUserMetaInfo(db, userId, '_user_credits');
                
                        orderCreditsMeta.forEach(function(orderCreditsInfo){
                            orderCredits = orderCreditsInfo.meta_value;
                        });
                        userCreditsMeta.forEach(function(userCreditsInfo){
                            userCredits = userCreditsInfo.meta_value;
                        });

                        let row1 = [], row2 = [];

                        if(orderCredits != 0){
                            row1 = await updateUserMetaInfo(db, userId, 'prev_order_credit', orderCredits);
                        }else{
                            row1['affectedRows'] = 0;
                        }
                        if(userCredits != 0){
                            row2 = await updateUserMetaInfo(db, userId, 'prev_user_credit', userCredits);
                        }else{
                            row2['affectedRows'] = 0;

                        }          
                
                        if(row1.affectedRows == 1){
                            orderCredits = 0;
                            await updateUserMetaInfo(db, userId, 'order_credits', orderCredits);
                        }
                        if(row2.affectedRows == 1){
                            userCredits = 0;
                            await updateUserMetaInfo(db, userId, '_user_credits', userCredits);
                        }
                
                }
            

        }





    }
    catch (e) {
        console.log(e)
    }

}

this.handler()