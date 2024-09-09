// src/components/Login.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticationContext } from '../Authentication'; 
import './Login.css';

const Login = () => {
    const { loggedInUser, login, logout } = useContext(AuthenticationContext); // content from authentication
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/users/login', { // check login with backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Login successful!'); 
                login(name); // Use login function from context
                setErrorMessage('');
            } else {
                setErrorMessage(data.message || 'Login failed');
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
            setSuccessMessage('');
        }
    };

    const handleLogout = () => { // the logout function is shown only is a user is logged in
        logout(); 
        setSuccessMessage('');
        setErrorMessage('');
        setName('');
        setPassword('');
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {loggedInUser ? (
                <div>
                    <p className="login-success-message">Logged in as "{loggedInUser}"</p>
                    <button className="logout-button" onClick={handleLogout}>Log Out</button>
                </div>
            ) : (
                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
            )}
            {errorMessage && <p className="login-error-message">{errorMessage}</p>}
            {!loggedInUser && ( // the link to register is only shown if a user is not logged in
                <div className="login-register-link"> 
                    <p>Don't have an account? <Link to="/register">Register here</Link></p> 
                </div>
            )}
        </div>
    );
};

export default Login;
