import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, deleteDoc, getDocs, documentId } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PostCard } from './Feed';
import { deleteUser } from "firebase/auth";

const ProfilePage = () => {
    const { userId } = useParams();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'saved'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            
            // Fetch user profile data
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setProfileUser({ id: userDocSnap.id, ...userDocSnap.data() });
                
                // Fetch user's saved posts if they exist
                const savedPostIds = userDocSnap.data().savedPosts;
                if (savedPostIds && savedPostIds.length > 0) {
                    const savedPostsQuery = query(collection(db, 'posts'), where(documentId(), 'in', savedPostIds));
                    const savedPostsSnap = await getDocs(savedPostsQuery);
                    setSavedPosts(savedPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            }

            // Fetch user's created posts
            const postsQuery = query(
                collection(db, 'posts'),
                where('authorId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(postsQuery, snapshot => {
                setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            });

            return () => unsubscribe();
        };

        fetchUserData();
    }, [userId]);

    const handleDeleteAccount = async () => {
        if (currentUser?.uid !== userId) {
            alert("You can only delete your own account.");
            return;
        }

        if (window.confirm("Are you absolutely sure you want to delete your account? This will permanently erase your profile, posts, and comments. This action cannot be undone.")) {
            try {
                // In a production app, a Cloud Function is the best way to delete all user content.
                for (const post of userPosts) {
                    await deleteDoc(doc(db, 'posts', post.id));
                }
                await deleteDoc(doc(db, 'users', userId));
                await deleteUser(auth.currentUser);
                
                await logout();
                navigate('/signup');
                alert("Account deleted successfully.");

            } catch (error) {
                console.error("Error deleting account: ", error);
                alert("Failed to delete account. You may need to log in again for security reasons.");
            }
        }
    };

    if (loading) {
        return <p className="text-center text-gray-400 mt-8">Loading profile...</p>;
    }

    if (!profileUser) {
        return <p className="text-center text-red-400 mt-8">User not found.</p>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return userPosts.length > 0 ? (
                    userPosts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <p className="text-gray-500 text-center pt-8">This user hasn't posted anything yet.</p>
                );
            case 'saved':
                 return savedPosts.length > 0 ? (
                    savedPosts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <p className="text-gray-500 text-center pt-8">No saved posts yet.</p>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">u/{profileUser.username}</h1>
                    <p className="text-gray-400">{profileUser.email}</p>
                </div>
                {currentUser && currentUser.uid === userId && (
                     <button 
                        onClick={handleDeleteAccount}
                        className="bg-red-500/20 text-red-400 font-bold text-sm px-4 py-2 rounded-full hover:bg-red-500/40 hover:text-white transition"
                    >
                        Delete Account
                    </button>
                )}
            </div>

            {/* Tabs for Posts and Saved */}
            <div className="flex border-b border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'posts' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
                >
                    Posts
                </button>
                {currentUser && currentUser.uid === userId && (
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'saved' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
                    >
                        Saved
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProfilePage;
