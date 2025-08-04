import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const emailRef = useRef();
    const usernameRef = useRef(); // Add ref for username
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value.length < 6) {
            return setError('Password must be at least 6 characters long');
        }

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            // Pass the username to the signup function
            await signup(emailRef.current.value, passwordRef.current.value, usernameRef.current.value);
            navigate('/');
        } catch (e) {
            setError(`Failed to create an account: ${e.message}`);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
                <h2 className="text-2xl font-bold text-center text-white mb-8">Sign Up for TRIB</h2>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input id="email" type="email" ref={emailRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input id="username" type="text" ref={usernameRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                            Password (6+ characters)
                        </label>
                        <input id="password" type="password" ref={passwordRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password-confirm">
                            Password Confirmation
                        </label>
                        <input id="password-confirm" type="password" ref={passwordConfirmRef} required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500" />
                    </div>
                    <button disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200" type="submit">
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-gray-500">
                        Already have an account? <Link to="/login" className="text-green-400 hover:text-green-300">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
