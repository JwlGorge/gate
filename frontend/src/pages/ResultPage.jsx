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
    <div className="container" style={{ paddingTop: '6rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'left', marginBottom: '5rem' }}
      >
        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>Assessment<br/>Complete</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px' }}>Well done, {user.name}! Your results have been calculated and synced.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>{scoringResult.score}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Marks</div>
        </div>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>{scoringResult.accuracy}%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</div>
        </div>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>{formatTime(timeTaken)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Taken</div>
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
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1.25rem 1rem' }}>Rank</th>
                  <th style={{ padding: '1.25rem 1rem' }}>Name</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((rank) => (
                  <tr 
                    key={rank.email} 
                    style={{ 
                      borderBottom: '1px solid var(--border)',
                      background: rank.email === user.email ? '#f6f6f6' : 'transparent',
                      fontWeight: rank.email === user.email ? '700' : '400'
                    }}
                  >
                    <td style={{ padding: '1.25rem 1rem' }}>#{rank.rank}</td>
                    <td style={{ padding: '1.25rem 1rem' }}>{rank.name} {rank.email === user.email && '(You)'}</td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem' }}>{rank.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="btn-group">
        <button 
          className="primary" 
          onClick={() => navigate(`/review/${qpName}`, { state: { questions, answers } })} 
        >
          <Search size={18} /> Review Answers
        </button>
        <button className="secondary" onClick={() => navigate('/select')}>
          <RefreshCcw size={18} /> Try Another
        </button>
        <button className="secondary" onClick={() => navigate('/select')}>
          <Home size={18} /> Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
