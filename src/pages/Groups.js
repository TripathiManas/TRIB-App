import React from 'react';

// --- Group Card Component ---
const GroupCard = ({ name, members, avatar, description }) => (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl mr-4">{avatar}</div>
            <div>
                <p className="font-bold text-lg">{name}</p>
                <p className="text-sm text-gray-400">{description}</p>
                <p className="text-xs text-gray-500 mt-1">{members} members</p>
            </div>
        </div>
        <button className="bg-green-500 text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-green-400 transition">
            Join
        </button>
    </div>
);

// --- Groups Page Component ---
const Groups = () => {
    // For the MVP, we'll use a pre-defined list of groups.
    // In the future, this data would come from your Firestore database.
    const recommendedGroups = [
        { id: 1, name: 'Premier League', description: 'All things related to the English Premier League.', members: '4.2M', avatar: '🦁' },
        { id: 2, name: 'Champions League', description: 'Europe\'s elite club competition.', members: '2.5M', avatar: '⭐' },
        { id: 3, name: 'Football Memes', description: 'For the lighter side of the beautiful game.', members: '1.8M', avatar: '😂' },
        { id: 4, name: 'r/FantasyPL', description: 'Tips, tricks, and team reveals for FPL.', members: '890k', avatar: '📈' },
        { id: 5, name: 'Kit Collectors', description: 'Showcasing classic and modern football kits.', members: '112k', avatar: '👕' },
    ];

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Find Your Community</h1>
                <p className="text-gray-400">Join groups to discuss tactics, transfers, and more.</p>
            </div>
            
            <div className="space-y-4">
                {recommendedGroups.map(group => <GroupCard key={group.id} {...group} />)}
            </div>
        </div>
    );
};

export default Groups;
