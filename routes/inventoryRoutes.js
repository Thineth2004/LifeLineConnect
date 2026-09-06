const express = require('express');
const router = express.Router();

const { getOracleConnection } = require('../config/oracle');


// Get inventory summary by blood group
router.get('/summary', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                bg.blood_group,
                COUNT(bu.unit_id) AS total_units,
                SUM(
                    CASE
                        WHEN bu.status = 'Available'
                        AND bu.expiry_date >= TRUNC(SYSDATE)
                        THEN 1
                        ELSE 0
                    END
                ) AS available_units,
                SUM(
                    CASE
                        WHEN bu.status = 'Reserved'
                        THEN 1
                        ELSE 0
                    END
                ) AS reserved_units,
                SUM(
                    CASE
                        WHEN bu.status = 'Distributed'
                        THEN 1
                        ELSE 0
                    END
                ) AS distributed_units,
                SUM(
                    CASE
                        WHEN bu.status = 'Expired'
                        OR bu.expiry_date < TRUNC(SYSDATE)
                        THEN 1
                        ELSE 0
                    END
                ) AS expired_units
            FROM blood_group bg
            LEFT JOIN blood_unit bu
                ON bg.blood_group_id = bu.blood_group_id
            GROUP BY bg.blood_group_id, bg.blood_group
            ORDER BY bg.blood_group_id
        `);

        const inventory = result.rows.map(row => ({
            blood_group: row[0],
            total_units: row[1] || 0,
            available_units: row[2] || 0,
            reserved_units: row[3] || 0,
            distributed_units: row[4] || 0,
            expired_units: row[5] || 0
        }));

        res.json(inventory);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load inventory summary'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get all blood units
router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                bu.unit_id,
                bu.donation_id,
                bg.blood_group,
                bu.collection_date,
                bu.expiry_date,
                bu.status,
                bu.storage_location
            FROM blood_unit bu
            JOIN blood_group bg
                ON bu.blood_group_id = bg.blood_group_id
            ORDER BY bu.expiry_date
        `);

        const units = result.rows.map(row => ({
            unit_id: row[0],
            donation_id: row[1],
            blood_group: row[2],
            collection_date: row[3],
            expiry_date: row[4],
            status: row[5],
            storage_location: row[6]
        }));

        res.json(units);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load blood inventory'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Update expired units using PL/SQL procedure
router.post('/update-expired', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        await connection.execute(`
            BEGIN
                update_expired_units;
            END;
        `);

        res.json({
            message: 'Expired blood units updated successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to update expired units'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;