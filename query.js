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

async function getSubscriptionPending(db, status, shop_subscription) {
    let query = `SELECT * from wp_posts where post_status = '${status}' AND post_type = '${shop_subscription}'`
    let result = db.Query(query);
    return result;

}

async function getSubscriptionMetaInfo(db, subscriptionId, meta_key) {
    let query = `SELECT meta_value from wp_postmeta where post_id = ${subscriptionId} AND meta_key = '${meta_key}'`
    let result = db.Query(query);
    return result;

}

async function updateSubscriptionStatus(db, subscriptionId, post_status) {
    let query = `UPDATE wp_posts set post_status = '${post_status}' WHERE ID = ${subscriptionId}`
    let result = db.Query(query);
    return result;

}

async function updateSubscriptionEndDate(db, subscriptionId, meta_key, meta_value) {
    let query = `UPDATE wp_postmeta set meta_value = '${meta_value}' WHERE post_id = ${subscriptionId} AND meta_key = '${meta_key}'`
    let result = db.Query(query);
    return result;

}

module.exports = {
    getSubscriptionPending,
    getSubscriptionMetaInfo,
    updateSubscriptionStatus,
    updateSubscriptionEndDate,
    DbConnection
};