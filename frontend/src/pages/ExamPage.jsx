import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestions, submitResult } from '../api';
import { calculateScore } from '../utils/scoring';
import VirtualKeypad from '../components/VirtualKeypad';
import { ChevronLeft, ChevronRight, LayoutGrid, X, Clock } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';

const ExamPage = ({ user }) => {
  const isImageOption = (value) => {
    if (typeof value !== 'string') return false;
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    return extensions.some(ext => value.toLowerCase().endsWith(ext));
  };

  const getImagePath = (value) => {
    if (value.startsWith('/') || value.startsWith('http')) return value;
    return `/images/${value}`;
  };

  const { qpName } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestions(qpName);
        setQuestions(response.data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [qpName]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMCQSelect = (option) => {
    setAnswers({ ...answers, [questions[currentIndex].question_number]: option });
  };

  const handleMSQToggle = (option) => {
    const qNum = questions[currentIndex].question_number;
    const current = answers[qNum] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    setAnswers({ ...answers, [qNum]: updated });
  };

  const handleNATInput = (char) => {
    const qNum = questions[currentIndex].question_number;
    const current = answers[qNum] || '';
    if (char === '.' && current.includes('.')) return;
    if (char === '-' && current.length > 0) return;
    setAnswers({ ...answers, [qNum]: current + char });
  };

  const handleNATDelete = () => {
    const qNum = questions[currentIndex].question_number;
    const current = answers[qNum] || '';
    setAnswers({ ...answers, [qNum]: current.slice(0, -1) });
  };

  const handleNATClear = () => {
    const qNum = questions[currentIndex].question_number;
    setAnswers({ ...answers, [qNum]: '' });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    const scoringResult = calculateScore(questions, answers);
    const resultData = {
      user_email: user.email,
      qp_name: qpName,
      score: scoringResult.score,
      accuracy: scoringResult.accuracy,
      time_taken: (3 * 60 * 60) - timeLeft
    };

    try {
      await submitResult(resultData);
      navigate(`/result/${qpName}`, { state: { scoringResult, timeTaken: resultData.time_taken, questions, answers } });
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit results. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>Loading questions...</div>;
  if (questions.length === 0) return <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>No questions found.</div>;

  const currentQuestion = questions[currentIndex];
  const isAttempted = (qNum) => {
    const ans = answers[qNum];
    return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0);
  };

  return (
    <div className="exam-grid">
      <div className="exam-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {currentQuestion.question_type} • Section
            </div>
            <h1 style={{ fontSize: '3rem', lineHeight: '1', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              Q{currentQuestion.question_number}
              <div className="mobile-timer" style={{ display: 'none', fontSize: '1.25rem', padding: '0.5rem 1rem', background: '#f6f6f6', borderRadius: '4px', fontVariantNumeric: 'tabular-nums', fontWeight: '800' }}>
                {formatTime(timeLeft)}
              </div>
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="secondary mobile-palette-toggle" 
              style={{ display: 'none', padding: '0.875rem' }}
              onClick={() => setShowPalette(true)}
            >
              <LayoutGrid size={22} />
            </button>
            <button onClick={() => { if(confirm('Are you sure you want to submit?')) handleSubmit(); }} className="primary">
              <span className="desktop-only">Submit Assessment</span>
              <span className="mobile-only" style={{ display: 'none' }}>Submit</span>
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
            <div style={{ fontSize: '1.25rem', marginBottom: '2rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {currentQuestion.question_text.split(/(\$\$.*?\$\$|\$.*?\$)/g).map((part, i) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                  return <BlockMath key={i} math={part.slice(2, -2)} />;
                } else if (part.startsWith('$') && part.endsWith('$')) {
                  return <InlineMath key={i} math={part.slice(1, -1)} />;
                }
                return part;
              })}
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
              {(currentQuestion.question_type === 'MCQ' || currentQuestion.question_type === 'MSQ') && 
                Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = currentQuestion.question_type === 'MSQ'
                    ? (answers[currentQuestion.question_number] || []).includes(key)
                    : answers[currentQuestion.question_number] === key;
                  
                  return (
                    <button
                      key={key}
                      className="secondary"
                      onClick={() => currentQuestion.question_type === 'MSQ' ? handleMSQToggle(key) : handleMCQSelect(key)}
                      style={{ 
                        textAlign: 'left', 
                        display: 'flex', 
                        gap: '1.25rem', 
                        padding: '1.25rem',
                        background: isSelected ? '#000' : '#f6f6f6',
                        color: isSelected ? '#fff' : 'var(--text-main)',
                      }}
                    >
                      <span style={{ fontWeight: '800' }}>{key}.</span>
                      <span style={{ flex: 1 }}>
                        {isImageOption(value) ? (
                          <img 
                            src={getImagePath(value)} 
                            alt={`Option ${key}`} 
                            loading="lazy"
                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', background: '#fff', padding: '0.5rem', borderRadius: '4px' }} 
                          />
                        ) : (
                          value.split(/(\$.*?\$)/g).map((part, i) => {
                            if (part.startsWith('$') && part.endsWith('$')) {
                              return <InlineMath key={i} math={part.slice(1, -1)} />;
                            }
                            return part;
                          })
                        )}
                      </span>
                    </button>
                  );
                })}

              {currentQuestion.question_type === 'NAT' && (
                <div>
                  <div style={{ 
                    background: '#f6f6f6', 
                    padding: '1.5rem', 
                    borderRadius: '4px', 
                    fontSize: '2.5rem', 
                    minHeight: '4.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--primary)',
                    fontWeight: '800',
                    marginBottom: '2rem'
                  }}>
                    {answers[currentQuestion.question_number] || '_'}
                  </div>
                  <VirtualKeypad 
                    onInput={handleNATInput}
                    onDelete={handleNATDelete}
                    onClear={handleNATClear}
                  />
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
            
            <div className="desktop-timer" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '2rem', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em' }}>{formatTime(timeLeft)}</span>
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Remaining</p>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem', flex: 1, border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <h4 style={{ marginBottom: '2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Question Palette</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {questions.map((q, idx) => {
                  const attempted = isAttempted(q.question_number);
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
                        background: active ? '#000' : attempted ? '#eeeeee' : 'transparent',
                        color: active ? '#fff' : 'var(--text-main)',
                        border: active ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>
              
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: '500' }}>
                  <div style={{ width: '12px', height: '12px', background: '#eeeeee', border: '1px solid var(--border)', borderRadius: '2px' }}></div>
                  <span>Attempted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: '500' }}>
                  <div style={{ width: '12px', height: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px' }}></div>
                  <span>Unattempted</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPage;
