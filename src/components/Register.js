import React, { useState, useEffect } from 'react';
import './Register.css';
import { Link } from 'react-router-dom'; // used for navigation

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 

    // Validation to check for duplicates
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // All fields need to be valid before the register button is enabled
    useEffect(() => {
        // all fields must be filld without any error
        if (!nameError && !emailError && !passwordError && name && email && password) {
            // the username needs to be unique
            checkUsernameUnique(name);
        } else {
            setIsButtonDisabled(true);
        }
    }, [name, email, password, nameError, emailError, passwordError]);

    const checkUsernameUnique = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/check-username?name=${username}`);
            const data = await response.json();

            if (response.ok && !data.exists) {
                setIsButtonDisabled(false); // the button is enabled if the username is unique
                setErrorMessage(''); 
            } else {
                setIsButtonDisabled(true); // If the username is not unique the button does not become enabled
                setErrorMessage('Name already exists. Please choose a different name.');
            }
        } catch (error) {
            console.log('Error checking username uniqueness:', error);
            setIsButtonDisabled(true); // if there is an error the button does not become enabled
            setErrorMessage('An error occurred while checking the username.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); // No default form submission

        console.log('Making API request'); // checking on console log that it works
        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            console.log('Response status:', response.status); // checking console log
            console.log('Response data:', data); // checking console log

            if (response.ok) {
                console.log('Registration successful:', data); // checking console log
                setSuccessMessage('Thank you for registering. Go to Login.'); 
                setErrorMessage(''); 
            } else {
                console.log('Registration failed:', data.message || 'No error message provided'); // checking console log and showing error
                setErrorMessage(data.message || 'Registration failed');
            }
        } catch (error) {
            console.log('An error occurred:', error); // Show the error in console log
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    // Validation occurs in real time while the user types
    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        if (value.length < 5) {
            setNameError('Name must be at least 5 characters long.');
        } else {
            setNameError('');
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex pattern for email validation to avoid bogus emails
        if (!emailPattern.test(value)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length < 5) {
            setPasswordError('Password must be at least 5 characters long.'); // Minimum length for security
        } else {
            setPasswordError('');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {successMessage ? ( // Success message
                <div>
                    <p className="success-message">{successMessage}</p>
                    <Link to="/login" className="login-link">Go to Login</Link>
                </div>
            ) : ( // If not succesful the form is still shown
                <form onSubmit={handleRegister} className="register-form">
                    <div className="register-form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            required
                        />
                        {nameError && <p className="register-error-message">{nameError}</p>}
                    </div>
                    <div className="register-form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        {emailError && <p className="register-error-message">{emailError}</p>}
                    </div>
                    <div className="register-form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {passwordError && <p className="register-error-message">{passwordError}</p>}
                    </div>
                    <button type="submit" className="register-button" disabled={isButtonDisabled}>
                        Register
                    </button>
                </form>
            )}
            {errorMessage && <p className="register-error-message">{errorMessage}</p>}
        </div>
    );
};

export default Register;
