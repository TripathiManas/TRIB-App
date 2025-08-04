import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
            navigate('/'); // Redirect to the main app page after login
        } catch {
            setError('Failed to sign in');
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
                <h2 className="text-2xl font-bold text-center text-white mb-8">Log In to TRIB</h2>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            ref={emailRef}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            ref={passwordRef}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500"
                        />
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
// This component provides a login form for existing users to access their accounts.
// It uses React hooks for state management and references for form inputs. 