import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { AuthenticationContext } from '../Authentication'; 
import './Squat.css';

function Squat() {
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [savedData, setSavedData] = useState([]);
    const [suggestionMessage, setSuggestionMessage] = useState('');
    const { loggedInUser } = useContext(AuthenticationContext); // Used to show loged in user
    const [userLevel, setUserLevel] = useState(1); // level needed to show
    const [levelUpMessage, setLevelUpMessage] = useState(''); // Message if a new level is achieved
    const navigate = useNavigate();
    const location = useLocation(); 

    // Show recent squat sessions
    useEffect(() => {
        if (loggedInUser) {
            // Fetch recent sessions
            fetch(`http://localhost:5000/api/exercises/get-recent-sessions?username=${loggedInUser}&exerciseType=squat`)
                .then((response) => response.json())
                .then((data) => {
                    setSavedData(data);
                    checkForSuggestions(data); // Check for suggestions based on fetched data
                })
                .catch((error) => console.error('Error fetching sessions:', error));

            // Fetch user level
            fetch(`http://localhost:5000/api/progress/get-user-progress?username=${loggedInUser}`)
                .then((response) => response.json())
                .then((data) => {
                    setUserLevel(data.level);
                })
                .catch((error) => console.error('Error fetching user level:', error));
        }
    }, [loggedInUser]);

    // Saving
    const handleSave = () => {
        if (sets === '' || reps === '' || weight === '') {
            setErrorMessage('Please fill out all fields before saving.');
            return;
        }

        // Allow weight to be 0, but sets and reps must be greater than zero
        if (parseInt(weight) < 0 || parseInt(sets) <= 0 || parseInt(reps) <= 0) {
            setErrorMessage('Weight can be zero, but sets and reps must be greater than zero.');
            return;
        }

        const currentDate = new Date().toISOString(); 
        const newEntry = {
            username: loggedInUser,
            exerciseType: 'squat',
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseInt(weight),
            date: currentDate, // Save the date in a standardized format
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
                console.log("Saving data...", data);
                // Update local state to include the new entry
                const updatedData = [{ ...newEntry, date: currentDate }, ...savedData.slice(0, 4)];
                setSavedData(updatedData);
                checkForSuggestions(updatedData); // Use updated data for suggestions
                setErrorMessage('');
                setSets('');
                setReps('');
                setWeight('');

                console.log("Checking if user levelled up...", data);
                // Check if the user leveled up
                if (data.levelUp) {
                    console.log('Level Up!', data);
                    setUserLevel(data.newLevel);
                    setLevelUpMessage(
                        `Congratulations! You've reached Level ${data.newLevel} by consistently improving your sets and weights! Keep it up!`
                    );
                } else {
                    console.log("user did not level up!")
                    setLevelUpMessage(''); // Reset if no level up
                }

            })
            .catch((error) => {
                console.error('Error saving session:', error);
                setErrorMessage('An error occurred while saving the session.');
            });
    };

    // Deleting
    const handleDelete = (id) => {
        fetch(`http://localhost:5000/api/exercises/delete-session/${id}`, {
            method: 'DELETE',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Session deleted successfully') {
                    // Instead of just updating the savedData, refetch the latest sessions
                    fetch(`http://localhost:5000/api/exercises/get-recent-sessions?username=${loggedInUser}&exerciseType=squat`)
                        .then((response) => response.json())
                        .then((data) => {
                            setSavedData(data); // Update saved data with the refetched latest sessions
                            checkForSuggestions(data); // Recheck for suggestions after refetching
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

    // If conditions are met, the suggestions will appear
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
                "It is suggested to try to achieve 3 to 5 sets for each weight you lift. It might be more beneficial to attempt this squat with a lower weight next time.",
                "It is great you strive to increase your maximum weight but being patient and increasing weight slowly will yield better long term results. So it could be useful to drop the weight until you can safely do 3 sets and only then to increase the weight.",
                "Keep up the effort! For a more balanced workout, try reducing the weight and increasing the sets."
            ]));
        } else if (checkSameWeightAndSets(data)) {
            setSuggestionMessage(randomMessage([
                "You have been using the same weight for 3 sessions. Consider increasing the weight.",
                "To maximize your gains, try increasing the weight after maintaining the same weight for 3 sessions.",
                "It seems like you are ready to challenge yourself more. Consider adding some weight to your squats.",
                "Consistency is key! Now try to increase your weight for further improvement.",
                "Great job being consistent! It might be time to challenge yourself with more weight."
            ]));
        } else {
            setSuggestionMessage(''); // If no conditions are met, there will be no suggestions
        }
    };

    const randomMessage = (messages) => {
        return messages[Math.floor(Math.random() * messages.length)];
    };

    // Check if the last 3 sessions had the same weights used
    const checkSameWeightAndSets = (data) => {
        const recentSessions = data.slice(0, 3); 
        if (recentSessions.length < 3) return false; 

        return recentSessions.every(session => session.weight === parseInt(weight) && session.sets >= 3);
    };

    useEffect(() => {
        console.log("Updated Suggestion Message:", suggestionMessage);
    }, [suggestionMessage]);

    // Navigation icons to other pages
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
            <h1 className="exercise-title">SQUATS</h1>



            {/* Description of exercise */}
            <div className="exercise-description">
                <p>
                    Squats are a fundamental movement since they require several muscles in the upper and lower body to work together and can improve core stability and reduce lower back pain.
                </p>
                <h3 style={{ textDecoration: "underline" }}>Starting out</h3>
                <p>
                    In order to ensure that squats can be performed safely, it is best to start with bodyweight only. Once you are able to perform 10 bodyweight squats without issues, it is time to start using weights.
                </p>
                <h3 style={{ textDecoration: "underline" }}>Modifications</h3>
                <p>
                    A modification is to use box squats. These squats have a dedicated pause in the middle. To perform them, you will need something to sit on, like a box or chair, which you will use to rest on mid-squat.
                </p>
                <p>Breathe in and squat down until you reach the box.</p>
                <p>Pause for one exhale and inhale.</p>
                <p>Breathe out while pushing back up.</p>
                <p>Slowly decrease the height of the box used until you feel comfortable performing squats without one.</p>
            </div>

            <div className="exercise-content-container">
                {/* DO NOT Section */}
                <div className="exercise-text-container">
                    <h2 className="exercise-do-not-title">Do Not</h2>
                    <p className="exercise-text-red">Pain is a sign to stop</p>
                    <p className="exercise-text-red">There should be no incontinence</p>
                    <p className="exercise-text-red">Heels do not lift off the floor</p>
                    <p className="exercise-text-red">Do not rock your pelvis forward</p>
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
                            min="0" // For the weight the user is allowed to enter 0
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
                    <p className="exercise-text-green">Breathe in going down</p>
                    <p className="exercise-text-green">Breathe out going up</p>
                    <p className="exercise-text-green">Feet are shoulder-width apart</p>
                    <p className="exercise-text-green">Toes are pointed outward</p>
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

export default Squat;
