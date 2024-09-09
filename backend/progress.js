const express = require('express');
const db = require('./dbConnection');

const router = express.Router();

// Get user progress (levels)
router.get('/get-user-progress', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Please provide a username' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM user_progress WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No progress found for this user' });
        }

        return res.json(rows[0]); // current level included
    } catch (err) {
        console.error('Error retrieving progress:', err);
        return res.status(500).json({ message: 'Server error during progress retrieval' });
    }
});

// Update user levels
router.post('/update-user-progress', async (req, res) => {
    const { username, level } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Please provide a username' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM user_progress WHERE username = ?', [username]); 

        if (rows.length > 0) {
            await db.query(
                'UPDATE user_progress SET level = ? WHERE username = ?', 
                [level, username]
            );
        } else {
            await db.query(
                'INSERT INTO user_progress (username, level) VALUES (?, ?)', 
                [username, level]
            );
        }

        return res.status(200).json({ message: 'Progress updated successfully' });
    } catch (err) {
        console.error('Error updating progress:', err);
        return res.status(500).json({ message: 'Server error during progress update' });
    }
});

// Get leaderboard (3 users with the highest levels)
router.get('/get-leaderboard', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT username, level FROM user_progress ORDER BY level DESC LIMIT 3'); 
        return res.json(rows);
    } catch (err) {
        console.error('Error retrieving leaderboard:', err);
        return res.status(500).json({ message: 'Server error during leaderboard retrieval' });
    }
});

module.exports = router;
