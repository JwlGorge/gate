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
    <div className="container" style={{ paddingTop: '6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Welcome,<br/>{user.name.split(' ')[0]}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a question paper to begin.</p>
        </div>
        <button onClick={onLogout} className="secondary">
          Logout
        </button>
      </div>

      <div className="selection-grid">
        {mockQPs.map((qp) => (
          <motion.div 
            key={qp.id}
            whileHover={{ y: -4, borderColor: 'var(--primary)' }}
            className="card"
            style={{ cursor: 'pointer', padding: '2rem' }}
            onClick={() => navigate(`/exam/${qp.id}`)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', lineHeight: '1.1' }}>{qp.name}</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.25rem 0.5rem', background: '#000', color: '#fff', borderRadius: '2px', textTransform: 'uppercase' }}>
                  {qp.duration}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', borderRadius: '2px', textTransform: 'uppercase' }}>
                  {qp.questions} Qs
                </span>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem' }}>
                <span>Start Exam</span>
                <ChevronRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelectionPage;
