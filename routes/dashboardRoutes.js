const express = require('express');
const router = express.Router();

const { getOracleConnection } = require('../config/oracle');


// Dashboard summary
router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();


        // Active donors
        const donors = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM donor
            WHERE status = 'Active'
        `);


        // Available blood units
        const bloodUnits = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM blood_unit
            WHERE status = 'Available'
            AND expiry_date >= TRUNC(SYSDATE)
        `);


        // Upcoming camps
        const camps = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM camp
            WHERE camp_date >= TRUNC(SYSDATE)
            AND status = 'Scheduled'
        `);


        // Pending requests
        const requests = await connection.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM blood_request
            WHERE status = 'Pending'
        `);


        // Blood group inventory
        const inventory = await connection.execute(`
            SELECT
                bg.blood_group,
                COUNT(bu.unit_id) AS total_units
            FROM blood_group bg
            LEFT JOIN blood_unit bu
                ON bg.blood_group_id = bu.blood_group_id
                AND bu.status = 'Available'
                AND bu.expiry_date >= TRUNC(SYSDATE)
            GROUP BY bg.blood_group
            ORDER BY bg.blood_group
        `);


        // Upcoming camps
        const upcomingCamps = await connection.execute(`
            SELECT
                c.camp_id,
                c.camp_name,
                c.camp_date,
                c.start_time,
                c.end_time,
                v.venue_name,
                v.city
            FROM camp c
            JOIN venue v
                ON c.venue_id = v.venue_id
            WHERE c.camp_date >= TRUNC(SYSDATE)
            AND c.status = 'Scheduled'
            ORDER BY c.camp_date
            FETCH FIRST 5 ROWS ONLY
        `);


        // Recent hospital requests
        const recentRequests = await connection.execute(`
            SELECT
                br.request_id,
                h.hospital_name,
                bg.blood_group,
                br.quantity_required,
                br.urgency,
                br.status,
                br.request_date
            FROM blood_request br
            JOIN hospital h
                ON br.hospital_id = h.hospital_id
            JOIN blood_group bg
                ON br.blood_group_id = bg.blood_group_id
            ORDER BY br.request_date DESC
            FETCH FIRST 5 ROWS ONLY
        `);


        res.json({

            totalDonors: donors.rows[0][0],

            availableUnits: bloodUnits.rows[0][0],

            upcomingCamps: camps.rows[0][0],

            pendingRequests: requests.rows[0][0],

            inventory: inventory.rows.map(row => ({
                blood_group: row[0],
                total_units: row[1]
            })),

            upcomingCampsList: upcomingCamps.rows.map(row => ({
                camp_id: row[0],
                camp_name: row[1],
                camp_date: row[2],
                start_time: row[3],
                end_time: row[4],
                venue_name: row[5],
                city: row[6]
            })),

            recentRequests: recentRequests.rows.map(row => ({
                request_id: row[0],
                hospital_name: row[1],
                blood_group: row[2],
                quantity_required: row[3],
                urgency: row[4],
                status: row[5],
                request_date: row[6]
            }))

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