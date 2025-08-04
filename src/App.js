import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Imports
import News from './pages/News';
import Matchday from './pages/Matchday';
import Groups from './pages/Groups';
import Shop from './pages/Shop';
import Signup from './pages/Signup';
import Login from './pages/Login';

// Component Imports
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';

// A wrapper to protect routes that require authentication
function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    if (!currentUser) {
        // If no user is logged in, redirect to the login page
        return <Navigate to="/login" />;
    }
    return children;
}

// The main application layout with tabs, only shown to logged-in users
function MainApp() {
    const [activeTab, setActiveTab] = useState('News');

    const renderContent = () => {
        switch (activeTab) {
            case 'News':
                return <News />;
            case 'Matchday':
                return <Matchday />;
            case 'Groups':
                return <Groups />;
            case 'Shop':
                return <Shop />;
            default:
                return <News />;
        }
    };

    return (
        <div className="bg-black text-white font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pb-20">
                {renderContent()}
            </main>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}


// The main App component that handles all routing
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
// This is the main entry point of the application, setting up routing and protected routes.
// It uses React Router for navigation and includes a protected route wrapper to ensure that only authenticated users
// can access the main application content.