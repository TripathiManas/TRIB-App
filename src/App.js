import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Imports
import Feed from './pages/Feed';
import Matchday from './pages/Matchday';
import Groups from './pages/Groups';
import Shop from './pages/Shop';
import Signup from './pages/Signup';
import Login from './pages/Login';
import GroupPage from './pages/GroupPage';
import ProfilePage from './pages/ProfilePage';
import ChooseUsername from './pages/ChooseUsername'; // Import new page

// Component Imports
import Header from './components/common/Header';
import { Flame, Shield, Users, ShoppingCart } from 'lucide-react';


// --- BottomNav Component ---
const BottomNav = () => {
    const location = useLocation();
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/') return 'Feed';
        if (path.startsWith('/matchday')) return 'Matchday';
        if (path.startsWith('/groups') || path.startsWith('/group')) return 'Groups';
        if (path.startsWith('/shop')) return 'Shop';
        if (path.startsWith('/profile')) return ''; // No active tab on profile
        return 'Feed';
    };
    const activeTab = getActiveTab();

    const navItems = [
        { id: 'Feed', icon: <Flame size={24} />, label: 'Feed', path: '/' },
        { id: 'Matchday', icon: <Shield size={24} />, label: 'Matchday', path: '/matchday' },
        { id: 'Groups', icon: <Users size={24} />, label: 'Groups', path: '/groups' },
        { id: 'Shop', icon: <ShoppingCart size={24} />, label: 'Shop', path: '/shop' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 p-2 flex justify-around items-center">
            {navItems.map((item) => (
                <Link
                    key={item.id}
                    to={item.path}
                    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeTab === item.id ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};


// --- ProtectedRoute Wrapper ---
function ProtectedRoute({ children }) {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }
    
    // If user is logged in but has no profile (e.g., new Google sign-in),
    // redirect them to choose a username.
    if (!userProfile) {
        return <Navigate to="/choose-username" />;
    }

    return children;
}

// --- Main App Layout ---
const MainAppLayout = () => {
    return (
        <div className="bg-black text-white font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pb-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

// --- Main App Component ---
function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                
                {/* Special route for new users */}
                <Route path="/choose-username" element={<ChooseUsername />} />
                
                {/* Protected Routes inside the Main Layout */}
                <Route 
                    path="/" 
                    element={<ProtectedRoute><MainAppLayout /></ProtectedRoute>} 
                >
                    <Route index element={<Feed />} />
                    <Route path="matchday" element={<Matchday />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="group/:groupId" element={<GroupPage />} />
                    <Route path="profile/:userId" element={<ProfilePage />} />
                    <Route path="shop" element={<Shop />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
