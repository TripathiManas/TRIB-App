import React from 'react';
import { Flame, Shield, Users, ShoppingCart } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'Feed', icon: <Flame size={24} />, label: 'Feed' },
        { id: 'Matchday', icon: <Shield size={24} />, label: 'Matchday' },
        { id: 'Groups', icon: <Users size={24} />, label: 'Groups' },
        { id: 'Shop', icon: <ShoppingCart size={24} />, label: 'Shop' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 p-2 flex justify-around items-center">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeTab === item.id ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
// This component serves as the bottom navigation bar for the application, allowing users to switch between different sections.
// It uses Lucide icons for each tab and applies Tailwind CSS for styling, including a fixed position at the bottom of the screen.
// The active tab is highlighted with a different color, and clicking a tab updates the active state in the parent component.