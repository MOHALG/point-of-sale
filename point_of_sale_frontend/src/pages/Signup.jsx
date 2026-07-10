import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-up`, formData);
      setSuccessMessage('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/sign-in');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.err || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us today</p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off" style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              style={styles.input}
              placeholder="Create a strong password"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        {errorMessage && <p style={styles.error} role="alert">{errorMessage}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}
        
        <p style={styles.linkText}>
          Already have an account? <Link to="/sign-in" style={styles.link}>Sign In</Link>
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
    background: 'linear-gradient(135deg, #FF8C42 0%, #FFC107 50%, #E74C3C 100%)',
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
    backgroundColor: '#FF8C42',
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
  success: {
    color: '#28a745',
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
    color: '#FF8C42',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Signup;