import React from 'react';
import './BadgeProgress.css'; 
//Display the level of the user
function BadgeProgress({ level }) {
    return (
        <div className="badge-progress-container">
            <h3>Level {level}</h3>
        </div>
    );
}

export default BadgeProgress;
