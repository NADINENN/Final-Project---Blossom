// src/Authentication.js
import React, { createContext, useState, useEffect } from 'react';


export const AuthenticationContext = createContext();


export const AuthenticationProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Check if a user is logged in 
    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setLoggedInUser(storedUser);
        }
    }, []);

    const login = (username) => {
        setLoggedInUser(username);
        localStorage.setItem('loggedInUser', username);
    };

    const logout = () => {
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUser');
    };

    return (
        <AuthenticationContext.Provider value={{ loggedInUser, login, logout }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
