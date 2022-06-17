const { DbConnection, getSubscriptions, getUserMetaInfo, updateUserMetaInfo, getSubscriptionMeta, getSubscriptionMetaInfo } = require("./query");
const moment = require('moment');
require("dotenv").config();
module.exports.handler = async (event, context) => {
    let db = DbConnection();
    try {

        let rows, subscription, subscriptionEndDate;

        rows = await getSubscriptions(db);

        // console.log(rows);

        const moment = require('moment');
        var nodemailer = require("nodemailer");
        var mandrillTransport = require('nodemailer-mandrill-transport');

        var smtpTransport = nodemailer.createTransport(mandrillTransport({
            auth: {
              apiKey : process.env.MANDRILL_KEY
            }
        }));
        
        for (let index in rows) {

            subscription = rows[index];

            let subscriptionId = subscription['ID'];

            console.log(subscriptionId);

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

                date1 = moment();
                date2 = moment(subscriptionEndDate);

                console.log(date1);
                console.log(date2);

                dayDiff = date2.diff(date1, 'days');
                minutesDiff = date2.diff(date1, 'minutes');
                console.log('day difference ' + dayDiff);
                console.log('minutes difference ' + minutesDiff);
                console.log(subscriptionEndDate);   
                let subscriptionEndDateFormat = moment(subscriptionEndDate).format('MM/DD/YYYY');

                if(dayDiff == 60){
                    

                    let message = "<table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-2' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'><tbody><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2019/03/mootsh-photos-logo.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr><tr><td><table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 550px;' width='550'><tbody><tr><td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'><table border='0' cellpadding='0' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'><tr><td style='padding-bottom:20px;padding-left:25px;padding-right:25px;padding-top:20px;'><div style='font-family: Arial, sans-serif'><div style='font-size: 14px; mso-line-height-alt: 25.2px; color: #222222; line-height: 1.8; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;'><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Dear " + userFName + ",</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>We’re writing to confirm that your Mootsh membership has been canceled. We hope you enjoyed your experience and are sorry to see you go. </span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'><strong>Your account will remain active until " + subscriptionEndDateFormat + "</strong>. Please make sure to use any remaining order and print credits before that date.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>If this is a mistake or if you need any assistance accessing your account or using your credit balance please reach out to us at <a href='mailto:info@mootsh.com' style='color: #0068A5;'>info@mootsh.com</a> and we will be happy to assist.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Warmly,</span></p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Team Mootsh</span></p></div></div></td></tr><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2022/06/petites-fleurs-mootsh.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr></table></td></tr></tbody></table></td></tr></tbody></table>";
                
                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : "Reminder " + dayDiff + " Days Before Cancellation of Mootsh Membership",
                        html : message
                     };
                     
                     // Sending email.
                     smtpTransport.sendMail(mailOptions, function(error, response){
                       if(error) {
                          throw new Error("Error in sending email");
                       }
                       console.log("Message sent: " + JSON.stringify(response));
                     });
                
                }else if(dayDiff == 30){
                
                   let message = "<table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-2' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'><tbody><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2019/03/mootsh-photos-logo.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr><tr><td><table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 550px;' width='550'><tbody><tr><td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'><table border='0' cellpadding='0' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'><tr><td style='padding-bottom:20px;padding-left:25px;padding-right:25px;padding-top:20px;'><div style='font-family: Arial, sans-serif'><div style='font-size: 14px; mso-line-height-alt: 25.2px; color: #222222; line-height: 1.8; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;'><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Dear " + userFName + ",</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>We’re writing to confirm that your Mootsh membership has been canceled. We hope you enjoyed your experience and are sorry to see you go. </span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'><strong>Your account will remain active until " + subscriptionEndDateFormat + "</strong>. Please make sure to use any remaining order and print credits before that date.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>If this is a mistake or if you need any assistance accessing your account or using your credit balance please reach out to us at <a href='mailto:info@mootsh.com' style='color: #0068A5;'>info@mootsh.com</a> and we will be happy to assist.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Warmly,</span></p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Team Mootsh</span></p></div></div></td></tr><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2022/06/petites-fleurs-mootsh.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr></table></td></tr></tbody></table></td></tr></tbody></table>";
                
                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : "Reminder " + dayDiff + " Days Before Cancellation of Mootsh Membership",
                        html : message
                     };
                     
                     // Sending email.
                     smtpTransport.sendMail(mailOptions, function(error, response){
                       if(error) {
                          throw new Error("Error in sending email");
                       }
                       console.log("Message sent: " + JSON.stringify(response));
                     });
                
                }else if(dayDiff == 7){
                    
                    let message = "<table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-2' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'><tbody><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2019/03/mootsh-photos-logo.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr><tr><td><table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 550px;' width='550'><tbody><tr><td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'><table border='0' cellpadding='0' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'><tr><td style='padding-bottom:20px;padding-left:25px;padding-right:25px;padding-top:20px;'><div style='font-family: Arial, sans-serif'><div style='font-size: 14px; mso-line-height-alt: 25.2px; color: #222222; line-height: 1.8; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;'><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Dear " + userFName + ",</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>We’re writing to confirm that your Mootsh membership has been canceled. We hope you enjoyed your experience and are sorry to see you go. </span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'><strong>Your account will remain active until " + subscriptionEndDateFormat + "</strong>. Please make sure to use any remaining order and print credits before that date.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>If this is a mistake or if you need any assistance accessing your account or using your credit balance please reach out to us at <a href='mailto:info@mootsh.com' style='color: #0068A5;'>info@mootsh.com</a> and we will be happy to assist.</span></p><p style='margin: 0; font-size: 15px; text-align: center; letter-spacing: normal; mso-line-height-alt: 25.2px;'> </p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Warmly,</span></p><p style='margin: 0; text-align: center; font-size: 15px; mso-line-height-alt: 27px; letter-spacing: normal;'><span style='font-size:15px;'>Team Mootsh</span></p></div></div></td></tr><tr align='center'><td><img src='https://mootsh.com/wp-content/uploads/2022/06/petites-fleurs-mootsh.png' width='275px' style='display:block;height:auto;border:0;width:193px;max-width:100%' /></td></tr></table></td></tr></tbody></table></td></tr></tbody></table>";
                
                    let mailOptions={
                        from : "Mootsh <" + process.env.ADMIN_EMAIL + ">",
                        to : userEmailAdd,
                        subject : "Reminder " + dayDiff + " Days Before Cancellation of Mootsh Membership",
                        html : message
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