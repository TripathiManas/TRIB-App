import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, runTransaction, addDoc, serverTimestamp, getDoc, increment, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, ArrowUp, MoreHorizontal, Edit, Trash2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- CreatePost Component (Named export) ---
export const CreatePost = ({ groupId = "main" }) => {
    const [postText, setPostText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!postText.trim() || !currentUser) return;

        setLoading(true);
        setError('');
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            const username = (userDoc.exists() && userDoc.data().username) 
                ? userDoc.data().username 
                : currentUser.email;

            await addDoc(collection(db, 'posts'), {
                text: postText,
                authorId: currentUser.uid,
                authorUsername: username,
                createdAt: serverTimestamp(),
                upvotes: 0,
                commentsCount: 0,
                upvotedBy: [],
                groupId: groupId,
            });
            setPostText('');
        } catch (err) {
            console.error("Error creating post: ", err);
            setError(`Failed to post: ${err.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4">
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                    rows="3"
                    placeholder={groupId !== 'main' ? `Post in r/${groupId}...` : "What's on your mind?"}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button type="submit" disabled={loading || !postText.trim()} className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-600">
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
                await deleteDoc(doc(db, `posts/${postId}/comments`, comment.id));
                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, { commentsCount: increment(-1) });
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
            await updateDoc(commentRef, { text: editedText });
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


// --- PostCard Component (Named export) ---
export const PostCard = ({ post }) => {
    const { currentUser } = useAuth();
    const { text, authorUsername, authorId, createdAt, id, groupId } = post;
    
    const groupDetails = {
        premier_league: { name: 'Premier League' },
        champions_league: { name: 'Champions League' },
        football_memes: { name: 'Football Memes' },
        fantasy_pl: { name: 'r/FantasyPL' },
        kit_collectors: { name: 'Kit Collectors' },
    };
    
    const [votes, setVotes] = useState(post.upvotes || 0);
    const [hasVoted, setHasVoted] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().savedPosts?.includes(id)) {
                    setIsSaved(true);
                }
            });
        }
        
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        
        setHasVoted(post.upvotedBy?.includes(currentUser?.uid));
        setVotes(post.upvotes || 0);
        setCommentsCount(post.commentsCount || 0);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [post, currentUser, id]);

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
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, "posts", id));
            } catch (error) {
                console.error("Error deleting post: ", error);
            }
        }
    };

    const handleSavePost = async () => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        try {
            if (isSaved) {
                await updateDoc(userDocRef, { savedPosts: arrayRemove(id) });
                setIsSaved(false);
            } else {
                await updateDoc(userDocRef, { savedPosts: arrayUnion(id) });
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error saving post: ", error);
        }
        setShowMenu(false);
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
                        <div className="text-xs text-gray-500 mb-1 flex items-center space-x-2">
                            {groupId && groupId !== 'main' && (
                                <Link to={`/group/${groupId}`} className="font-bold text-white hover:underline">
                                    r/{groupDetails[groupId]?.name || groupId}
                                </Link>
                            )}
                            <Link to={`/profile/${authorId}`} className="hover:underline">
                                <span>Posted by u/{authorUsername}</span>
                            </Link>
                            <span>• {postDate}</span>
                        </div>
                        <div className="relative" ref={menuRef}>
                            <MoreHorizontal size={16} className="cursor-pointer hover:text-white" onClick={() => setShowMenu(!showMenu)} />
                            {showMenu && currentUser && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                                    <button onClick={handleSavePost} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center">
                                        <Bookmark size={14} className={`mr-2 ${isSaved ? 'text-green-400' : ''}`}/> {isSaved ? 'Unsave Post' : 'Save Post'}
                                    </button>
                                    {currentUser.uid === authorId && (
                                        <button onClick={handleDeletePost} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center">
                                            <Trash2 size={14} className="mr-2"/> Delete Post
                                        </button>
                                    )}
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


// --- Feed Page Component (Default Export) ---
const Feed = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        let unsubscribe = () => {};

        const userDocRef = doc(db, "users", currentUser.uid);
        getDoc(userDocRef).then(userDoc => {
            if (isMounted) {
                const joinedGroups = userDoc.exists() ? userDoc.data().joinedGroups || [] : [];
                // Ensure 'main' is always included for the general feed
                const groupsToQuery = Array.from(new Set(['main', ...joinedGroups]));

                if (groupsToQuery.length > 0) {
                    const q = query(
                        collection(db, "posts"),
                        where("groupId", "in", groupsToQuery),
                        orderBy("createdAt", "desc")
                    );

                    unsubscribe = onSnapshot(q,
                        (querySnapshot) => {
                            if (isMounted) {
                                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                setPosts(postsData);
                                setLoading(false);
                            }
                        },
                        (err) => {
                            if (isMounted) {
                                console.error("Firestore Error:", err);
                                setError("Failed to load feed. You may need to create a Firestore index. Check the console for a link.");
                                setLoading(false);
                            }
                        }
                    );
                } else {
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [currentUser]);

    if (error) {
        return <p className="text-center text-red-400 p-4">{error}</p>
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <CreatePost />
            {loading && posts.length === 0 ? (
                <p className="text-center text-gray-400">Loading your personalized feed...</p>
            ) : (
                <div className="space-y-3">
                    {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-center text-gray-500 pt-8">Your feed is empty. Join some groups or create a post!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Feed;
