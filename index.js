const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// ✅ ROUTES
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    await connection.end();

    if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
      res.json({
        status: 'success',
        user: {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
        }
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Email atau kata laluan salah' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Ralat pelayan' });
  }
});

// ✅ START SERVER PROPERLY
async function startServer() {
  try {
    // Just test DB connection once
    const connection = await mysql.createConnection(dbConfig);
    await connection.end();
    console.log('✅ Connected to MySQL');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
  }
}

startServer();
