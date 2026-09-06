const express = require('express');

const router = express.Router();

const {
    getOracleConnection
} = require('../config/oracle');


router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();


        const donors = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM donor
            WHERE status = 'Active'
        `);


        const bloodUnits = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM blood_unit
            WHERE status = 'Available'
            AND expiry_date >= TRUNC(SYSDATE)
        `);


        const camps = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM camp
            WHERE camp_date >= TRUNC(SYSDATE)
            AND status = 'Scheduled'
        `);


        const requests = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM blood_request
            WHERE status = 'Pending'
        `);


        res.json({
            totalDonors: donors.rows[0][0],
            availableUnits: bloodUnits.rows[0][0],
            upcomingCamps: camps.rows[0][0],
            pendingRequests: requests.rows[0][0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load dashboard data'
        });


    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;