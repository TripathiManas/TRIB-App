import React from 'react';
import { LogOut, User } from 'lucide-react'; // Import the User icon
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <header className="bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10 p-4 flex justify-between items-center border-b border-gray-800">
            <Link to="/" className="text-2xl font-bold tracking-tighter">TRIB</Link>
            <div className="flex items-center space-x-4">
                {currentUser && (
                    <>
                        {/* The user's email is now a "My Profile" link */}
                        <Link 
                            to={`/profile/${currentUser.uid}`} 
                            className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            <User size={20} className="mr-2" />
                            <span className="hidden sm:block">My Profile</span>
                        </Link>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                            <LogOut size={20} />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
