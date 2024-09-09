import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { AuthenticationContext } from '../Authentication'; 
import './ModifiedBench.css'; 

function ModifiedBench() {
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [savedData, setSavedData] = useState([]);
    const [suggestionMessage, setSuggestionMessage] = useState('');
    const { loggedInUser } = useContext(AuthenticationContext); 
    const [userLevel, setUserLevel] = useState(1); 
    const [levelUpMessage, setLevelUpMessage] = useState(''); 
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        if (loggedInUser) {
            fetch(`http://localhost:5000/api/exercises/get-recent-sessions?username=${loggedInUser}&exerciseType=modifiedbench`)
                .then((response) => response.json())
                .then((data) => {
                    setSavedData(data);
                    checkForSuggestions(data);
                })
                .catch((error) => console.error('Error fetching sessions:', error));

            fetch(`http://localhost:5000/api/progress/get-user-progress?username=${loggedInUser}`)
                .then((response) => response.json())
                .then((data) => {
                    setUserLevel(data.level);
                })
                .catch((error) => console.error('Error fetching user level:', error));
        }
    }, [loggedInUser]);

    const handleSave = () => {
        if (sets === '' || reps === '' || weight === '') {
            setErrorMessage('Please fill out all fields before saving.');
            return;
        }

        if (parseInt(weight) < 0 || parseInt(sets) <= 0 || parseInt(reps) <= 0) {
            setErrorMessage('Weight can be zero, but sets and reps must be greater than zero.');
            return;
        }

        const currentDate = new Date().toISOString(); 
        const newEntry = {
            username: loggedInUser,
            exerciseType: 'modifiedbench',
            sets: parseInt(sets),  
            reps: parseInt(reps),
            weight: parseInt(weight),
            date: currentDate, 
        };

        fetch('http://localhost:5000/api/exercises/save-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEntry),
        })
            .then((response) => response.json())
            .then((data) => {
                const updatedData = [{ ...newEntry, date: currentDate }, ...savedData.slice(0, 4)];
                setSavedData(updatedData);
                checkForSuggestions(updatedData); 
                setErrorMessage('');
                setSets('');
                setReps('');
                setWeight('');

                if (data.levelUp) {
                    setUserLevel(data.newLevel);
                    setLevelUpMessage(
                        `Congratulations! You've reached Level ${data.newLevel} by consistently improving your sets and weights! Keep it up!`
                    );
                } else {
                    setLevelUpMessage('');
                }

            })
            .catch((error) => {
                console.error('Error saving session:', error);
                setErrorMessage('An error occurred while saving the session.');
            });
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5000/api/exercises/delete-session/${id}`, {
            method: 'DELETE',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Session deleted successfully') {
                    fetch(`http://localhost:5000/api/exercises/get-recent-sessions?username=${loggedInUser}&exerciseType=modifiedbench`)
                        .then((response) => response.json())
                        .then((data) => {
                            setSavedData(data);
                            checkForSuggestions(data); 
                        })
                        .catch((error) => console.error('Error fetching sessions:', error));
                } else {
                    setErrorMessage(data.message);
                }
            })
            .catch((error) => {
                console.error('Error deleting session:', error);
                setErrorMessage('An error occurred while deleting the session.');
            });
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const checkForSuggestions = (data) => {
        if (parseInt(weight) === 0) {
            setSuggestionMessage(''); 
            return;
        }

        if (parseInt(sets) > 5) {
            setSuggestionMessage(randomMessage([
                "Consider increasing the weight since you are doing more than 5 sets.",
                "You seem strong enough to try a higher weight because you are doing more than 5 sets.",
                "It's impressive you can handle over 5 sets! Try increasing the weight for more gains.",
                "Your endurance is great! Consider increasing the weight since you are managing more than 5 sets.",
                "Doing more than 5 sets? You might be ready for a heavier weight!"
            ]));
        } else if (parseInt(sets) === 1) {
            setSuggestionMessage(randomMessage([
                "Great job working out today. Consider trying a lower weight next time and instead increasing your number of sets.",
                "Every workout counts. To make it easier on yourself, it might be best to drop the weight and instead focus on being able to do 3 sets.",
                "It is suggested to try to achieve 3 to 5 sets for each weight you lift. It might be more beneficial to attempt this modified bench with a lower weight next time.",
                "It is great you strive to increase your maximum weight but being patient and increasing weight slowly will yield better long term results. So it could be useful to drop the weight until you can safely do 3 sets and only then to increase the weight.",
                "Keep up the effort! For a more balanced workout, try reducing the weight and increasing the sets."
            ]));
        } else if (checkSameWeightAndSets(data)) {
            setSuggestionMessage(randomMessage([
                "You have been using the same weight for 3 sessions. Consider increasing the weight.",
                "To maximize your gains, try increasing the weight after maintaining the same weight for 3 sessions.",
                "It seems like you are ready to challenge yourself more. Consider adding some weight to your modified bench.",
                "Consistency is key! Now try to increase your weight for further improvement.",
                "Great job being consistent! It might be time to challenge yourself with more weight."
            ]));
        } else {
            setSuggestionMessage(''); 
        }
    };

    const randomMessage = (messages) => {
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const checkSameWeightAndSets = (data) => {
        const recentSessions = data.slice(0, 3); 
        if (recentSessions.length < 3) return false; 

        return recentSessions.every(session => session.weight === parseInt(weight) && session.sets >= 3);
    };

    useEffect(() => {
        console.log("Updated Suggestion Message:", suggestionMessage);
    }, [suggestionMessage]);

    const exercises = [
        { path: '/squat', icon: 'squat-icon.png', label: 'Squats' },
        { path: '/deadlifts', icon: 'deadlift-icon.png', label: 'Deadlifts' },
        { path: '/BarbellRow', icon: 'barbell-icon.png', label: 'Barbell Row' },
        { path: '/ModifiedBench', icon: 'benchpress-icon.png', label: 'Modified Benchpress' },
        { path: '/ModifiedOverheadPress', icon: 'overhead-icon.png', label: 'Modified Overhead Press' },
        { path: '/Stats', icon: 'stats-icon.png', label: 'Stats' }
    ];

    return (
        <div className="exercise-container">
            {/* Centered icon grid at the top */}
            <div className="exercise-icon-grid">
                {exercises.map(({ path, icon, label }) => (
                    <div key={path} className="exercise-icon-container">
                        <div
                            className={`exercise-icon-square ${location.pathname === path ? 'active' : ''}`}
                            onClick={() => handleNavigation(path)}
                        >
                            <img src={`${process.env.PUBLIC_URL}/${icon}`} alt={`${label} Icon`} />
                            <span className="exercise-icon-label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Title */}
            <h1 className="exercise-title">MODIFIED BENCHPRESS</h1>



            {/* Description */}
            <div className="exercise-description">
                <p>
                The Modified bench Press helps to build shoulder and upper back strength but the traditional bench press puts too much pressure on the abdominal core, because the back is arched. So, modifications are necessary.
                </p>
                <h3 style={{ textDecoration: "underline" }}>Starting out</h3>
                <p>
                Start with a light weight until you can properly perform 10 modified bench presses and only then start increasing weights.
                </p>
                <h3 style={{ textDecoration: "underline" }}>Modifications</h3>

                <p>Lie down on your bench</p>
                <p>Bring the feet up on the bench, so that your back is completely flat.</p>
                <p>Grip your weights in your hand.</p>
                <p>Exhale as your push up and inhale as you lower the weights back down.</p>
            </div>

            <div className="exercise-content-container">
                {/* DO NOT Section */}
                <div className="exercise-text-container">
                    <h2 className="exercise-do-not-title">Do Not</h2>
                    <p className="exercise-text-red">Lift the bar unevenly</p>
                    <p className="exercise-text-red">Arch your back</p>
                    <p className="exercise-text-red">Rush through the movement</p>
                </div>

                {/* Form to log exercise session */}
                <div className="exercise-form-and-description">
                    <div className="exercise-form-container">
                        <input
                            type="number"
                            className="exercise-input"
                            placeholder="Sets"
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                        />
                        <input
                            type="number"
                            className="exercise-input"
                            placeholder="Reps"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                        />
                        <input
                            type="number"
                            className="exercise-input"
                            placeholder="Weight"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            min="0"
                        />
                        <button className="exercise-save-button" onClick={handleSave}>
                            Save
                        </button>

                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        {suggestionMessage && <p className="suggestion-message">{suggestionMessage}</p>}
                    </div>
                </div>

                {/* DO Section */}
                <div className="exercise-text-container">
                    <h2 className="exercise-do-title">DO</h2>
                    <p className="exercise-text-green">Exhale while pushing up</p>
                    <p className="exercise-text-green">Keep your feet on the bench</p>
                    <p className="exercise-text-green">Keep your back flat against the bench</p>
                </div>
            </div>

            {/* Level-up message */}
            {levelUpMessage && (
                <div className="level-up-message">
                    <p>{levelUpMessage}</p>
                </div>
            )}

            {/* Show last 5 sessions */}
            <div className="exercise-recent-sessions-container">
                <h2 className="exercise-recent-sessions-title">Recent Sessions</h2>
                <div className="exercise-saved-data">
                    {savedData.map((data, index) => (
                        <div key={index} className="exercise-saved-data-item">
                            <strong className="exercise-record-bold">Date:</strong> {new Date(data.date).toLocaleDateString()} &nbsp;
                            <strong className="exercise-record-bold">Sets:</strong> {data.sets}, 
                            <strong className="exercise-record-bold"> Reps:</strong> {data.reps}, 
                            <strong className="exercise-record-bold"> Weight:</strong> {data.weight}
                            <button className="exercise-delete-button" onClick={() => handleDelete(data.id)}>&minus;</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModifiedBench;
