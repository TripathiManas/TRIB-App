import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// --- Google Sign-In Button Component ---
const GoogleSignInButton = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            navigate('/');
        } catch (error) {
            console.error("Google Sign-In failed", error);
            setError("Failed to sign in with Google. Please try again.");
        }
    };

    return (
        <>
            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
            <button 
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#34A853" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l5.657,5.657C42.438,36.218,44,31.6,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FBBC05" d="M10.21,28.623c-1.311-3.194-1.311-6.722,0-9.916l-5.657-5.657C1.354,18.237,1.354,29.763,4.553,34.28z"></path>
                    <path fill="#EA4335" d="M24,48c5.166,0,9.86-1.977,13.409-5.192l-5.657-5.657C30.046,38.283,27.218,40,24,40c-4.454,0-8.289-2.344-10.21-5.719l-5.657,5.657C8.14,44.023,15.454,48,24,48z"></path>
                    <path fill="none" d="M0,0h48v48H0z"></path>
                </svg>
                Sign in with Google
            </button>
        </>
    );
};


export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
