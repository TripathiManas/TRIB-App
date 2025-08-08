import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// --- Group Card Component ---
const GroupCard = ({ group, userGroups, onToggleJoin }) => {
    const { name, avatar, description, id, membersCount } = group;
    const isMember = userGroups.includes(id);

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
                    <p className="text-xs text-gray-500 mt-1">{membersCount || 0} members</p>
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
    const [allGroups, setAllGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Effect for fetching all groups
    useEffect(() => {
        const groupsQuery = collection(db, "groups");
        const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
            const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllGroups(groupsData);
            setLoading(false); // Set loading to false after fetching all groups
        });
        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    // Effect for fetching the current user's joined groups
    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserGroups(doc.data().joinedGroups || []);
                }
            });
            return () => unsubscribe(); // Cleanup listener on unmount
        } else {
            setUserGroups([]); // Clear user groups if logged out
        }
    }, [currentUser]);

    const handleToggleJoin = async (groupId, isMember) => {
        if (!currentUser) return;
        const userDocRef = doc(db, "users", currentUser.uid);
        const groupDocRef = doc(db, "groups", groupId);

        try {
            await runTransaction(db, async (transaction) => {
                if (isMember) {
                    // Atomically leave the group
                    transaction.update(userDocRef, { joinedGroups: arrayRemove(groupId) });
                    transaction.update(groupDocRef, { membersCount: increment(-1) });
                } else {
                    // Atomically join the group
                    transaction.update(userDocRef, { joinedGroups: arrayUnion(groupId) });
                    transaction.update(groupDocRef, { membersCount: increment(1) });
                }
            });
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
                {allGroups.map(group => (
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
