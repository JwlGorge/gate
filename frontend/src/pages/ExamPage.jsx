import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestions, submitResult } from '../api';
import { calculateScore } from '../utils/scoring';
import VirtualKeypad from '../components/VirtualKeypad';
import { ChevronLeft, ChevronRight, Send, Clock, AlertCircle } from 'lucide-react';
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
    // Basic validation for numbers
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
      // Pass the results to the result page via state
      navigate(`/result/${qpName}`, { state: { scoringResult, timeTaken: resultData.time_taken, questions, answers } });
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit results. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container">Loading questions...</div>;
  if (questions.length === 0) return <div className="container">No questions found.</div>;

  const currentQuestion = questions[currentIndex];
  const isAttempted = (qNum) => {
    const ans = answers[qNum];
    return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0);
  };

  return (
    <div className="exam-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', height: '100vh', background: 'var(--bg-dark)' }}>
      {/* Main content area */}
      <div style={{ padding: '3rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.25rem' }}>Question {currentQuestion.question_number}</span>
            <span style={{ fontSize: '0.9rem' }}>/ {questions.length}</span>
            <span style={{ marginLeft: '1.5rem', padding: '0.4rem 0.8rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {currentQuestion.question_type}
            </span>
          </div>
          <button onClick={() => { if(confirm('Are you sure you want to submit?')) handleSubmit(); }} className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} /> Submit Exam
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
            <div style={{ fontSize: '1.25rem', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
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

            {currentQuestion.question_type === 'MCQ' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button
                    key={key}
                    className="secondary"
                    onClick={() => handleMCQSelect(key)}
                    style={{ 
                      textAlign: 'left', 
                      display: 'flex', 
                      gap: '1rem', 
                      borderColor: answers[currentQuestion.question_number] === key ? 'var(--primary)' : 'var(--border)',
                      background: answers[currentQuestion.question_number] === key ? '#111111' : 'transparent',
                      color: answers[currentQuestion.question_number] === key ? '#ffffff' : 'var(--text-main)'
                    }}
                  >
                    <span style={{ fontWeight: '700', color: answers[currentQuestion.question_number] === key ? '#ffffff' : 'var(--primary)' }}>{key}.</span>
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
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'MSQ' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select one or more correct options</p>
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = (answers[currentQuestion.question_number] || []).includes(key);
                  return (
                    <button
                      key={key}
                      className="secondary"
                      onClick={() => handleMSQToggle(key)}
                      style={{ 
                        textAlign: 'left', 
                        display: 'flex', 
                        gap: '1rem', 
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        background: isSelected ? '#111111' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-main)'
                      }}
                    >
                      <span style={{ 
                        width: '18px', 
                        height: '18px', 
                        border: '1px solid', 
                        borderColor: isSelected ? '#ffffff' : 'var(--text-muted)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}>
                        {isSelected && '✓'}
                      </span>
                      <span style={{ fontWeight: '700', color: isSelected ? '#ffffff' : 'var(--primary)' }}>{key}.</span>
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
              </div>
            )}

            {currentQuestion.question_type === 'NAT' && (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter the numerical value using the virtual keypad</p>
                <div style={{ 
                  background: 'var(--bg-dark)', 
                  padding: '1.5rem', 
                  borderRadius: '8px', 
                  fontSize: '2rem', 
                  minHeight: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  border: '1px solid var(--border)'
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
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button 
            className="secondary" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <button 
            className="secondary" 
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: timeLeft < 300 ? 'var(--error)' : 'var(--text-main)', marginBottom: '0.5rem' }}>
            <Clock size={20} />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time Remaining</p>
        </div>

        <div className="card" style={{ padding: '1.5rem', flex: 1 }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Question Palette</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
            {questions.map((q, idx) => {
              const attempted = isAttempted(q.question_number);
              const active = idx === currentIndex;
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
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    background: active ? 'var(--primary)' : attempted ? '#333333' : 'var(--card-bg)',
                    color: active || attempted ? 'white' : 'var(--text-muted)',
                    border: active ? 'none' : '1px solid var(--border)',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#333333', borderRadius: '2px' }}></div>
              <span>Attempted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '2px' }}></div>
              <span>Unattempted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
