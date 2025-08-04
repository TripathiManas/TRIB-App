import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function CreatePost() {
    const [postText, setPostText] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!postText.trim()) return; // Don't post empty messages

        setLoading(true);
        try {
            await addDoc(collection(db, 'posts'), {
                text: postText,
                authorId: currentUser.uid,
                authorEmail: currentUser.email,
                createdAt: serverTimestamp(),
                upvotes: 0,
                commentsCount: 0,
            });
            setPostText(''); // Clear the input after posting
        } catch (error) {
            console.error("Error creating post: ", error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                    rows="3"
                    placeholder={`What's on your mind, ${currentUser.email}?`}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button
                        type="submit"
                        disabled={loading || !postText.trim()}
                        className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
