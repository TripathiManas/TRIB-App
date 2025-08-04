import React, { useState, useEffect } from 'react';

// --- Match Score Card Component (for TheSportsDB) ---
const MatchScoreCard = ({ match }) => {
    const { strHomeTeam, strAwayTeam, intHomeScore, intAwayScore, strLeague, strStatus, strTimestamp } = match;

    const isLive = !["Match Finished", "Not Started", "Postponed", "Cancelled"].includes(strStatus);
    const hasStarted = intHomeScore !== null && intAwayScore !== null;
    const matchTime = new Date(strTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const matchDate = new Date(strTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });


    return (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-center text-xs text-gray-500 mb-2">{strLeague}</div>
            <div className="flex justify-between items-center">
                <div className="flex flex-col items-center w-1/3">
                    <span className="font-semibold text-sm text-center">{strHomeTeam}</span>
                </div>
                <div className="text-center">
                    {hasStarted ? (
                        <div className={`px-3 py-1 rounded-full text-lg font-bold ${isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700'}`}>
                            {intHomeScore} - {intAwayScore}
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-gray-700 rounded-full text-sm font-bold">
                            {matchDate} - {matchTime}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <span className="font-semibold text-sm text-center">{strAwayTeam}</span>
                </div>
            </div>
            {isLive && <div className="text-center text-xs text-green-400 mt-2 animate-pulse">{strStatus}</div>}
        </div>
    );
};

// --- Matchday Page Component ---
const Matchday = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatchesForWeek = async () => {
            const API_KEY = process.env.REACT_APP_THESPORTSDB_KEY; 
            
            if (!API_KEY) {
                setError("Please add your API key from TheSportsDB to your .env file (REACT_APP_THESPORTSDB_KEY).");
                setLoading(false);
                return;
            }
            
            try {
                // Create an array of dates for the next 7 days
                const dates = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                });

                // Create an array of fetch promises for each day
                const promises = dates.map(date =>
                    fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${date}&s=Soccer`)
                        .then(res => {
                            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                            return res.json();
                        })
                );

                // Wait for all promises to resolve
                const dailyResults = await Promise.all(promises);

                // Combine all matches into a single array and sort them by date
                const allMatches = dailyResults
                    .flatMap(result => result.events || [])
                    .sort((a, b) => new Date(a.strTimestamp) - new Date(b.strTimestamp));

                setMatches(allMatches);

            } catch (e) {
                console.error("Failed to fetch matches:", e);
                setError("Failed to fetch matches. The API might be temporarily unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatchesForWeek();
    }, []);

    // Group matches by date for display
    const groupedMatches = matches.reduce((groups, match) => {
        const date = new Date(match.strTimestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(match);
        return groups;
    }, {});


    if (loading) return <p className="text-center text-gray-400 mt-8">Fetching this week's matches...</p>;
    if (error) return <p className="text-center text-red-400 mt-8">Error: {error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">This Week's Matches</h2>
            {Object.keys(groupedMatches).length > 0 ? (
                Object.keys(groupedMatches).map(date => (
                    <div key={date} className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-700 pb-2">{date}</h3>
                        <div className="space-y-3">
                            {groupedMatches[date].map(match => <MatchScoreCard key={match.idEvent} match={match} />)}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No upcoming matches found for this week.</p>
            )}
        </div>
    );
};

export default Matchday;
