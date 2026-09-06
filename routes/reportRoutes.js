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

// 2. Current inventory report
router.get('/inventory', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        await connection.execute(`
            BEGIN
                rpt_current_inventory;
            END;
        `);

        res.json({
            message: 'Inventory report executed successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// 3. Expiring units report
router.get('/expiring', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const days = Number(req.query.days || 30);

        await connection.execute(
            `
            BEGIN
                rpt_expiring_units(:days);
            END;
            `,
            {
                days: days
            }
        );

        res.json({
            message: 'Expiring units report executed successfully',
            days: days
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// 4. Donor history report
router.get('/donor-history/:donorId', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        await connection.execute(
            `
            BEGIN
                rpt_donor_history(:donor_id);
            END;
            `,
            {
                donor_id: req.params.donorId
            }
        );

        res.json({
            message: 'Donor history report executed successfully',
            donor_id: req.params.donorId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// 5. Hospital requests report
router.get('/hospital-requests', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        await connection.execute(`
            BEGIN
                rpt_hospital_requests;
            END;
        `);

        res.json({
            message: 'Hospital requests report executed successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
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



module.exports = router;