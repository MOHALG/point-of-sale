import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router';
import Homepage from './pages/Homepage';
import Pointofsale from './pages/Pointofsale';
import Signup from './pages/Signup';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Createnewpos from './pages/Createnewpos';







function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    paymentMethods: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');


  

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthReady(true);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])).payload;
      setUser(payload);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        {!isAuthReady ? (
          <Route path="/" element={<p>Loading...</p>} />
        ) : (
          <>
            <Route path="/" element={<Homepage />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/sign-in" element={<SignIn setUser={setUser} />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard user={user} /> : <Navigate to="/sign-in" replace />}
            />
            <Route
              path="/point-of-sale"
              element={user ? <Pointofsale /> : <Navigate to="/sign-in" replace />}
            />
            <Route path="/create-pos" element={user ? <Createnewpos /> : <Navigate to="/sign-in" replace />} />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/sign-in"} replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

