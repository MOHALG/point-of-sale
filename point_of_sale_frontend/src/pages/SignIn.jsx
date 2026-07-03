import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

function SignIn({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [allowTyping, setAllowTyping] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setFormData({ username: '', password: '' });
  }, []);

  const handleChange = (event) => {
    const fieldName = event.target.dataset.field;
    setFormData({ ...formData, [fieldName]: event.target.value });

  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-in`, formData);
      const token = response.data.token;

      const userInfo = JSON.parse(atob(token.split('.')[1])).payload;
      setUser(userInfo);
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.err || 'An error occurred during sign in');
      
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="signin_username"
            data-field="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setAllowTyping(true)}
            autoComplete="new-password"
            readOnly={!allowTyping}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="signin_password"
            data-field="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setAllowTyping(true)}
            autoComplete="new-password"
            readOnly={!allowTyping}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }} role="alert">{errorMessage}</p>}
    </div>
  );
}

export default SignIn;