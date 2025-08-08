import React, { useRef, useState, useEffect } from 'react'; // Import useEffect
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// --- Google Sign-In Button Component ---
const GoogleSignInButton = () => {
    // ... (GoogleSignInButton code remains the same)
};


export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- DEBUGGING STEP ---
    // This will log the API key to the browser console on your live Vercel site.
    useEffect(() => {
        console.log("Vercel Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);
    }, []);
    // --------------------

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (e) {
            setError(`Failed to sign in: ${e.message}`);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Log In to TRIB</h2>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                
                <GoogleSignInButton />

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink mx-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input id="email" type="email" ref={emailRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input id="password" type="password" ref={passwordRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <button disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200" type="submit">
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-gray-500">
                        Need an account? <Link to="/signup" className="text-green-400 hover:text-green-300">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
