import React from 'react';
import { Users, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            <h1 className="text-2xl font-bold tracking-tighter">TRIB</h1>
            <div className="flex items-center space-x-4">
                {currentUser && (
                    <>
                        <span className="text-sm text-gray-300 hidden sm:block">{currentUser.name}</span>
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
