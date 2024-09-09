// src/App.js
import React from 'react';
import Header from './header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Squat from './components/Squat';
import Deadlifts from './components/Deadlifts';
import ModifiedBench from './components/ModifiedBench';
import ModifiedOverheadPress from './components/ModifiedOverheadPress';
import BarbellRow from './components/BarbellRow';
import Stats from './components/Stats';
import Login from './components/Login';
import Register from './components/Register';
import BadgeProgress from './components/BadgeProgress'; // Import BadgeProgress component
import { AuthenticationProvider } from './Authentication'; // Import AuthenticationProvider

function App() {
    return (
        <AuthenticationProvider> {}
            <Router>
                <div>
                    <Header /> {/* Header needs to be at the top */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/squat" element={<Squat />} />
                        <Route path="/Deadlifts" element={<Deadlifts />} />
                        <Route path="/ModifiedBench" element={<ModifiedBench />} />
                        <Route path="/ModifiedOverheadPress" element={<ModifiedOverheadPress />} />
                        <Route path="/BarbellRow" element={<BarbellRow />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/badge-progress" element={<BadgeProgress />} /> {/* Add route for BadgeProgress */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </div>          
            </Router>
        </AuthenticationProvider>
    );
}

export default App;
