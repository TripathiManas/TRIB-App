import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';

const ChooseUsername = () => {
    const { currentUser, isUsernameTaken, refetchUserProfile } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Suggest a username based on the user's email or display name
        if (currentUser) {
            const suggested = (currentUser.displayName || currentUser.email.split('@')[0])
                .replace(/[^a-zA-Z0-9]/g, ''); // Sanitize the name
            setUsername(suggested);
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            return setError("Username cannot be empty.");
        }

        setLoading(true);
        setError('');

        try {
            if (await isUsernameTaken(username)) {
                setError("This username is already taken. Please choose another.");
                setLoading(false);
                return;
            }

            const profileData = {
                username: username,
                email: currentUser.email,
                joinedGroups: []
            };

            // Create the user profile in Firestore
            await setDoc(doc(db, "users", currentUser.uid), profileData);

            // Explicitly refetch the profile before navigating to fix the loop
            await refetchUserProfile();
            
            navigate('/');

        } catch (err) {
            setError("Failed to create profile. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Welcome to TRIB!</h2>
                <p className="text-center text-gray-400 mb-8">Choose a unique username to get started.</p>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <button disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200" type="submit">
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChooseUsername;
