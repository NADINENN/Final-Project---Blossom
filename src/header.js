import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationContext } from './Authentication';
import './header.css';
import './index.css';

function Header() {
    const navigate = useNavigate();
    const { loggedInUser } = useContext(AuthenticationContext); // Use context
    const [userLevel, setUserLevel] = useState(null); // State to store user level

    // Fetch user level 
    useEffect(() => {
        if (loggedInUser) {
            fetch(`http://localhost:5000/api/progress/get-user-progress?username=${loggedInUser}`)
                .then(response => response.json())
                .then((data) => {
                    setUserLevel(data.level);
                }) // assign the level
                .catch(error => console.error('Error fetching user level:', error));
        }
    }, [loggedInUser]);

    return (
        <header className="header">
            <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="Logo"
                className="header-logo"
                onClick={() => navigate('/')}
            />
            <div className="header-title">Blossom</div>
            <div className="header-user" onClick={() => navigate('/Login')}>
                <img
                    src={`${process.env.PUBLIC_URL}/user.png`}
                    alt="User"
                    className="header-user-icon"
                />
                {loggedInUser && (
                    <div className="header-user-info">
                        <div className="header-username">{loggedInUser}</div>
                        {/* SHow the level under the name when logged in */}
                        {userLevel !== null && (
                            <div className="header-user-level">Level: {userLevel}</div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
