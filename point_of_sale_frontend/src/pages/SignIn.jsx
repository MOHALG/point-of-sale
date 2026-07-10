import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router';

function SignIn({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [allowTyping, setAllowTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const fieldName = event.target.dataset.field;
    setFormData({ ...formData, [fieldName]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-in`, formData);
      const token = response.data.token;

      const userInfo = JSON.parse(atob(token.split('.')[1])).payload;
      setUser(userInfo);
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.err || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
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
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
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
              style={styles.input}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {errorMessage && <p style={styles.error} role="alert">{errorMessage}</p>}
        
        <p style={styles.linkText}>
          Don't have an account? <Link to="/sign-up" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #E74C3C 0%, #FF8C42 50%, #FFC107 100%)',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  formWrapper: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '100%',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2C3E50',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E50',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #E0E0E0',
    borderRadius: '6px',
    fontFamily: 'Arial, sans-serif',
    transition: 'border-color 0.3s',
  },
  submitButton: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#E74C3C',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px',
  },
  error: {
    color: '#DC3545',
    fontSize: '14px',
    margin: '10px 0 0 0',
    fontWeight: '500',
  },
  linkText: {
    fontSize: '14px',
    textAlign: 'center',
    color: '#666',
    marginTop: '20px',
  },
  link: {
    color: '#E74C3C',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default SignIn;