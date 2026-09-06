const oracledb = require('oracledb');

const oracleConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING
};

async function getOracleConnection() {
    return await oracledb.getConnection(oracleConfig);
}

module.exports = {
    getOracleConnection
};