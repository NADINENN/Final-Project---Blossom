const express = require('express');
const db = require('./dbConnection');

const router = express.Router();

// Save exercise session and check if they should level up
router.post('/save-session', async (req, res) => {
    const { username, exerciseType, sets, reps, weight } = req.body;

    if (!username || !exerciseType || !sets || !reps || !weight) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        // Last sessions for the same exercise type
        const [lastSession] = await db.query(
            'SELECT * FROM trainingData WHERE username = ? AND exerciseType = ? ORDER BY date DESC LIMIT 1',
            [username, exerciseType]
        );

        // Save the current session
        await db.query(
            'INSERT INTO trainingData (username, exerciseType, sets, reps, weight) VALUES (?, ?, ?, ?, ?)',
            [username, exerciseType, sets, reps, weight]
        );

        // Check if users should level up
        let levelUp = false;

        // 1. Level up if weight increase reaches 5, 10, 15, 20, 25 from the starting weight
        if (lastSession && (weight - lastSession[0].weight) >= 5 && (weight - lastSession[0].weight) % 5 === 0) {
            console.log('Weight increase:', weight - lastSession[0].weight);
            levelUp = true;
        }

        // 2. Level up if user exercises 3 times within the same week (7-day period)
        const [sessionsInWeek] = await db.query(
            'SELECT * FROM trainingData WHERE username = ? AND exerciseType = ? AND date >= NOW() - INTERVAL 7 DAY',
            [username, exerciseType]
        );
        if (sessionsInWeek.length >= 3) {
            console.log('Sessions in the last week:', sessionsInWeek.length);
            levelUp = true;
        }

        // 3. Level up if the user increase their weight in two sessions after another
        if (lastSession && weight > lastSession[0].weight) {
            const [secondLastSession] = await db.query(
                'SELECT * FROM trainingData WHERE username = ? AND exerciseType = ? ORDER BY date DESC LIMIT 1, 1',
                [username, exerciseType]
            );
            if (secondLastSession.length > 0 && lastSession[0].weight > secondLastSession[0].weight) {
                console.log('Weight increase in two consecutive sessions');
                levelUp = true;
            }
        }

        if (levelUp) {
            // update the levels
            await db.query('UPDATE user_progress SET level = level + 1 WHERE username = ?', [username]);
            const [rows] = await db.query('SELECT * FROM user_progress WHERE username = ?', [username]);
            return res.status(201).json({ message: 'Session saved and level up!', levelUp: true, newLevel: rows[0].level });
        } else {
            return res.status(201).json({ message: 'Session saved', levelUp: false });
        }
    } catch (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Server error during session saving' });
    }
});

// Get the recent 5 exercise sessions
router.get('/get-recent-sessions', async (req, res) => {
    const { username, exerciseType } = req.query;

    if (!username || !exerciseType) {
        return res.status(400).json({ message: 'Please provide username and exercise type' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM trainingData WHERE username = ? AND exerciseType = ? ORDER BY date DESC LIMIT 5',
            [username, exerciseType]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Error retrieving sessions:', err);
        return res.status(500).json({ message: 'Server error during session retrieval' });
    }
});

// All exercise sessions for a user
router.get('/get-all-sessions', async (req, res) => {
    const { username, exerciseType } = req.query;

    if (!username || !exerciseType) {
        return res.status(400).json({ message: 'Please provide username and exercise type' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM trainingData WHERE username = ? AND exerciseType = ? ORDER BY date DESC',
            [username, exerciseType]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Error retrieving sessions:', err);
        return res.status(500).json({ message: 'Server error during session retrieval' });
    }
});

// Delete a session from database
router.delete('/delete-session/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM trainingData WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Session deleted successfully' });
    } catch (err) {
        console.error('Error deleting session:', err);
        return res.status(500).json({ message: 'Server error during session deletion' });
    }
});

module.exports = router;
