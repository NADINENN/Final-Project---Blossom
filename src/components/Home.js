// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

function Home() {
    return (
        <div className="home-container">
            <div className="home-exercise-grid">
                <Link to="/squat" className="home-exercise-box">Squat</Link>
                <Link to="/Deadlifts" className="home-exercise-box">Deadlifts</Link>
                <Link to="/BarbellRow" className="home-exercise-box">Barbell Row</Link>
                <Link to="/ModifiedBench" className="home-exercise-box">Modified Bench</Link>
                <Link to="/ModifiedOverheadPress" className="home-exercise-box">Modified Overhead Press</Link>
                <Link to="/Stats" className="home-exercise-box">Stats</Link>
            </div>
        </div>
    );
}

export default Home;