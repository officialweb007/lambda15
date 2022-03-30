const { addCronLog, setPrintOrderStatus, getOrderPhotosByOrderId, getPrintOrdersByStatus, DbConnection } = require("./query")
require("dotenv").config();
module.exports.handler = async(event, context) => {

    try {

        let db = DbConnection()

        const printOrdersRows = await getPrintOrdersByStatus(db, 92);

        printOrdersRows.forEach(printOrdersRow => {

            const orderPrints = getOrderPhotosByOrderId(db, printOrdersRow.order_id);

            let normal_photos = 0;
            let montage_photos = 0;
            let ready_for_print = true;
            let converted_images = true;
            let has_montage = false;

            orderPrints.forEach(orderPrint => {

                if (orderPrint.status == 0) {
                    converted_images = false;
                }
                if (orderPrint.status == 1) {
                    normal_photos += 1;
                }
                if (orderPrint.status == 9) {
                    has_montage = true;
                    montage_photos += 1;
                }

            });

            let expected_montage_photos = Math.round(normal_photos / 10);

            if (has_montage && converted_images && (expected_montage_photos == montage_photos)) {

                const printOrderStatus = setPrintOrderStatus(db, 3, printOrdersRow.order_id);

                let message = 'Order ' + printOrdersRow.order_id + ' is ready for print.';

                addCronLog(db, message);

            }

        });


    } catch (e) {

        console.log(e);

    }

}

this.handler()