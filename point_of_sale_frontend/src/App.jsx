import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router';
import Homepage from './pages/HomePage';
import Pointofsale from './pages/PointofSaleList';
import Signup from './pages/Signup';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Createnewpos from './pages/CreateNewPos';
import CategoriesManagement from './pages/CategoriesManagement';
import AdminUser from './pages/AdminUser';
import CreateUser from './pages/CreateUser';
import UserList from './pages/UserList';
import PosProfile from './pages/PosProfile';
import CreateItem from './pages/ItemManagement';
import './App.css';






function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthReady(true);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])).payload;
      setUser(payload);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  if (!isAuthReady) {
    return (
      <div>
        <Navbar user={user} setUser={setUser} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/sign-in" element={<SignIn setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/sign-in" replace />}
        />
        <Route
          path="/categories"
          element={user ? <CategoriesManagement /> : <Navigate to="/sign-in" replace />}
        />
        <Route
          path="/point-of-sale"
          element={user ? <Pointofsale /> : <Navigate to="/sign-in" replace />}
        />
        <Route path="/create-pos" element={user ? <Createnewpos /> : <Navigate to="/sign-in" replace />} />
        <Route path="/pos/:id" element={user ? <PosProfile /> : <Navigate to="/sign-in" replace />} />
        <Route path="/admin-user/:id" element={user ? <AdminUser /> : <Navigate to="/sign-in" replace />} />
        <Route path="/admin/users" element={user ? <UserList /> : <Navigate to="/sign-in" replace />} />
        <Route path="/admin/users/create" element={user ? <CreateUser /> : <Navigate to="/sign-in" replace />} />
        <Route path="/create-item" element={user ? <CreateItem /> : <Navigate to="/sign-in" replace />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/sign-in"} replace />} />
      </Routes>
    </div>
  );
}

export default App;

