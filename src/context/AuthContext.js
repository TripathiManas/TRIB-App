import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    // We use `undefined` as the initial state to mean "not checked yet"
    const [userProfile, setUserProfile] = useState(undefined);
    const [loading, setLoading] = useState(true);

    async function isUsernameTaken(username) {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }

    async function signup(email, password, username) {
        if (await isUsernameTaken(username)) {
            throw new Error("This username is already taken. Please choose another.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const profileData = {
            username: username,
            email: user.email,
            joinedGroups: []
        };
        await setDoc(doc(db, "users", user.uid), profileData);
        setUserProfile(profileData);
        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        setUserProfile(null); // On logout, profile is definitively null
        return signOut(auth);
    }

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    async function refetchUserProfile() {
        if (auth.currentUser) {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            setUserProfile(userDoc.exists() ? userDoc.data() : null);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                // If the doc exists, set the profile. If not, set it to null.
                setUserProfile(userDoc.exists() ? userDoc.data() : null);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        logout,
        signInWithGoogle,
        isUsernameTaken,
        refetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
