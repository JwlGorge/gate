import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, LayoutGrid, X } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewPage = () => {
  const isImageOption = (value) => {
    if (typeof value !== 'string') return false;
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    return extensions.some(ext => value.toLowerCase().endsWith(ext));
  };

  const getImagePath = (value) => {
    if (value.startsWith('/') || value.startsWith('http')) return value;
    return `/images/${value}`;
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { qpName } = useParams();
  const { questions, answers = {} } = location.state || { questions: [], answers: {} };
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPalette, setShowPalette] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>No data to review</h2>
        <button className="primary" onClick={() => navigate('/select')}>Return to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const userAnswer = answers[currentQuestion.question_number];
  
  const renderMathText = (text) => {
    if (!text) return null;
    return text.split(/(\$\$.*?\$\$|\$.*?\$)/g).map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <BlockMath key={i} math={part.slice(2, -2)} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={i} math={part.slice(1, -1)} />;
      }
      return part;
    });
  };

  const isCorrect = (q) => {
    const ans = answers[q.question_number];
    if (q.question_type === 'MSQ') {
      const userArr = (ans || []).sort();
      const correctArr = q.answer.split(',').map(s => s.trim()).sort();
      return JSON.stringify(userArr) === JSON.stringify(correctArr);
    }
    if (q.question_type === 'NAT') {
      if (!ans) return false;
      const [min, max] = q.answer.split('-').map(s => parseFloat(s.trim()));
      const userVal = parseFloat(ans);
      return userVal >= min && userVal <= max;
    }
    return ans === q.answer;
  };

  return (
    <div className="exam-grid">
      <div className="exam-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Final Review • {currentQuestion.question_type}
            </div>
            <h1 style={{ fontSize: '3rem', lineHeight: '1' }}>Q{currentIndex + 1}</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="secondary mobile-palette-toggle" 
              style={{ display: 'none', padding: '0.875rem' }}
              onClick={() => setShowPalette(true)}
            >
              <LayoutGrid size={22} />
            </button>
            <button onClick={() => navigate('/select')} className="secondary">
              <span className="desktop-only">Exit Review</span>
              <span className="mobile-only" style={{ display: 'none' }}>Exit</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
            style={{ minHeight: '300px', marginBottom: '2rem' }}
          >
            <div style={{ fontSize: '1.25rem', marginBottom: '2.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {renderMathText(currentQuestion.question_text)}
            </div>

            {currentQuestion.image && (
              <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center', background: '#fff', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <img 
                  src={currentQuestion.image} 
                  alt={`Question ${currentIndex + 1}`} 
                  loading="lazy"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentQuestion.question_type === 'MCQ' || currentQuestion.question_type === 'MSQ' ? (
                Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isUserSelection = currentQuestion.question_type === 'MSQ' 
                    ? (userAnswer || []).includes(key)
                    : userAnswer === key;
                  const isCorrectOption = currentQuestion.answer.split(',').map(s => s.trim()).includes(key);
                  
                  let background = '#f6f6f6';
                  let borderColor = 'var(--border)';

                  if (isCorrectOption) {
                    background = '#f0f0f0';
                    borderColor = '#000000';
                  }
                  if (isUserSelection && !isCorrectOption) {
                    borderColor = '#ff0000';
                  }

                  return (
                    <div
                      key={key}
                      style={{ 
                        padding: '1.25rem',
                        border: '1px solid',
                        borderRadius: '4px',
                        display: 'flex', 
                        gap: '1.25rem', 
                        borderColor: borderColor,
                        background: background,
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontWeight: '800' }}>{key}.</span>
                      <span style={{ flex: 1 }}>
                        {isImageOption(value) ? (
                          <img 
                            src={getImagePath(value)} 
                            alt={`Option ${key}`} 
                            loading="lazy"
                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} 
                          />
                        ) : (
                          renderMathText(value)
                        )}
                      </span>
                      {isCorrectOption && <CheckCircle2 size={20} style={{ color: '#000' }} />}
                      {isUserSelection && !isCorrectOption && <XCircle size={20} style={{ color: '#ff0000' }} />}
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px', background: '#f6f6f6' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: '700' }}>Your Answer</p>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{userAnswer || 'Not Attempted'}</div>
                  </div>
                  <div style={{ padding: '1.5rem', border: '2px solid #000', borderRadius: '4px', background: '#fff' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: '700' }}>Correct Answer Range</p>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{currentQuestion.answer}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="btn-group" style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
          <button 
            className="secondary" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <button 
            className="secondary" 
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPalette && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPalette(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90, backdropFilter: 'blur(4px)' }}
          />
        )}
        {(showPalette || window.innerWidth > 1024) && (
          <motion.div 
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`exam-sidebar ${showPalette ? 'active' : ''}`}
            style={{ zIndex: 100 }}
          >
            {showPalette && (
              <button 
                onClick={() => setShowPalette(false)} 
                style={{ position: 'absolute', top: '2rem', right: '1.5rem', background: 'transparent', border: 'none', padding: '0.5rem' }}
                className="mobile-only"
              >
                <X size={28} />
              </button>
            )}
            
            <div className="card" style={{ padding: '2rem', flex: 1, border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <h4 style={{ marginBottom: '2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Review Palette</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {questions.map((q, idx) => {
                  const correct = isCorrect(q);
                  const attempted = answers[q.question_number] !== undefined;
                  const active = idx === currentIndex;
                  
                  return (
                    <button
                      key={q.question_number}
                      onClick={() => {
                        setCurrentIndex(idx);
                        if(window.innerWidth <= 1024) setShowPalette(false);
                      }}
                      style={{
                        padding: '0',
                        height: '44px',
                        width: '44px',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '800',
                        background: active ? '#000' : attempted ? (correct ? '#e6f4ea' : '#fce8e6') : 'transparent',
                        color: active ? '#fff' : 'var(--text-main)',
                        border: active ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: '500' }}>
                  <div style={{ width: '12px', height: '12px', background: '#e6f4ea', border: '1px solid #c3e6cb', borderRadius: '2px' }}></div>
                  <span>Correct</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: '500' }}>
                  <div style={{ width: '12px', height: '12px', background: '#fce8e6', border: '1px solid #f5c6cb', borderRadius: '2px' }}></div>
                  <span>Incorrect</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewPage;
