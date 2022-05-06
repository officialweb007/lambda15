const { DbConnection, getOrdersfromPo, getReceWelcomeCardInfo, getPostMetaInfo, getPostStatus, getOrderPhotos, getPostMeta, updateStatusAfterLab, getPostMetabykey, updateItemCode, insertItemCode, insertRecWelCardRecord } = require("./query")
require("dotenv").config();
module.exports.handler = async(event, context) => {
    let db = DbConnection();
    try {

        let rows = await getOrdersfromPo(db, 3);

        let mailer;
        let total_prints = 0;
        let midi_prints_count = 0;
        let include_welcome = false;
        let gift_note = false;
        let sorted_orders;
        let itemsArray = [];

        // loop
        for (let index in rows) {

            let row = rows[index];
            let order_id = row['order_id'];
            let wocommerce_id = row['woocommerce_order'];
            let user_id = row['user_id'];

            let welcomeCardInfo = await getReceWelcomeCardInfo(db, user_id);

            console.log(wocommerce_id);

            if (!welcomeCardInfo) {

                include_welcome = true;

            }

            let completedDateArr = await getPostMetaInfo(db, '_date_completed', wocommerce_id);
            let orderStatusArr = await getPostStatus(db, wocommerce_id);
            let postStatus, completedDate, orderDate, paid, inc_borders, orientation, crop_details = [], items = [];
            let prints_4x6 = [];
            let prints_338x6 = [];
            let prints_4x4 = [];
            let prints_375x5 = [];
            let prints_5x7 = [];
            let prints_montage = [];

            orderStatusArr.forEach(orderStatus => {
                postStatus = orderStatus.post_status;
            });

            // console.log(completedDateArr);

            for (let index in completedDateArr) {

                completedDate = completedDateArr[index];
                orderDate = completedDate.meta_value;
                // console.log(orderDate);
            }

            // completedDateArr.forEach(completedDate => {

            // });

            if (orderDate.length > 1 && postStatus === 'wc-completed') {
                paid = true;
            } else {
                paid = false;
            }

            let orderPhotosRecords = await getOrderPhotos(db, order_id);

            let includeBorders = await getPostMetaInfo(db, '_include_borders', wocommerce_id);

            includeBorders.forEach(includeBorder => {
                inc_borders = includeBorder.meta_value;
            });

            const product_code_map = {
                '1.775-b': 'CP3386M-16-F',
                "1.5-b": 'CP46M-16-F',
                "1.4-b": 'CP57M-16-F',
                "1.333-b": 'CP3755M-16-F',
                "1-b": 'CP44M-16-F',
                "0.75-b": 'CP3755M-16-F',
                "0.666-b": 'CP46M-16-F',
                "0.563-b": 'CP3386M-16-F',
                "0.714-b": 'CP57M-16-F',
                "1.775": 'CP3386M-F',
                "1.5": 'CP46M-F',
                "1.333": 'CP3755M-F',
                "1.4": 'CP57M-F',
                "1": 'CP44M-F',
                "0.75": 'CP3755M-F',
                "0.666": 'CP46M-F',
                "0.563": 'CP3386M-F',
                "0.714": 'CP57M-F'
            };

            const iterations = orderPhotosRecords.length;

            for (let index in orderPhotosRecords) {

                let orderPhotosRecord = orderPhotosRecords[index];

                if (orderPhotosRecord['status'] == 2) {

                    gift_note = true;
                    let product_code = "CP46M-F";
                    let crop_details = [0, 0, 1, 1];
                    orientation = 0;
                    items = {
                        'ItemCode': product_code,
                        'Quantity': 1,
                        'IPath': orderPhotosRecord['href'],
                        'Orientation': orientation,
                        'Cropdetails': crop_details
                    };

                }

                if (orderPhotosRecord['status'] != 9) {


                    switch (orderPhotosRecord['selected_crop']) {

                        case 0.563:
                            prints_338x6.push(orderPhotosRecord);
                            break;

                        case 1.775:
                            prints_338x6.push(orderPhotosRecord);
                            break;

                        case 1.5:
                            prints_4x6.push(orderPhotosRecord);
                            break;

                        case 0.666:
                            prints_4x6.push(orderPhotosRecord);
                            break;

                        case 1.333:
                            prints_375x5.push(orderPhotosRecord);
                            break;

                        case 0.75:
                            prints_375x5.push(orderPhotosRecord);
                            break;

                        case 1:
                            prints_4x4.push(orderPhotosRecord);
                            break;

                        case 1.4:
                            prints_5x7.push(orderPhotosRecord);
                            break;

                        case 0.714:
                            prints_5x7.push(orderPhotosRecord);
                            break;

                        default:
                            break;
                    }

                } else {

                    prints_montage.push(orderPhotosRecord);

                }

                sorted_orders = prints_338x6.concat(prints_4x6, prints_4x4, prints_375x5, prints_5x7, prints_montage); 

            }

            for (let index in sorted_orders) {

                let sorted_order = sorted_orders[index];

                // let cropped = false;
                // let crop_from_center = false;
                // let test = false;

                if (sorted_order['status'] == 2) {
                    continue;
                }

                if (sorted_order['status'] != 9) {
                    let look_for = sorted_order['selected_crop'];
                    
                    if (inc_borders == 'yes') {
                        look_for += '-b';
                    }

                    product_code = product_code_map[look_for];

                } else {
                    product_code = 'CP57M-F';

                    if (inc_borders == 'yes') {

                    }
                }

                if ((product_code === "CP57M-16-F" || product_code === "CP57M-F") && sorted_order['status'] != 9) {
                    midi_prints_count += sorted_order['quantity'];
                }

                if (sorted_order['status'] == 9) {

                    crop_details = [0, 0, 1, 1];
                    orientation = 0;

                } else {

                    let x1 = 0;
                    let x2 = 1;
                    let y1 = 0;
                    let y2 = 1;
                    let ratio = Math.round(sorted_order['height'] / sorted_order['width'], 3);
                    orientation = 0;

                    if (0.99 < ratio && ratio < 1.01) {
                        ratio = 1;
                    }

                    let new_ratio = sorted_order['selected_crop'];

                    let proposed_width = sorted_order['height'] / new_ratio;
                    let proposed_height = sorted_order['height'];

                    if (proposed_width > sorted_order['width']) {
                        proposed_height = sorted_order['width'] * new_ratio;
                        proposed_width = sorted_order['width'];
                    }

                    let height_difference = Math.abs(proposed_height - sorted_order['height']);
                    let width_difference = Math.abs(proposed_width - sorted_order['width']);

                    if (height_difference > width_difference) {
                        // crop vertically
                        x1 = 0;
                        x2 = 1;

                        if (sorted_order['y_crop'] > 0) {

                            y1 = sorted_order['y_crop'];
                            y2 = y1 + ((proposed_height / sorted_order['height']));

                        } else {

                            let fraction_difference_y = height_difference / sorted_order['height'];
                            y1 = fraction_difference_y / 2;
                            y2 = y1 + (proposed_height / sorted_order['height']);

                        }

                    } else {

                        // crop horizontally
                        y1 = 0;
                        y2 = 1;
                        if (sorted_order['x_crop'] > 0) {

                            x1 = sorted_order['x_crop'];
                            x2 = x1 + ((proposed_width / sorted_order['width']));

                        } else {
                            let fraction_difference_x = width_difference / sorted_order['width'];
                            x1 = fraction_difference_x / 2;
                            x2 = x1 + ((proposed_width / sorted_order['width']));
                        }

                    }

                    crop_details = [x1, y1, x2, y2];

                }

                if (sorted_order['status'] == 1) {
                    total_prints += sorted_order['quantity'];
                }                

                items.push({
                    'ItemCode': product_code,
                    'Quantity': sorted_order['quantity'],
                    'IPath': sorted_order['href'],
                    'Orientation': orientation,
                    'Cropdetails': crop_details
                }); 
                                
            }

            //Small Prints count , prints excluding the midi prints

            let small_prints = 0;
            let glassine;
            let sleeve;
            let optionArray;
            let options = [];

            small_prints = total_prints - midi_prints_count;

            if (small_prints > 0 && small_prints <= 20) {
                glassine = 1;
                sleeve = 1;
            } else if (small_prints > 20 && small_prints <= 40) {
                glassine = 2;
                sleeve = 2;
            } else if (small_prints > 40 && small_prints <= 60) {
                glassine = 3;
                sleeve = 3;
            } else if (small_prints > 60 && small_prints <= 80) {
                glassine = 4;
                sleeve = 4;
            } else if (small_prints > 80 && small_prints <= 100) {
                glassine = 5;
                sleeve = 5;
            } else if (small_prints > 100 && small_prints <= 120) {
                glassine = 6;
                sleeve = 6;
            } else if (small_prints > 120 && small_prints <= 140) {
                glassine = 7;
                sleeve = 7;
            } else if (small_prints > 140 && small_prints <= 160) {
                glassine = 8;
                sleeve = 8;
            }

            if (small_prints == 0) {
                sleeve = 1;
                glassine = 0;
            }

            //Midi indicated envolpe for Midi Prints(5x7). It is initialized to 0 here.
            let midi = 0;

            if (midi_prints_count > 0 && midi_prints_count <= 20) {
                midi = 1;
            } else if (midi_prints_count > 20 && midi_prints_count <= 40) {
                midi = 2;
            } else if (midi_prints_count > 40 && midi_prints_count <= 60) {
                midi = 3;
            } else if (midi_prints_count > 60 && midi_prints_count <= 80) {
                midi = 4;
            } else if (midi_prints_count > 80 && midi_prints_count <= 100) {
                midi = 5;
            } else if (midi_prints_count > 100 && midi_prints_count <= 120) {
                midi = 6;
            } else if (midi_prints_count > 120 && midi_prints_count <= 140) {
                midi = 7;
            } else if (midi_prints_count > 140 && midi_prints_count <= 160) {
                midi = 8;
            }

            if (total_prints > 0 && total_prints <= 40) {
                mailer = 'MOOTSH-MA';
            } else if (total_prints > 40 && total_prints <= 80) {
                mailer = 'MOOTSH-MB';
            } else if (total_prints > 80) {
                mailer = 'MOOTSH-C';
            }

            optionArray = {
                'ItemCode': mailer,
                'Quantity': 1
            };

            options.push(optionArray);

            if (sleeve != 0) {
                optionArray = {
                    'ItemCode': "MOOTSH-S",
                    'Quantity': sleeve
                };
                options.push(optionArray);

                let checkItemCode = await getPostMetabykey(db, optionArray['ItemCode'], wocommerce_id);

                console.log(checkItemCode.length)

                if(checkItemCode.length == 0){
                    var abc = await insertItemCode(db, wocommerce_id, optionArray['ItemCode'], sleeve );
                    console.log(abc);
                }else{
                    var cde = await updateItemCode(db, optionArray['ItemCode'], 1, wocommerce_id );
                    console.log(cde);
                }
                

            }

            if (glassine != 0) {
                optionArray = {
                    'ItemCode': "MOOTSH-GE",
                    'Quantity': glassine
                };
               options.push(optionArray);
               
               let checkItemCode = await getPostMetabykey(db, optionArray['ItemCode'], wocommerce_id);

               console.log(checkItemCode.length)

               if(checkItemCode.length == 0){
                   var abc = await insertItemCode(db, wocommerce_id, optionArray['ItemCode'], glassine );
                   console.log(abc);
               }else{
                   var cde = await updateItemCode(db, optionArray['ItemCode'], 1, wocommerce_id );
                   console.log(cde);
               }
            }

            if (midi != 0) {
                optionArray = {
                    'ItemCode': "MOOTSH-PW",
                    'Quantity': midi
                };
                options.push(optionArray);
               
                let checkItemCode = await getPostMetabykey(db, optionArray['ItemCode'], wocommerce_id);
 
                console.log(checkItemCode.length)
 
                if(checkItemCode.length == 0){
                    var abc = await insertItemCode(db, wocommerce_id, optionArray['ItemCode'], midi );
                    console.log(abc);
                }else{
                    var cde = await updateItemCode(db, optionArray['ItemCode'], 1, wocommerce_id );
                    console.log(cde);
                }
            }

            if (!gift_note) {
                if (include_welcome) {
                    optionArray = {
                        'ItemCode': "MOOTSH-WC",
                        'Quantity': 1
                    };
                    options.push(optionArray);              

                }
                
                let checkItemCode = await getPostMetabykey(db, optionArray['ItemCode'], wocommerce_id);
 
                console.log(checkItemCode.length)
 
                if(checkItemCode.length == 0){
                    optionArray['ItemCode'] = 'MOOTSH-WC';
                    var abc = await insertItemCode(db, wocommerce_id, optionArray['ItemCode'], optionArray['Quantity'] );
                    console.log(abc);
                }else{
                    optionArray['ItemCode'] = 'MOOTSH-WC';
                    var cde = await updateItemCode(db, optionArray['ItemCode'], 1, wocommerce_id );
                    console.log(cde);
                }
            }                

            let po_order_id = 'PO' + wocommerce_id;

            let OrderReference = 'Customer order';

            let use_billing = true;
            let shipping;

            let shippingAddress_1 = await getPostMetaInfo(db, '_shipping_address_1', wocommerce_id);
            let shippingAddress_2 = await getPostMetaInfo(db, '_shipping_address_2', wocommerce_id);
            let shippingFirstName = await getPostMetaInfo(db, '_shipping_first_name', wocommerce_id);
            let shippingLastName = await getPostMetaInfo(db, '_shipping_last_name', wocommerce_id);
            let shippingCity = await getPostMetaInfo(db, '_shipping_city', wocommerce_id);
            let shippingState = await getPostMetaInfo(db, '_shipping_state', wocommerce_id);
            let shippingPostcode = await getPostMetaInfo(db, '_shipping_postcode', wocommerce_id);
            let shippingCountry= await getPostMetaInfo(db, '_shipping_country', wocommerce_id);
            let billingCountry= await getPostMetaInfo(db, '_billing_country', wocommerce_id);

            shippingAddress_1.forEach(sAdrress1 => {
                shippingAddress1 = sAdrress1.meta_value;
            })
            shippingAddress_2.forEach(sAdrress2 => {
                shippingAddress2 = sAdrress2.meta_value;
            })
            shippingFirstName.forEach(sFirstName => {
                shippingFirstName = sFirstName.meta_value;
            })
            shippingLastName.forEach(sLastName => {
                shippingLastName = sLastName.meta_value;
            })
            shippingCity.forEach(sCity => {
                orderShippingCity = sCity.meta_value;
            })
            shippingState.forEach(sState => {
                orderShippingState = sState.meta_value;
            })
            shippingPostcode.forEach(sPostcode => {
                orderPostCode = sPostcode.meta_value;
            })
            shippingCountry.forEach(sCountry => {
                orderShippingCountry = sCountry.meta_value;
                orderShippingCountryLc = orderShippingCountry.toLowerCase();
            })
            billingCountry.forEach(bCountry => {
                orderBillingCountry = bCountry.meta_value;
                orderBillingCountryLc = orderBillingCountry.toLowerCase();
            })

            if (shippingAddress1.length > 2 && orderShippingCity.length > 2) {
                use_billing = false;
            }
        
            if(!use_billing && orderShippingCountryLc == 'us' || orderShippingCountryLc == 'usa') {
                shipping = {
                  "CustomerName" :  shippingFirstName + ' ' + shippingLastName,
                  "Address1" : shippingAddress1,
                  "Address2" : shippingAddress2,
                  "City" : orderShippingCity,
                  "State" : orderShippingState,
                  "PostalCode" : orderPostCode,
                  "Country" : orderShippingCountry,
                  "Phone" : 6262244463,
                  "ShippingMethod" : "SUSS"
                };
              } else if (use_billing && orderBillingCountryLc == 'us' || orderBillingCountryLc == 'usa') {
                shipping = {
                    "CustomerName" :  shippingFirstName + ' ' + shippingLastName,
                    "Address1" : shippingAddress1,
                    "Address2" : shippingAddress2,
                    "City" : orderShippingCity,
                    "State" : orderShippingState,
                    "PostalCode" : orderPostCode,
                    "Country" : orderShippingCountry,
                    "Phone" : 6262244463,
                    "ShippingMethod" : "SUSS"
                };
              }else if (orderBillingCountryLc == 'ca' || orderShippingCountryLc == 'ca') {
                shipping = {
                    "CustomerName" :  shippingFirstName + ' ' + shippingLastName,
                    "Address1" : shippingAddress1,
                    "Address2" : shippingAddress2,
                    "City" : orderShippingCity,
                    "State" : orderShippingState,
                    "PostalCode" : orderPostCode,
                    "Country" : orderShippingCountry,
                    "Phone" : 6262244463,
                    "ShippingMethod" : "SCS"
                };
              }else {
                shipping = {
                  "CustomerName" : 'Mootsh Inc',
                  "Address1" : '4136 Del Rey Ave',
                  "Address2" : '',
                  "City" : 'Marina del Rey',
                  "State" : 'CA',
                  "PostalCode" : '90292',
                  "Country" : 'US',
                  "Phone" : 6262244463,
                  "ShippingMethod" : "SIS"
                };
              }

              let payload = {

                        'CustomerID' : 70457,
                        'APIKey' : '64f8c38702fab2530fb9fdd4f0e08329df72607c',
                        'Version' : '1.1',
                        'RequestType' : process.env.env === 'live' ? 1 : 0,
                        'Order' : {
                                'Header' : {
                                        'OrderPONum' : po_order_id,
                                        'OrderReference' : OrderReference,
                                        'Customer' : {
                                            'AccountName' : 'Mootsh, Inc.',
                                            'Phone' : 6262244463,
                                            'Email' : process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : 'info@mootsh.com',
                                        },
                                        'Shipping' : shipping,
                                    },
                                'Items' : items,
                                'Options' : options,
                            },

                };
                //console.log(items);
               console.log(JSON.stringify(payload));

                if(payload) {
                    let finalOutPut = await updateStatusAfterLab(db, po_order_id, wocommerce_id, 4);
                    console.log(finalOutPut);
            
                }

        }


    } catch (e) {

        console.log(e);

    }

}

this.handler()