import React, { useState, useEffect, useContext } from 'react';
import { AuthenticationContext } from '../Authentication';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Stats.css';
import { useNavigate, useLocation } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

//Show the logged sessions
function Stats() {
    const { loggedInUser } = useContext(AuthenticationContext);
    const [exerciseData, setExerciseData] = useState({
        squat: [],
        deadlift: [],
        barbellRow: [],
        modifiedbench: [],
        modifiedoverheadpress: []
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [viewMode, setViewMode] = useState({
        squat: 'table',
        deadlift: 'table',
        barbellRow: 'table',
        modifiedbench: 'table',
        modifiedoverheadpress: 'table'
    });
    const [showCount, setShowCount] = useState({
        squat: 10,
        deadlift: 10,
        barbellRow: 10,
        modifiedbench: 10,
        modifiedoverheadpress: 10
    });
    const [totalSessions, setTotalSessions] = useState({
        squat: 0,
        deadlift: 0,
        barbellRow: 0,
        modifiedbench: 0,
        modifiedoverheadpress: 0
    });
    const [userLevel, setUserLevel] = useState(1); // Track user level
    const [leaderboard, setLeaderboard] = useState([]); // Track leaderboard

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loggedInUser) {
            fetchSessions('squat');
            fetchSessions('deadlift');
            fetchSessions('barbellRow');
            fetchSessions('modifiedbench');
            fetchSessions('modifiedoverheadpress');
            fetchUserLevel(); 
            fetchLeaderboard();
        }
    }, [loggedInUser]);

    const fetchSessions = (exerciseType) => {
        let url = `http://localhost:5000/api/exercises/get-all-sessions?username=${loggedInUser}&exerciseType=${exerciseType}`;
        fetch(url, { cache: 'no-store' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setExerciseData((prevData) => ({ ...prevData, [exerciseType]: data }));
                setTotalSessions((prevTotal) => ({ ...prevTotal, [exerciseType]: data.length }));
                setErrorMessage('');
            })
            .catch((error) => {
                console.error('Error fetching sessions:', error);
                setErrorMessage(`Failed to load exercise sessions. ${error.message}`);
            });
    };

    const fetchUserLevel = () => {
        let url = `http://localhost:5000/api/progress/get-user-progress?username=${loggedInUser}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setUserLevel(data.level); // Set user level
            })
            .catch((error) => {
                console.error('Error fetching user level:', error);
            });
    };

    // Show the leaderboard with the top three level users
    const fetchLeaderboard = () => {
        fetch('http://localhost:5000/api/progress/get-leaderboard')
            .then((response) => response.json())
            .then((data) => {
                console.log('Leaderboard Data:', data); 
                setLeaderboard(data); 
            })
            .catch((error) => {
                console.error('Error fetching leaderboard:', error);
            });
    };
    

    const toggleViewMode = (exerciseType) => {
        setViewMode((prevViewMode) => ({
            ...prevViewMode,
            [exerciseType]: prevViewMode[exerciseType] === 'table' ? 'graph' : 'table'
        }));
    };

    // Display logs visually
    const getGraphData = (data, showCount) => {
        const filteredData = data.slice(0, showCount).sort((a, b) => new Date(a.date) - new Date(b.date)); 
        return {
            labels: filteredData.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                label: 'Weights lifted over time',
                data: filteredData.map(entry => entry.weight),
                fill: false,
                backgroundColor: 'rgba(46, 0, 77, 0.8)',
                borderColor: 'rgba(46, 0, 77, 0.8)',
            }]
        };
    };

    const setShowCountForExercise = (exerciseType, count) => {
        setShowCount((prevShowCount) => ({ ...prevShowCount, [exerciseType]: count }));
    };

    // Function to delete sessions
    const deleteSession = (id, exerciseType) => {
        fetch(`http://localhost:5000/api/exercises/delete-session/${id}`, { method: 'DELETE' })
            .then((response) => {
                if (response.ok) {
                    
                    setExerciseData((prevData) => ({
                        ...prevData,
                        [exerciseType]: prevData[exerciseType].filter((session) => session.id !== id)
                    }));
                } else {
                    setErrorMessage('Failed to delete session');
                }
            })
            .catch((error) => {
                console.error('Error deleting session:', error);
            });
    };

    const exercises = [
        { type: 'squat', label: 'Squat', icon: 'squat-icon.png' },
        { type: 'deadlift', label: 'Deadlift', icon: 'deadlift-icon.png' },
        { type: 'barbellRow', label: 'Barbell Row', icon: 'barbell-icon.png' },
        { type: 'modifiedbench', label: 'Modified Bench', icon: 'benchpress-icon.png' },
        { type: 'modifiedoverheadpress', label: 'Modified Overhead Press', icon: 'overhead-icon.png' }
    ];

    return (
        <div className="stats-container">
            <div className="exercise-icon-grid">
                {exercises.map(({ type, label, icon }) => (
                    <div key={type} className="exercise-icon-container">
                        <div
                            className={`exercise-icon-square ${location.pathname.includes(type) ? 'active' : ''}`}
                            onClick={() => navigate(`/${type}`)}
                        >
                            <img src={`${process.env.PUBLIC_URL}/${icon}`} alt={`${label} Icon`} />
                            <span className="exercise-icon-label">{label}</span>
                        </div>
                    </div>
                ))}
                <div className="exercise-icon-container">
                    <div
                        className={`exercise-icon-square ${location.pathname === '/Stats' ? 'active' : ''}`}
                        onClick={() => navigate('/Stats')}
                    >
                        <img src={`${process.env.PUBLIC_URL}/stats-icon.png`} alt="Stats Icon" />
                        <span className="exercise-icon-label">Stats</span>
                    </div>
                </div>
            </div>

            <h2 className="exercise-title">Exercise Stats</h2>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <div className="exercise-stats-grid">
                {exercises.map(({ type, label }) => (
                    <div key={type} className="exercise-section">
                        <h3>{label} Sessions</h3>

                        <button
                            className="toggle-view-button"
                            onClick={() => toggleViewMode(type)}
                        >
                            {viewMode[type] === 'table' ? 'Show Graph' : 'Show Table'}
                        </button>

                        <div className="filter-options">
                            <button className="exercise-save-button" onClick={() => setShowCountForExercise(type, 10)}>Past 10 Sessions</button>
                            <button className="exercise-save-button" onClick={() => setShowCountForExercise(type, 30)}>Past 30 Sessions</button>
                            <button className="exercise-save-button" onClick={() => setShowCountForExercise(type, 60)}>Past 60 Sessions</button>
                            <button className="exercise-save-button" onClick={() => setShowCountForExercise(type, totalSessions[type])}>Show All</button>
                        </div>

                        {viewMode[type] === 'table' ? (
                            <table className="exercise-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Sets</th>
                                        <th>Reps</th>
                                        <th>Weight</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exerciseData[type].slice(0, showCount[type]).map((data) => (
                                        <tr key={data.id}>
                                            <td>{new Date(data.date).toLocaleDateString()}</td>
                                            <td>{data.sets}</td>
                                            <td>{data.reps}</td>
                                            <td>{data.weight}</td>
                                            <td>
                                                <button className="exercise-delete-button" onClick={() => deleteSession(data.id, type)}>&minus;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="exercise-graph">
                                <Line data={getGraphData(exerciseData[type], showCount[type])} />
                            </div>
                        )}
                    </div>
                ))}

                {/* Leaderboard and current level are showl */}
                <div className="exercise-section">
    <h3>Leaderboard</h3> {/* Title of leaderboard */}
    <h4 className="current-level">Current Level: {userLevel}</h4>

    
    <table className="leaderboard-table">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Level</th> {/* The users current level is also shown in the leaderboard */}
            </tr>
        </thead>
        <tbody>
            {leaderboard.slice(0, 5).map((user, index) => (
                <tr key={user.username}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.level}</td> {}
                </tr>
            ))}
        </tbody>
    </table>
</div>

            </div>
        </div>
    );
}

export default Stats;
