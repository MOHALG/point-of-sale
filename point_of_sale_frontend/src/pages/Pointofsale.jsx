import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function Pointofsale() {
  const [posList, setPosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


 const fetchPosList = async () => {
   setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must sign in to view point of sale records.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/pos/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch point of sale list');
        }

        const data = await response.json();
        setPosList(data);
        setError('');
      } catch (error) {
        setError(error.message || 'Error fetching point of sale list');
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchPosList();
  }, []);

  return (
    <div>
      <h1>Point of Sale</h1>
      {loading && <p>Loading point of sale records...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && (
        <ul>
          {posList.map((pos) => (
            <li key={pos._id}>{pos.name}</li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate('/create-pos')}>Create New Point of Sale</button>
    </div>
  );
}

export default Pointofsale;