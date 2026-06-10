/**
 * AssessmentScreen — Cognitive Assessment with timer, confidence slider
 * Exact match to reference: SYNAPSE CORE header, QUESTION X OF 20, options, confidence matrix
 */
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AssessmentScreen() {
  const { state, dispatch, navigate } = useApp();
  const { selectedBootcamp, currentDay } = state;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confidence, setConfidence] = useState(75);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [totalTime] = useState(45 * 60); // 45 minutes
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/assessments/questions?limit=5`)
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options.map((text, i) => ({
            id: String.fromCharCode(65 + i),
            text,
          })),
          correct: String.fromCharCode(65 + q.correctAnswer),
          explanation: q.explanation,
        }));
        setQuestions(mapped.length > 0 ? mapped : []);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleFinalSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (!selected) return;
    const ans = { qId: questions[currentQ].id, selected, confidence, correct: selected === questions[currentQ].correct };
    setAnswers((p) => [...p, ans]);
    setSelected(null);
    setConfidence(75);
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      handleFinalSubmit([...answers, ans]);
    }
  };

  const handleFinalSubmit = (finalAnswers = answers) => {
    clearInterval(timerRef.current);
    const correct = finalAnswers.filter((a) => a.correct).length;
    const accuracy = Math.round((correct / questions.length) * 100);
    const avgConf = Math.round(finalAnswers.reduce((s, a) => s + a.confidence, 0) / (finalAnswers.length || 1));

    dispatch({
      type: 'COMPLETE_ASSESSMENT',
      payload: {
        day: currentDay,
        scores: {
          knowledge: accuracy,
          accuracy,
          confidence: avgConf,
          retention: Math.round(accuracy * (avgConf / 100)),
          velocity: Math.round(Math.min(100, accuracy * 0.85 + 15)),
        },
      },
    });
    setSubmitted(true);
    setTimeout(() => navigate('lesson-analytics'), 1200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '12px' }}>
        Loading assessment questions...
      </div>
    );
  }

  const q = questions[currentQ];
  const timePercent = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft < 300;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

      {/* TOP BAR — matches reference exactly */}
      <div style={{
        height: '60px', background: 'rgba(5,5,8,0.97)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', padding: '0 32px',
        justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {/* Left — title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 32, height: 32, background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.4)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
          }}>⊞</div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SYNAPSE CORE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Cognitive Assessment</div>
          </div>
        </div>

        {/* Center — Timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '2px' }}>TIME REMAINING</div>
          <div style={{
            fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: isUrgent ? 'var(--rose-400)' : 'var(--cyan-400)',
            letterSpacing: '0.04em',
            textShadow: isUrgent ? '0 0 16px rgba(244,63,94,0.5)' : '0 0 16px rgba(34,211,238,0.4)',
            animation: isUrgent ? 'pulse-dot 1s ease-in-out infinite' : 'none',
          }}>{formatTime(timeLeft)}</div>
        </div>

        {/* Right — System integrity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>SYSTEM INTEGRITY</div>
          {[
            { icon: '📷', active: true },
            { icon: '🎙', active: true },
            { icon: '🔒', active: true },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '5px 10px',
              background: item.active ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
              border: `1px solid ${item.active ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
              borderRadius: '6px',
            }}>
              <span style={{ fontSize: '12px' }}>{item.icon}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.active ? 'var(--emerald-400)' : 'var(--rose-400)', boxShadow: `0 0 6px ${item.active ? 'var(--emerald-400)' : 'var(--rose-400)'}` }} />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        {currentDay === 15 ? (
          <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ background: 'rgba(12,12,20,0.95)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '40px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ padding: '5px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-400)', letterSpacing: '0.1em' }}>
                  MID-TERM PROGRAMMING ASSESSMENT
                </div>
              </div>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '20px' }}>
                Implement a distributed LoRA fine-tuning algorithm for a 7B parameter model.
              </h2>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                You have 45 minutes to implement the core algorithm. Your code will be evaluated on correctness, efficiency, and proper gradient scaling.
              </div>
              <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', minHeight: '300px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#d4d4d4', border: '1px solid #333' }}>
                // Write your Python implementation here...
                <br /><br />
                def apply_lora(model, r=8, alpha=16):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;pass
              </div>
              {/* For mock purposes, just allow setting 'selected' to true when they click a fake 'Run Tests' button */}
              <button 
                onClick={() => setSelected(true)}
                style={{ marginTop: '24px', padding: '12px 24px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', color: 'var(--emerald-400)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                Run Test Suite
              </button>
            </div>
          </div>
        ) : currentDay === 30 ? (
          <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ background: 'rgba(12,12,20,0.95)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '40px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ padding: '5px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber-400)', letterSpacing: '0.1em' }}>
                  FINAL VALIDATION INTERVIEW
                </div>
              </div>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '20px' }}>
                    Live Technical Interview with Vishesh AI
                  </h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                    This is your final assessment. You will engage in a live voice/text conversation where Vishesh will probe your architectural decisions, system design capabilities, and core ML fundamentals.
                  </div>
                  <button 
                    onClick={() => setSelected(true)}
                    style={{ padding: '12px 24px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', color: 'var(--amber-400)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
                  >
                    Start Interview
                  </button>
                </div>
                <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber-500), var(--rose-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(245,158,11,0.2)', animation: 'pulse-dot 3s infinite' }}>
                  <span style={{ fontSize: '48px' }}>🎙</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '740px' }}>
          {/* Question card */}
          <div style={{
            background: 'rgba(12,12,20,0.95)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px', padding: '40px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.4s ease both',
          }}>
            {/* Question header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{
                padding: '5px 14px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '6px',
                fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: '0.1em',
              }}>QUESTION {String(currentQ + 1).padStart(2, '0')} OF {String(questions.length).padStart(2, '0')}</div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < currentQ ? 'var(--emerald-500)' : i === currentQ ? 'var(--violet-400)' : 'rgba(139,92,246,0.2)',
                    boxShadow: i === currentQ ? '0 0 8px var(--violet-400)' : 'none',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            </div>

            {/* Question text */}
            <h2 style={{
              fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800,
              lineHeight: 1.35, marginBottom: '32px', color: 'var(--text-primary)',
            }}>{q.question}</h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {q.options.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    id={`assessment-opt-${opt.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px 20px',
                      background: isSelected ? 'rgba(6,182,212,0.1)' : 'rgba(14,14,22,0.6)',
                      border: `1px solid ${isSelected ? 'rgba(6,182,212,0.5)' : 'rgba(139,92,246,0.12)'}`,
                      borderRadius: '10px', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      transform: isSelected ? 'scale(1.005)' : 'none',
                      boxShadow: isSelected ? '0 0 16px rgba(6,182,212,0.15)' : 'none',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'rgba(14,14,22,0.6)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'; } }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '4px', flexShrink: 0,
                      background: isSelected ? 'rgba(6,182,212,0.3)' : 'rgba(139,92,246,0.08)',
                      border: `1px solid ${isSelected ? 'rgba(6,182,212,0.6)' : 'rgba(139,92,246,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--cyan-400)', boxShadow: '0 0 6px var(--cyan-400)' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isSelected ? 'var(--cyan-400)' : 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.06em' }}>
                        Option {opt.id}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{opt.text}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confidence Matrix */}
            <div style={{
              padding: '20px', background: 'rgba(10,10,18,0.6)',
              border: '1px solid rgba(139,92,246,0.12)', borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--violet-400)', fontSize: '14px' }}>◎</span>
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Confidence Matrix</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: confidence > 70 ? 'var(--emerald-400)' : confidence > 40 ? 'var(--amber-400)' : 'var(--rose-400)' }}>{confidence}%</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                Calibrate your certainty for algorithmic weighting.
              </div>
              <input
                type="range"
                min="0" max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                id="assessment-confidence-slider"
                style={{ width: '100%', appearance: 'none', height: '4px', borderRadius: '2px', outline: 'none', background: `linear-gradient(90deg, var(--violet-500) ${confidence}%, rgba(139,92,246,0.15) ${confidence}%)`, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Low Certainty (Guess)</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>High Certainty (Calculated)</span>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV — matches reference */}
      <div style={{
        height: '72px', background: 'rgba(5,5,8,0.97)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <button
          onClick={() => { if (currentQ > 0) setCurrentQ((q) => q - 1); }}
          disabled={currentQ === 0}
          className="btn btn-secondary"
          id="assessment-prev-btn"
          style={{ gap: '10px', fontFamily: 'var(--font-mono)', opacity: currentQ === 0 ? 0.4 : 1 }}
        >
          ← Previous Node
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: 28, height: 3, borderRadius: '2px',
              background: i < answers.length ? 'var(--emerald-500)' : i === currentQ ? 'var(--violet-400)' : 'rgba(139,92,246,0.2)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <button
          onClick={currentQ < questions.length - 1 ? handleNext : () => handleFinalSubmit()}
          disabled={!selected || submitted}
          className="btn btn-primary"
          id="assessment-submit-btn"
          style={{
            gap: '10px', fontFamily: 'var(--font-mono)',
            background: selected && !submitted ? 'linear-gradient(135deg, var(--violet-600), var(--violet-500))' : 'rgba(124,58,237,0.3)',
            boxShadow: selected ? '0 6px 28px rgba(124,58,237,0.4)' : 'none',
            cursor: selected && !submitted ? 'pointer' : 'not-allowed',
            minWidth: '200px', justifyContent: 'center',
          }}
        >
          {submitted ? '✓ Submitting...' : currentQ < questions.length - 1 ? 'Next Node →' : 'Submit for Validation →'}
        </button>
      </div>
    </div>
  );
}
