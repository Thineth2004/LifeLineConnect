const express = require('express');
const router = express.Router();

const { getOracleConnection } = require('../config/oracle');


// Get all camps
router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                c.camp_id,
                c.camp_name,
                c.camp_date,
                c.start_time,
                c.end_time,
                c.organizer,
                c.status,
                v.venue_id,
                v.venue_name,
                v.city
            FROM camp c
            JOIN venue v
                ON c.venue_id = v.venue_id
            ORDER BY c.camp_date
        `);

        const camps = result.rows.map(row => ({
            camp_id: row[0],
            camp_name: row[1],
            camp_date: row[2],
            start_time: row[3],
            end_time: row[4],
            organizer: row[5],
            status: row[6],
            venue_id: row[7],
            venue_name: row[8],
            city: row[9]
        }));

        res.json(camps);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load camps'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get one camp
router.get('/:id', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                c.camp_id,
                c.camp_name,
                c.camp_date,
                c.start_time,
                c.end_time,
                c.organizer,
                c.status,
                v.venue_id,
                v.venue_name,
                v.address,
                v.city,
                v.capacity,
                v.contact_number
            FROM camp c
            JOIN venue v
                ON c.venue_id = v.venue_id
            WHERE c.camp_id = :camp_id
        `, {
            camp_id: req.params.id
        });

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: 'Camp not found'
            });

        }

        const row = result.rows[0];

        res.json({
            camp_id: row[0],
            camp_name: row[1],
            camp_date: row[2],
            start_time: row[3],
            end_time: row[4],
            organizer: row[5],
            status: row[6],
            venue_id: row[7],
            venue_name: row[8],
            address: row[9],
            city: row[10],
            capacity: row[11],
            contact_number: row[12]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load camp details'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get donations collected at a camp
router.get('/:id/donations', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                d.donation_id,
                d.donor_id,
                dr.first_name || ' ' || dr.last_name AS donor_name,
                bg.blood_group,
                d.donation_date,
                d.quantity_ml
            FROM donation d
            JOIN donor dr
                ON d.donor_id = dr.donor_id
            JOIN blood_group bg
                ON dr.blood_group_id = bg.blood_group_id
            WHERE d.camp_id = :camp_id
            ORDER BY d.donation_date DESC
        `, {
            camp_id: req.params.id
        });

        const donations = result.rows.map(row => ({
            donation_id: row[0],
            donor_id: row[1],
            donor_name: row[2],
            blood_group: row[3],
            donation_date: row[4],
            quantity_ml: row[5]
        }));

        res.json(donations);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load camp donations'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get staff and volunteers assigned to a camp
router.get('/:id/assignments', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                ca.assignment_id,
                ca.assignment_role,

                s.staff_id,
                s.first_name || ' ' || s.last_name AS staff_name,

                v.volunteer_id,
                v.first_name || ' ' || v.last_name AS volunteer_name

            FROM camp_assignment ca

            LEFT JOIN staff s
                ON ca.staff_id = s.staff_id

            LEFT JOIN volunteer v
                ON ca.volunteer_id = v.volunteer_id

            WHERE ca.camp_id = :camp_id

            ORDER BY ca.assignment_id
        `, {
            camp_id: req.params.id
        });

        const assignments = result.rows.map(row => ({
            assignment_id: row[0],
            assignment_role: row[1],
            staff_id: row[2],
            staff_name: row[3],
            volunteer_id: row[4],
            volunteer_name: row[5]
        }));

        res.json(assignments);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load camp assignments'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;