const express = require('express');
const router = express.Router();

const { getOracleConnection } = require('../config/oracle');


// Get all hospital requests

router.get('/', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                br.request_id,
                h.hospital_name,
                bg.blood_group,
                br.request_date,
                br.quantity_required,
                br.urgency,
                br.status,
                br.required_date,
                br.remarks
            FROM blood_request br

            JOIN hospital h
                ON br.hospital_id = h.hospital_id

            JOIN blood_group bg
                ON br.blood_group_id = bg.blood_group_id

            ORDER BY
                CASE br.urgency
                    WHEN 'Critical' THEN 1
                    WHEN 'Urgent' THEN 2
                    ELSE 3
                END,
                br.request_date DESC
        `);


        const requests = result.rows.map(row => ({

            request_id: row[0],
            hospital_name: row[1],
            blood_group: row[2],
            request_date: row[3],
            quantity_required: row[4],
            urgency: row[5],
            status: row[6],
            required_date: row[7],
            remarks: row[8]

        }));


        res.json(requests);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load hospital requests'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get one request

router.get('/:id', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                br.request_id,
                h.hospital_id,
                h.hospital_name,
                h.address,
                h.city,
                h.contact_person,
                h.phone,
                bg.blood_group,
                br.request_date,
                br.quantity_required,
                br.urgency,
                br.status,
                br.required_date,
                br.remarks

            FROM blood_request br

            JOIN hospital h
                ON br.hospital_id = h.hospital_id

            JOIN blood_group bg
                ON br.blood_group_id = bg.blood_group_id

            WHERE br.request_id = :request_id
        `, {
            request_id: req.params.id
        });


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: 'Hospital request not found'
            });

        }


        const row = result.rows[0];


        res.json({

            request_id: row[0],

            hospital_id: row[1],
            hospital_name: row[2],
            address: row[3],
            city: row[4],
            contact_person: row[5],
            phone: row[6],

            blood_group: row[7],

            request_date: row[8],

            quantity_required: row[9],

            urgency: row[10],

            status: row[11],

            required_date: row[12],

            remarks: row[13]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load request details'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// Get distributions for a request

router.get('/:id/distributions', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(`
            SELECT
                bd.distribution_id,
                bd.unit_id,
                bg.blood_group,
                bd.distribution_date,
                bd.quantity,
                bd.remarks

            FROM blood_distribution bd

            JOIN blood_unit bu
                ON bd.unit_id = bu.unit_id

            JOIN blood_group bg
                ON bu.blood_group_id = bg.blood_group_id

            WHERE bd.request_id = :request_id

            ORDER BY bd.distribution_date DESC
        `, {
            request_id: req.params.id
        });


        const distributions = result.rows.map(row => ({

            distribution_id: row[0],
            unit_id: row[1],
            blood_group: row[2],
            distribution_date: row[3],
            quantity: row[4],
            remarks: row[5]

        }));


        res.json(distributions);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to load distributions'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;