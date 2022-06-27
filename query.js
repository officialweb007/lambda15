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

//quaries

async function getSubscriptions(db) {
    let query = `SELECT * FROM wp_posts WHERE post_type = 'shop_subscription' AND post_status = 'wc-pending-cancel'`;
    let result = db.Query(query);
    return result;

}

async function getSubscriptionMetaInfo(db, subscriptionId, meta_key) {
    let query = `SELECT meta_value FROM wp_postmeta WHERE post_id = ${subscriptionId} AND meta_key = '${meta_key}'`;
    let result = db.Query(query);
    return result;

}

async function getSubscriptionMeta(db, subscriptionId) {
    let query = `SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ${subscriptionId}`;
    let result = db.Query(query);
    return result;

}

async function getUserMetaInfo(db, user_id, meta_key) {
    let query = `SELECT meta_value FROM wp_usermeta WHERE user_id = ${user_id} AND meta_key = '${meta_key}'`;
    let result = db.Query(query);
    return result;

}

async function checkGiftUser(db, subscriptionId) {
    let query = `SELECT * FROM wp_woocommerce_order_items WHERE order_id = ${subscriptionId} AND order_item_name IN ('vz0rf3f0nr6n9jubwy', 'p0dx^d&02bxwyn!syd')`;
    let result = db.Query(query);
    return result;

}

async function updateUserMetaInfo(db, user_id, meta_key, meta_value) {
    let query = `UPDATE wp_usermeta set meta_value = '${meta_value}' WHERE user_id = ${user_id} and meta_key = '${meta_key}'`
    let result = db.Query(query);
    return result;

}

async function getPostMeta(db, subscriptionId) {
    let query = `SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = '${subscriptionId}' AND meta_key IN ('_schedule_end', '_billing_first_name', '_customer_user', '_schedule_cancelled', '_billing_email')`
    let result = db.Query(query);
    return result;

}

async function getUserMeta(db, user_id) {
    let query = `SELECT meta_key, meta_value FROM wp_usermeta WHERE user_id = '${user_id}' AND meta_key IN ('_user_credits', 'order_credits')`
    let result = db.Query(query);
    return result;

}

module.exports = {
    getSubscriptions,
    getSubscriptionMetaInfo,
    getSubscriptionMeta,
    getUserMetaInfo,
    updateUserMetaInfo,
    checkGiftUser,
    getPostMeta,
    getUserMeta,
    DbConnection
};