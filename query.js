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

async function getOrdersfromPo(db, status) {
    let query = `SELECT * from print_orders where order_status = ${status} ORDER BY RAND() LIMIT 1`
    let result = db.Query(query);
    return result;

}

async function getReceWelcomeCardInfo(db, user_id) {
    let query = `SELECT * FROM wp_usermeta where meta_key = 'received_welcome_card' and user_id = ${user_id}`
    let result = db.Query(query);
    return result;

}

async function getPostMetaInfo(db, meta_key, wocommerce_id) {
    let query = `SELECT * from wp_postmeta where meta_key = '${meta_key}' and post_id = ${wocommerce_id}`
    let result = db.Query(query);
    return result;

}

async function getPostMeta(db, wocommerce_id) {
    let query = `SELECT * from wp_postmeta where post_id = ${wocommerce_id}`
    let result = db.Query(query);
    return result;

}

async function getPostStatus(db, wocommerce_id) {
    let query = `SELECT post_status from wp_posts where ID = ${wocommerce_id}`
    let result = db.Query(query);
    return result;

}

async function getOrderPhotos(db, order_id) {
    let query = `SELECT * from order_photos where order_id = ${order_id}`
    let result = db.Query(query);
    return result;

}

async function insertRecWelCardRecord(db, user_id, status) {
    let query = `INSERT INTO wp_usermeta ('user_id', 'meta_key', 'meta_value') VALUES (${user_id}, 'received_welcome_card', ${status})`
    let result = db.Query(query);
    return result;

}

async function updateStatusAfterLab(db, photo_lab_order_id, order_id, status) {
    let query = `UPDATE print_orders set order_status = ${status}, photo_lab_order_id = ${photo_lab_order_id} WHERE order_id = ${order_id}`
    let result = db.Query(query);
    return result;

}

async function updateItemCode(db, item_code, itemCodeVal, wocommerce_id) {
    let query = `UPDATE wp_postmeta set meta_key = '${item_code}', meta_value = '${itemCodeVal}' WHERE post_id = ${wocommerce_id}`
    let result = db.Query(query);
    return result;

}

module.exports = {
    getOrdersfromPo,
    getReceWelcomeCardInfo,
    getPostMetaInfo,
    getPostMeta,
    getPostStatus,
    getOrderPhotos,
    insertRecWelCardRecord,
    updateStatusAfterLab,
    updateItemCode,
    DbConnection
};