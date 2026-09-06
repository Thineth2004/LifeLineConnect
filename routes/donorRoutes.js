const express = require('express');

const router = express.Router();

const {
    getOracleConnection
} = require('../config/oracle');


// Get all donors
router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                d.donor_id,
                d.first_name,
                d.last_name,
                d.date_of_birth,
                d.gender,
                d.nic,
                d.phone,
                d.email,
                bg.blood_group,
                d.registration_date,
                d.status
            FROM donor d
            JOIN blood_group bg
                ON d.blood_group_id = bg.blood_group_id
            ORDER BY d.donor_id
        `);

        const donors = result.rows.map(row => ({
            donor_id: row[0],
            first_name: row[1],
            last_name: row[2],
            date_of_birth: row[3],
            gender: row[4],
            nic: row[5],
            phone: row[6],
            email: row[7],
            blood_group: row[8],
            registration_date: row[9],
            status: row[10]
        }));

        res.json(donors);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve donors'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get a single donor
router.get('/:id', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                d.donor_id,
                d.first_name,
                d.last_name,
                d.date_of_birth,
                d.gender,
                d.nic,
                d.phone,
                d.email,
                d.address,
                bg.blood_group,
                d.registration_date,
                d.status
            FROM donor d
            JOIN blood_group bg
                ON d.blood_group_id = bg.blood_group_id
            WHERE d.donor_id = :donor_id
        `, {
            donor_id: req.params.id
        });

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: 'Donor not found'
            });

        }

        const row = result.rows[0];

        res.json({
            donor_id: row[0],
            first_name: row[1],
            last_name: row[2],
            date_of_birth: row[3],
            gender: row[4],
            nic: row[5],
            phone: row[6],
            email: row[7],
            address: row[8],
            blood_group: row[9],
            registration_date: row[10],
            status: row[11]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve donor'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get donor health records
router.get('/:id/health', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                health_id,
                weight,
                blood_pressure,
                hemoglobin,
                medical_conditions,
                last_check_date,
                eligible,
                remarks
            FROM donor_health
            WHERE donor_id = :donor_id
            ORDER BY last_check_date DESC
        `, {
            donor_id: req.params.id
        });

        const records = result.rows.map(row => ({
            health_id: row[0],
            weight: row[1],
            blood_pressure: row[2],
            hemoglobin: row[3],
            medical_conditions: row[4],
            last_check_date: row[5],
            eligible: row[6],
            remarks: row[7]
        }));

        res.json(records);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve health records'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get donation history
router.get('/:id/donations', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                d.donation_id,
                d.donation_date,
                d.quantity_ml,
                c.camp_name,
                v.venue_name
            FROM donation d
            JOIN camp c
                ON d.camp_id = c.camp_id
            JOIN venue v
                ON c.venue_id = v.venue_id
            WHERE d.donor_id = :donor_id
            ORDER BY d.donation_date DESC
        `, {
            donor_id: req.params.id
        });

        const donations = result.rows.map(row => ({
            donation_id: row[0],
            donation_date: row[1],
            quantity_ml: row[2],
            camp_name: row[3],
            venue_name: row[4]
        }));

        res.json(donations);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve donation history'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;