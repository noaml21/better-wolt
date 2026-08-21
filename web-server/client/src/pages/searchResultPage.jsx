import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { getQuery } from '../services/api'; 
import { Link } from 'react-router-dom'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams(); 
  const query = searchParams.get('q'); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      setLoading(true);
      try {
        const data = await getQuery(query); 
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]); 

  if (loading) return <div>טוען תוצאות חיפוש...</div>;

 return (
  <div className="page-content">
    <h2>תוצאות חיפוש עבור: {query}</h2>
    
    {results.length === 0 ? (
      <p>לא נמצאו מסעדות התואמות לחיפוש שלך.</p>
    ) : (
      <div className="menu-grid">
        {results.map((rest) => (
          <div key={rest.id} className="menu-card">
            <h4>{rest.name}</h4>
            <Link to={`/restaurant/${rest.id}`}>
              <button>צפה במסעדה</button>
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);
}