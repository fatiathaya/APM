const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'neurocare_ai',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
});

async function testConnection() {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
}

module.exports = { pool, testConnection };
