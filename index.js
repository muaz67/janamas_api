const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const connection = await mysql.createConnection(dbConfig);
console.log("DB Connected");

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1',
      [email, password]
    );

    await connection.end();

    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        status: 'success',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Email atau kata laluan salah' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Ralat pelayan' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if email exists
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ status: 'error', message: 'Emel sudah digunakan' });
    }

    // Insert new user
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'participant']  // default role = participant
    );

    await connection.end();

    res.json({ status: 'success', message: 'Pendaftaran berjaya' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Ralat pelayan' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
