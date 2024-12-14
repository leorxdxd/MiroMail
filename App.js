import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* Route for Login */}
                <Route path="/login" element={<Login />} />

                {/* Route for Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Add more routes if needed */}
            </Routes>
        </Router>
    );
}

export default App;
