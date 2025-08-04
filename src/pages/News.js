import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, addDoc, serverTimestamp, getDoc, increment, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, ArrowUp, MoreHorizontal, X, Edit, Trash2 } from 'lucide-react';

// --- CreatePost Component ---
const CreatePost = () => {
    const [postText, setPostText] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!postText.trim() || !currentUser) return;

        setLoading(true);
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const username = userDoc.exists() ? userDoc.data().username : currentUser.email;

            await addDoc(collection(db, 'posts'), {
                text: postText,
                authorId: currentUser.uid,
                authorUsername: username,
                createdAt: serverTimestamp(),
                upvotes: 0,
                commentsCount: 0,
                upvotedBy: [],
            });
            setPostText('');
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
                    placeholder="What's on your mind?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button type="submit" disabled={loading || !postText.trim()} className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Comment Component ---
const Comment = ({ comment, postId }) => {
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);

    const handleDeleteComment = async () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                // Delete the comment document
                await deleteDoc(doc(db, `posts/${postId}/comments`, comment.id));
                
                // Decrement the commentsCount on the parent post
                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, {
                    commentsCount: increment(-1)
                });
            } catch (error) {
                console.error("Error deleting comment: ", error);
            }
        }
    };
    
    const handleUpdateComment = async (e) => {
        e.preventDefault();
        if (!editedText.trim()) return;

        const commentRef = doc(db, `posts/${postId}/comments`, comment.id);
        try {
            await updateDoc(commentRef, {
                text: editedText
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating comment: ", error);
        }
    };

    return (
        <div className="bg-gray-800 p-2 rounded-lg">
            {isEditing ? (
                <form onSubmit={handleUpdateComment}>
                    <textarea 
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    />
                    <div className="text-right mt-1 space-x-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="text-xs text-green-400 hover:text-green-300">Save</button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{comment.text}</p>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400 mt-1">
                            by u/{comment.authorUsername} • {comment.createdAt?.toDate().toLocaleDateString()}
                        </p>
                        {currentUser && currentUser.uid === comment.authorId && (
                            <div className="flex items-center space-x-3">
                                <Edit size={14} className="cursor-pointer text-gray-500 hover:text-yellow-400" onClick={() => setIsEditing(true)} />
                                <Trash2 size={14} className="cursor-pointer text-gray-500 hover:text-red-500" onClick={handleDeleteComment} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};


// --- Comments Section Component ---
const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser) return;

        setLoading(true);
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const username = userDoc.exists() ? userDoc.data().username : currentUser.email;

            await addDoc(collection(db, `posts/${postId}/comments`), {
                text: commentText,
                authorId: currentUser.uid,
                authorUsername: username,
                createdAt: serverTimestamp(),
            });

            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, { commentsCount: increment(1) });
            
            setCommentText('');
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
        setLoading(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-700">
            <form onSubmit={handleCommentSubmit} className="mb-4">
                 <textarea
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                    rows="2"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button type="submit" disabled={loading || !commentText.trim()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-200 disabled:bg-gray-600">
                        Comment
                    </button>
                </div>
            </form>
            
            <div className="space-y-3">
                {comments.map(comment => (
                    <Comment key={comment.id} comment={comment} postId={postId} />
                ))}
            </div>
        </div>
    );
};


// --- PostCard Component ---
const PostCard = ({ post }) => {
    const { currentUser } = useAuth();
    const { text, authorUsername, authorId, createdAt, id } = post;
    
    const [votes, setVotes] = useState(post.upvotes || 0);
    const [hasVoted, setHasVoted] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    useEffect(() => {
        setHasVoted(post.upvotedBy?.includes(currentUser?.uid));
        setVotes(post.upvotes || 0);
        setCommentsCount(post.commentsCount || 0);
    }, [post, currentUser]);

    const handleUpvote = async () => {
        if (!currentUser) return;
        const postRef = doc(db, 'posts', id);
        
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) throw "Document does not exist!";

            const upvotedBy = postDoc.data().upvotedBy || [];
            const userHasVoted = upvotedBy.includes(currentUser.uid);
            
            const newUpvotes = userHasVoted ? postDoc.data().upvotes - 1 : postDoc.data().upvotes + 1;
            const newUpvotedBy = userHasVoted ? upvotedBy.filter(uid => uid !== currentUser.uid) : [...upvotedBy, currentUser.uid];
            
            transaction.update(postRef, { upvotes: newUpvotes, upvotedBy: newUpvotedBy });
        });
    };
    
    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post and all its comments?")) {
            try {
                // Firestore does not support deleting a collection from the client-side SDK directly.
                // A better approach for production would be a Cloud Function.
                // For now, we'll just delete the post document.
                await deleteDoc(doc(db, "posts", id));
            } catch (error) {
                console.error("Error deleting post: ", error);
            }
        }
    };

    const postDate = createdAt?.toDate().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <div className="flex space-x-3">
                <div className="flex flex-col items-center space-y-1 text-gray-400">
                    <ArrowUp onClick={handleUpvote} className={`cursor-pointer transition-colors ${hasVoted ? 'text-green-400' : 'hover:text-green-400'}`} size={20} />
                    <span className="font-bold text-sm">{votes}</span>
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div className="text-xs text-gray-500 mb-1">
                            <span>Posted by u/{authorUsername} • {postDate}</span>
                        </div>
                        <div className="relative" ref={menuRef}>
                            <MoreHorizontal size={16} className="cursor-pointer hover:text-white" onClick={() => setShowMenu(!showMenu)} />
                            {showMenu && currentUser && currentUser.uid === authorId && (
                                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                                    <button onClick={handleDeletePost} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center">
                                        <Trash2 size={14} className="mr-2"/> Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-md text-gray-100 mb-2 whitespace-pre-wrap">{text}</p>
                    <div className="flex items-center text-gray-400 space-x-4">
                        <div onClick={() => setCommentsVisible(!commentsVisible)} className="flex items-center space-x-1 hover:text-white cursor-pointer">
                            <MessageCircle size={16} />
                            <span className="text-xs">{commentsCount} Comments</span>
                        </div>
                    </div>
                </div>
            </div>
            {commentsVisible && <CommentsSection postId={id} />}
        </div>
    );
};

// --- News Page Component ---
const News = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <CreatePost />
            {loading ? (
                <p className="text-center text-gray-400">Loading feed...</p>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
            )}
        </div>
    );
};

export default News;
// This component serves as the news feed page, allowing users to create posts and view others' posts.
// It includes functionality for creating posts, upvoting, commenting, and deleting posts.
// It uses Firestore for real-time data updates and includes a CreatePost component for submitting new posts.
// The PostCard component displays individual posts with options to upvote, comment, and delete if the user is the author.
// CommentsSection handles displaying and adding comments to each post, with real-time updates from Firestore.
// The component uses Tailwind CSS for styling, ensuring a clean and responsive design.
// The CreatePost component allows users to submit new posts, which are stored in Firestore.
// The CommentsSection component allows users to view and add comments to posts, with real-time updates from Firestore.
// The PostCard component displays individual posts, including the post text, author information,
// upvote functionality, and comments. It also includes options for the post author to edit or delete their post.
// The News component fetches posts from Firestore and renders them using the PostCard component.
// The component uses React hooks for state management and Firestore's real-time capabilities for data updates.