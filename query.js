async function initDB() {
    const { HOST, USER, PASSWORD, PORT, DATABASE } = process.env
    return require('serverless-mysql')({
        config: {
            host: HOST,
            user: USER,
            password: PASSWORD,
            port: PORT,
            database: DATABASE
        }
    })

}

var DbConnection = function() {

    var db = null;
    var instance = 0;

    async function DbConnect() {
        try {
            let _db = initDB()
            return _db
        } catch (e) {
            return e;
        }
    }

    async function Get() {
        try {
            instance++; // this is just to count how many times our singleton is called.
            console.log(`DbConnection called ${instance} times`);

            if (db != null) {
                console.log(`db connection is already alive`);
                return db;
            } else {
                console.log(`getting new db connection`);
                db = await DbConnect();
                return db;
            }
        } catch (e) {
            return e;
        }
    }

    async function Close() {
        return await db.end()
    }

    async function Query(query, params = []) {
        try {
            let mysql_conn = await Get()
            let result = mysql_conn.query(query, params)
            return result
        } catch (err) {
            console.log(err);
            throw err;
        }
    }


    return {
        Get: Get,
        Close: Close,
        Query: Query
    }
}

async function getPrintOrdersByStatus(db, status) {
    let query = `SELECT * FROM print_orders WHERE order_status = ${status} LIMIT 5`
    let result = db.Query(query);
    return result;

}

async function getOrderPhotosByOrderId(db, orderId) {
    let query = `SELECT * FROM order_photos WHERE order_id = ${orderId}`
    let result = db.Query(query);
    return result;

}

async function setPrintOrderStatus(db, status, orderId) {
    let query = `UPDATE print_orders set order_status = ${status} where order_id = ${orderId}`
    let result = db.Query(query);
    return result;

}

async function addCronLog(db, message) {
    let query = `INSERT INTO cron_log (message) VALUES (${message})`
    let result = db.Query(query);
    return result;

}

module.exports = {
    getPrintOrdersByStatus,
    getOrderPhotosByOrderId,
    setPrintOrderStatus,
    addCronLog,
    DbConnection
};