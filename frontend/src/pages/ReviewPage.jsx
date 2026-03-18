import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
  const { questions, answers } = location.state || { questions: [], answers: {} };
  
  const [currentIndex, setCurrentIndex] = useState(0);

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
  const correctAnswer = currentQuestion.answer;

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
    <div className="exam-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', height: '100vh', background: 'var(--bg-dark)' }}>
      <div style={{ padding: '3rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.25rem' }}>Review Question {currentQuestion.question_number}</span>
            <span style={{ fontSize: '0.9rem' }}>/ {questions.length}</span>
          </div>
          <button onClick={() => navigate('/select')} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={16} /> Exit Review
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
            style={{ minHeight: '300px' }}
          >
            <div style={{ fontSize: '1.25rem', marginBottom: '2.5rem', whiteSpace: 'pre-wrap' }}>
              {renderMathText(currentQuestion.question_text)}
            </div>

            {currentQuestion.image && (
              <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center', background: '#fff', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <img 
                  src={currentQuestion.image} 
                  alt={`Question ${currentQuestion.question_number}`} 
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
                  
                  let borderColor = 'var(--border)';
                  let background = 'transparent';
                  let color = 'var(--text-main)';

                  if (isCorrectOption) {
                    borderColor = '#000000';
                    background = '#f0f0f0';
                  }
                  if (isUserSelection && !isCorrectOption) {
                    borderColor = '#ff0000';
                  }

                  return (
                    <div
                      key={key}
                      style={{ 
                        padding: '1rem 1.5rem',
                        border: '1px solid',
                        borderRadius: '4px',
                        display: 'flex', 
                        gap: '1rem', 
                        borderColor: borderColor,
                        background: background,
                        color: color,
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontWeight: '700' }}>{key}.</span>
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
                      {isCorrectOption && <CheckCircle2 size={18} style={{ color: '#000000' }} />}
                      {isUserSelection && !isCorrectOption && <XCircle size={18} style={{ color: '#ff0000' }} />}
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Your Answer</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userAnswer || 'Not Attempted'}</div>
                  </div>
                  <div style={{ padding: '1.5rem', border: '1px solid #000000', borderRadius: '4px', background: '#f0f0f0' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Correct Answer Range</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{currentQuestion.answer}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button 
            className="secondary" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <button 
            className="secondary" 
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Review Palette</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
            {questions.map((q, idx) => {
              const correct = isCorrect(q);
              const attempted = answers[q.question_number] !== undefined;
              const active = idx === currentIndex;
              
              let bg = 'var(--card-bg)';
              let color = 'var(--text-muted)';
              let border = '1px solid var(--border)';

              if (attempted) {
                bg = correct ? '#000000' : '#ffffff';
                color = correct ? '#ffffff' : '#000000';
                border = '1px solid #000000';
              }
              if (active) {
                border = '2px solid #000000';
              }

              return (
                <button
                  key={q.question_number}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '0',
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    background: bg,
                    color: color,
                    border: border,
                    fontWeight: active ? '800' : '500'
                  }}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#000000', borderRadius: '2px' }}></div>
              <span>Correct</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#ffffff', border: '1px solid #000000', borderRadius: '2px' }}></div>
              <span>Incorrect / Partially Correct</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
