import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// --- Group Card Component ---
const GroupCard = ({ group, userGroups, onToggleJoin }) => {
    const { name, members, avatar, description, id } = group;
    const isMember = userGroups.includes(id);

    // This function stops the click from navigating when the button is pressed
    const handleJoinClick = (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        onToggleJoin(id, isMember);
    };

    return (
        <Link to={`/group/${id}`} className="block bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between hover:border-green-500 transition-colors">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl mr-4">{avatar}</div>
                <div>
                    <p className="font-bold text-lg">{name}</p>
                    <p className="text-sm text-gray-400">{description}</p>
                    <p className="text-xs text-gray-500 mt-1">{members} members</p>
                </div>
            </div>
            <button
                onClick={handleJoinClick}
                className={`font-bold text-sm px-4 py-1.5 rounded-full transition z-10 ${
                    isMember
                        ? 'bg-gray-700 text-gray-300 hover:bg-red-500/50 hover:text-white'
                        : 'bg-green-500 text-black hover:bg-green-400'
                }`}
            >
                {isMember ? 'Joined' : 'Join'}
            </button>
        </Link>
    );
};

// --- Groups Page Component ---
const Groups = () => {
    const { currentUser } = useAuth();
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const recommendedGroups = [
        { id: 'premier_league', name: 'Premier League', description: 'All things related to the English Premier League.', members: '4.2M', avatar: '🦁' },
        { id: 'champions_league', name: 'Champions League', description: 'Europe\'s elite club competition.', members: '2.5M', avatar: '⭐' },
        { id: 'football_memes', name: 'Football Memes', description: 'For the lighter side of the beautiful game.', members: '1.8M', avatar: '😂' },
        { id: 'fantasy_pl', name: 'r/FantasyPL', description: 'Tips, tricks, and team reveals for FPL.', members: '890k', avatar: '📈' },
        { id: 'kit_collectors', name: 'Kit Collectors', description: 'Showcasing classic and modern football kits.', members: '112k', avatar: '👕' },
    ];

    useEffect(() => {
        const fetchUserGroups = async () => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().joinedGroups) {
                    setUserGroups(userDoc.data().joinedGroups);
                }
            }
            setLoading(false);
        };
        fetchUserGroups();
    }, [currentUser]);

    const handleToggleJoin = async (groupId, isMember) => {
        if (!currentUser) return;
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
            if (isMember) {
                await updateDoc(userDocRef, { joinedGroups: arrayRemove(groupId) });
                setUserGroups(prev => prev.filter(id => id !== groupId));
            } else {
                await setDoc(userDocRef, { joinedGroups: arrayUnion(groupId) }, { merge: true });
                setUserGroups(prev => [...prev, groupId]);
            }
        } catch (error) {
            console.error("Error updating user groups: ", error);
        }
    };

    if (loading) return <p className="text-center text-gray-400 mt-8">Loading groups...</p>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Find Your Community</h1>
                <p className="text-gray-400">Join groups to discuss tactics, transfers, and more.</p>
            </div>
            <div className="space-y-4">
                {recommendedGroups.map(group => (
                    <GroupCard 
                        key={group.id} 
                        group={group}
                        userGroups={userGroups}
                        onToggleJoin={handleToggleJoin}
                    />
                ))}
            </div>
        </div>
    );
};

export default Groups;
