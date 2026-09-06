require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { getOracleConnection } = require('./config/oracle');
const { connectMongoDB } = require('./config/mongodb');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/test', async (req, res) => {

    let connection;

    try {

        connection = await getOracleConnection();

        const result = await connection.execute(
            `SELECT 'Oracle connection successful' AS message FROM dual`
        );

        res.json({
            oracle: result.rows[0][0]
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


async function startServer() {

    try {

        await connectMongoDB();

        app.listen(process.env.PORT, () => {

            console.log(
                `LifeLine Connect running on http://localhost:${process.env.PORT}`
            );

        });

    } catch (error) {

        console.error(
            'Failed to start application:',
            error
        );

    }

}

startServer();