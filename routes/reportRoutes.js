const express = require('express');
const router = express.Router();

const oracledb = require('oracledb');

const { getOracleConnection } = require('../config/oracle');


// 1. Blood collection report
router.get('/blood-collection', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();


        const result = await connection.execute(
            `
            BEGIN
                get_blood_collection_report(:result);
            END;
            `,
            {
                result: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.CURSOR
                }
            }
        );


        const resultSet = result.outBinds.result;

        const rows = [];


        let row;

        while ((row = await resultSet.getRow())) {

            rows.push({
                camp_id: row[0],
                camp_name: row[1],
                blood_group: row[2],
                units_collected: row[3],
                total_ml: row[4]
            });

        }


        await resultSet.close();


        res.json(rows);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to generate blood collection report'
        });


    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


router.get('/current-inventory', async (req, res) => {
    let connection;
    let resultSet;

    try {
        connection = await getOracleConnection();

        const result = await connection.execute(
            `
            BEGIN
                get_current_inventory_report(:result);
            END;
            `,
            {
                result: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.CURSOR
                }
            }
        );

        resultSet = result.outBinds.result;

        const rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push({
                blood_group: row[0],
                total_units: row[1],
                available_units: row[2],
                reserved_units: row[3],
                distributed_units: row[4],
                expired_units: row[5]
            });
        }

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate current inventory report'
        });

    } finally {
        if (resultSet) {
            await resultSet.close();
        }

        if (connection) {
            await connection.close();
        }
    }
});

router.get('/expiring-units', async (req, res) => {
    let connection;
    let resultSet;

    try {
        const days = Number(req.query.days || 30);

        if (days < 0 || !Number.isInteger(days)) {
            return res.status(400).json({
                error: 'Days must be a non-negative integer'
            });
        }

        connection = await getOracleConnection();

        const result = await connection.execute(
            `
            BEGIN
                get_expiring_units_report(
                    :days,
                    :result
                );
            END;
            `,
            {
                days: days,
                result: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.CURSOR
                }
            }
        );

        resultSet = result.outBinds.result;

        const rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push({
                unit_id: row[0],
                blood_group: row[1],
                collection_date: row[2],
                expiry_date: row[3],
                status: row[4],
                storage_location: row[5]
            });
        }

        res.json({
            days: days,
            total: rows.length,
            units: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate expiring units report'
        });

    } finally {
        if (resultSet) {
            await resultSet.close();
        }

        if (connection) {
            await connection.close();
        }
    }
});

router.get('/donor-history/:donorId', async (req, res) => {
    let connection;
    let resultSet;

    try {
        const donorId = req.params.donorId;

        connection = await getOracleConnection();

        const result = await connection.execute(
            `
            BEGIN
                get_donor_history_report(
                    :donor_id,
                    :result
                );
            END;
            `,
            {
                donor_id: donorId,
                result: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.CURSOR
                }
            }
        );

        resultSet = result.outBinds.result;

        const rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push({
                donor_id: row[0],
                donor_name: row[1],
                blood_group: row[2],
                donor_status: row[3],
                eligibility: row[4],
                donation_id: row[5],
                donation_date: row[6],
                quantity_ml: row[7],
                camp_name: row[8],
                venue_name: row[9],
                remarks: row[10]
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Donor not found or no donation history available'
            });
        }

        res.json({
            donor: {
                donor_id: rows[0].donor_id,
                donor_name: rows[0].donor_name,
                blood_group: rows[0].blood_group,
                donor_status: rows[0].donor_status,
                eligibility: rows[0].eligibility
            },
            donations: rows.map(row => ({
                donation_id: row.donation_id,
                donation_date: row.donation_date,
                quantity_ml: row.quantity_ml,
                camp_name: row.camp_name,
                venue_name: row.venue_name,
                remarks: row.remarks
            }))
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate donor history report'
        });

    } finally {
        if (resultSet) {
            await resultSet.close();
        }

        if (connection) {
            await connection.close();
        }
    }
});

router.get('/hospital-requests', async (req, res) => {
    let connection;
    let resultSet;

    try {
        connection = await getOracleConnection();

        const result = await connection.execute(
            `
            BEGIN
                get_hospital_requests_report(:result);
            END;
            `,
            {
                result: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.CURSOR
                }
            }
        );

        resultSet = result.outBinds.result;

        const rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push({
                request_id: row[0],
                hospital_name: row[1],
                blood_group: row[2],
                request_date: row[3],
                quantity_required: row[4],
                units_distributed: row[5],
                urgency: row[6],
                status: row[7],
                required_date: row[8],
                remarks: row[9]
            });
        }

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate hospital requests report'
        });

    } finally {
        if (resultSet) {
            await resultSet.close();
        }

        if (connection) {
            await connection.close();
        }
    }
});



module.exports = router;