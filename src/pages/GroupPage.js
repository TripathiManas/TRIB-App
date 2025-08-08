import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { CreatePost, PostCard } from './Feed'; // Correctly import the named components from Feed.js
import { useAuth } from '../context/AuthContext';

const GroupPage = () => {
    const { groupId } = useParams();
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const groupDetails = {
        premier_league: { name: 'Premier League', avatar: '🦁' },
        champions_league: { name: 'Champions League', avatar: '⭐' },
        football_memes: { name: 'Football Memes', avatar: '😂' },
        fantasy_pl: { name: 'r/FantasyPL', avatar: '📈' },
        kit_collectors: { name: 'Kit Collectors', avatar: '👕' },
    };

    const currentGroup = groupDetails[groupId] || { name: 'Unknown Group', avatar: '⚽' };

    useEffect(() => {
        // Check if the current user is a member of this group
        const checkMembership = async () => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().joinedGroups?.includes(groupId)) {
                    setIsMember(true);
                } else {
                    setIsMember(false);
                }
            }
        };
        checkMembership();

        // Fetch posts for this group
        const q = query(
            collection(db, "posts"), 
            where("groupId", "==", groupId), 
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(postsData);
                setLoading(false);
            }, 
            (err) => {
                console.error("Error fetching group posts:", err);
                setError("Failed to load feed. This group may require a Firestore index. Check the console for a link to create one.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [groupId, currentUser]);

    if (error) {
        return <p className="text-center text-red-400 p-4">{error}</p>
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-4xl mr-4">
                    {currentGroup.avatar}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{currentGroup.name}</h1>
                    <Link to="/groups" className="text-sm text-green-400 hover:underline">&larr; Back to all groups</Link>
                </div>
            </div>

            {/* Only show the CreatePost component if the user is a member */}
            {isMember ? (
                <CreatePost groupId={groupId} />
            ) : (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4 text-center text-gray-400">
                    You must join this group to post.
                </div>
            )}

            {loading && posts.length === 0 ? (
                <p className="text-center text-gray-400">Loading group feed...</p>
            ) : (
                <div className="space-y-3">
                    {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-center text-gray-500 pt-8">No posts in this group yet. Be the first!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupPage;
