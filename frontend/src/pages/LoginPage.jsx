import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { User, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-warm the backend as soon as the login page loads
    // This helps wake up Render's free tier early
    import('../api').then(({ default: api }) => {
      api.get('/health').catch(() => {
        // Ignore error, we just want to trigger the wake-up
      });
    });
  }, []);

  const validateEmail = (id) => {
    // Format: tve + YY + DEPT + ROLL + @cet.ac.in (e.g., tve22cs077@cet.ac.in)
    const regex = /^tve\d{2}[a-z]{1,5}\d{3}@cet\.ac\.in$/i;
    return regex.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid College ID format. Expected format: tve[year][dept][roll] (e.g., tve22cs077)');
      return;
    }

    setLoading(true);
    console.log('Login attempt for:', email);
    
    // If it takes more than 3 seconds, it's likely waking up
    const wakeupTimer = setTimeout(() => {
      setWakingUp(true);
    }, 3000);

    try {
      const response = await login(name, email.toLowerCase());
      onLogin(response.data);
      console.log('Login successful:', response.data);
      navigate('/select');
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setError('Failed to login. Please try again.');
    } finally {
      clearTimeout(wakeupTimer);
      setLoading(false);
      setWakingUp(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div style={{ marginBottom: '4rem' }}>
          <img src="/logo.png" alt="Civil Engineering Association" style={{ width: '220px', height: 'auto', marginBottom: '2rem', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Enter your details to begin the assessment</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College ID</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tve22cs000@cet.ac.in"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: '1.4' }}>
              Format: tveXXYYZZZ@cet.ac.in
            </p>
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (wakingUp ? 'Waking up server...' : 'Processing...') : 'Continue'} <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
