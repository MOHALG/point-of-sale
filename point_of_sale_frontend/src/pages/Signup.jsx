import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  async function handleSubmit(event){
    event.preventDefault()

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-up`, formData);
      navigate('/sign-in');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.err || 'An error occurred during sign up');
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }} role="alert">{errorMessage}</p>}
    </div>
  );
}

export default Signup;