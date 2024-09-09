const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./dbConnection');
const dotenv = require('dotenv');
const validator = require('validator'); 

dotenv.config();

const router = express.Router();

// Check username is unique
router.get('/check-username', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ message: 'Please provide a username' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE name = ?', [name]);
        if (rows.length > 0) {
            return res.status(200).json({ exists: true }); // Username is not available
        } else {
            return res.status(200).json({ exists: false }); // Username is unique
        }
    } catch (err) {
        console.error('Error checking username:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validation of input formats
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const [nameRows] = await db.query('SELECT * FROM users WHERE name = ?', [name]);
        if (nameRows.length > 0) {
            return res.status(400).json({ message: 'Name already exists. Please choose a different name.' });
        }

        const [emailRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Server error during registration:', err);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    // Validate input formats
    if (!name || !password) {
        return res.status(400).json({ message: 'Please enter both username and password' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE name = ?', [name]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, userId: user.id });
    } catch (err) {
        console.error('Server error during login:', err);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
