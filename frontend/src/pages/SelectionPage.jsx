import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SelectionPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const mockQPs = [
    { id: 'civil-engineering', name: 'Civil Engineering', code: 'CE', duration: '3 Hours', questions: 65 }
  ];

  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome, {user.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{user.email} | Please select a question paper to begin.</p>
        </div>
        <button onClick={onLogout} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {mockQPs.map((qp) => (
          <motion.div 
            key={qp.id}
            whileHover={{ y: -5 }}
            className="card"
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onClick={() => navigate(`/exam/${qp.id}`)}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', color: 'var(--primary)', opacity: 0.03 }}>
              <BookOpen size={100} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                  <BookOpen size={20} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{qp.name}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.4rem 0.8rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  {qp.duration}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.4rem 0.8rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  {qp.questions} Questions
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                <span style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}>Start Assessment</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelectionPage;
