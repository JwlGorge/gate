import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getRankings } from '../api';
import { Trophy, Target, Clock, RefreshCcw, Home, Award, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultPage = ({ user }) => {
  const { qpName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(true);

  // Result data passed from ExamPage
  const { scoringResult, timeTaken, questions, answers } = location.state || { 
    scoringResult: { score: 0, accuracy: 0, totalAttempted: 0, correctCount: 0 }, 
    timeTaken: 0,
    questions: [],
    answers: {}
  };

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await getRankings(user.email);
        setRankings(response.data);
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setLoadingRankings(false);
      }
    };
    fetchRankings();
  }, [user.email]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '4rem' }}
      >
        <div style={{ display: 'inline-flex', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '2rem' }}>
          <Trophy size={40} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Assessment Complete</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Well done, {user.name}! Here is your performance summary.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}><Award size={28} /></div>
          <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>{scoringResult.score}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Marks</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}><Target size={28} /></div>
          <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>{scoringResult.accuracy}%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Accuracy</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}><Clock size={28} /></div>
          <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>{formatTime(timeTaken)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time Taken</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '4rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Trophy size={24} style={{ color: 'var(--warning)' }} /> 
          Top Performers
        </h3>
        
        {loadingRankings ? (
          <div>Loading rankings...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem' }}>Rank</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>College ID</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((rank) => (
                  <tr 
                    key={rank.email} 
                    style={{ 
                      borderBottom: '1px solid var(--border)',
                      background: rank.email === user.email ? '#f5f5f5' : 'transparent',
                      color: 'inherit',
                      fontWeight: rank.email === user.email ? '700' : 'normal'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>#{rank.rank}</td>
                    <td style={{ padding: '1rem' }}>{rank.name} {rank.email === user.email && '(You)'}</td>
                    <td style={{ padding: '1rem' }}>{rank.email}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800' }}>{rank.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          className="primary" 
          onClick={() => navigate(`/review/${qpName}`, { state: { questions, answers } })} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Search size={18} /> Review Answers
        </button>
        <button className="secondary" onClick={() => navigate('/select')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCcw size={18} /> Try Another
        </button>
        <button className="secondary" onClick={() => navigate('/select')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={18} /> Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
