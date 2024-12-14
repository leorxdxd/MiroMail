import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import DesignEditor from './components/DesignEditor';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/design-editor" element={<DesignEditor />} />
            </Routes>
        </Router>
    );
};

export default App;
