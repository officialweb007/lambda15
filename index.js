const { addCronLog, setPrintOrderStatus, getOrderPhotosByOrderId, getPrintOrdersByStatus, DbConnection } = require("./query")
require("dotenv").config();
module.exports.handler = async(event, context) => {
    let db = DbConnection()
    try {

        const printOrdersRows = await getPrintOrdersByStatus(db, 2);

        for (let index in printOrdersRows) {

            let row = printOrdersRows[index];

            const orderPrints = await getOrderPhotosByOrderId(db, row.order_id)

            let normal_photos = 0;
            let montage_photos = 0;
            let ready_for_print = true;
            let converted_images = true;
            let has_montage = false;

            // console.log(orderPrints);

            for (let index2 in orderPrints) {

                let orderPrint = orderPrints[index2];

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

            }

            let expected_montage_photos = Math.round(normal_photos / 10);

            //console.log(expected_montage_photos);

            if (has_montage && converted_images && (expected_montage_photos == montage_photos)) {

                const printOrderStatus = setPrintOrderStatus(db, 3, row.order_id);

                let message = 'Order ' + row.order_id + ' is ready for print.';

                await addCronLog(db, message);

            }

        }


    } catch (e) {

        console.log(e);

    }

}

this.handler()