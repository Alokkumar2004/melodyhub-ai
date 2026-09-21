import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { Search as SearchIcon } from 'lucide-react';
import './Search.css';
import './Home.css';

const GENRES = ['All', 'Romantic', 'Sad', 'Happy', 'Bollywood', 'Classic', 'Dance', 'Party', 'Wedding', 'Travel'];

const Search = () => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        // Explicitly pass query and genre params to Axios
        const { data } = await api.get('/songs/search', {
          params: {
            q: query.trim(),
            genre: selectedGenre
          }
        });
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to prevent spamming requests while typing
    const delayDebounceFn = setTimeout(() => {
      fetchSongs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedGenre]);

  return (
    <div className="search-container">
      <Navbar />
      <div className="search-content">
        
        {/* Search Input Bar */}
        <div className="search-bar-container">
          <SearchIcon color="#000000" size={24} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by song title or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Genre Filter Pills Bar */}
        <div className="genre-pills-container">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <h3 className="section-title">
          {selectedGenre === 'All' && !query ? 'All Available Songs (200+)' : (selectedGenre !== 'All' ? `${selectedGenre} Songs` : 'Search Results')}
        </h3>
        
        {loading ? (
          <p style={{ color: '#a7a7a7', marginTop: '16px' }}>Searching tracks...</p>
        ) : (
          <div className="cards-grid">
            {results.map((song) => (
              <SongCard 
                key={song._id} 
                song={{ ...song, id: song._id, image: song.coverImage }} 
                playlist={results.map(s => ({ ...s, id: s._id, image: s.coverImage }))} 
              />
            ))}
          </div>
        )}
        
        {!loading && results.length === 0 && (
          <p style={{ color: '#a7a7a7', marginTop: '16px' }}>
            {query ? `No results found for "${query}"` : `No songs found in the "${selectedGenre}" category.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Search;