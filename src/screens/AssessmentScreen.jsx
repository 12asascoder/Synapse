/**
 * AssessmentScreen — Cognitive Assessment with timer, confidence slider
 * Clean ElevenLabs aesthetic
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

  const handleFinalSubmit = async (finalAnswers = answers) => {
    clearInterval(timerRef.current);
    const correct = finalAnswers.filter((a) => a.correct).length;
    const accuracy = Math.round((correct / questions.length) * 100);
    const avgConf = Math.round(finalAnswers.reduce((s, a) => s + a.confidence, 0) / (finalAnswers.length || 1));

    const scores = {
      knowledge: accuracy,
      accuracy,
      confidence: avgConf,
      retention: Math.round(accuracy * (avgConf / 100)),
      velocity: Math.round(Math.min(100, accuracy * 0.85 + 15)),
    };

    dispatch({ type: 'COMPLETE_ASSESSMENT', payload: { day: currentDay, scores } });

    if (state.user?.id) {
      try {
        await fetch(`${API}/assessments/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.user.id,
            day: currentDay,
            bootcamp: state.selectedBootcamp?.name || 'General',
            totalQuestions: questions.length,
            correctAnswers: correct,
            scores,
          }),
        });
        await fetch(`${API}/progress/${state.user.id}/assessment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledge: accuracy,
            accuracy,
            confidence: avgConf,
            retention: scores.retention,
            velocity: scores.velocity,
            technical: scores.accuracy,
            problemSolving: scores.accuracy,
            communication: avgConf,
            consistency: scores.retention,
          }),
        });
      } catch {}
    }

    setSubmitted(true);
    setTimeout(() => navigate('lesson-analytics'), 1200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDFCFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', fontSize: '14px' }}>
        Loading assessment module...
      </div>
    );
  }

  const q = questions[currentQ];
  const timePercent = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft < 300;

  return (
    <div style={{
      minHeight: '100vh', background: '#FDFCFC', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* TOP BAR */}
      <div style={{
        height: '64px', background: '#FFFFFF',
        borderBottom: '1px solid #E8E6E3',
        display: 'flex', alignItems: 'center', padding: '0 32px',
        justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {/* Left — title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 36, height: 36, background: '#000',
            borderRadius: '10px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>⊞</div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#A59F97', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SYNAPSE CORE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>Cognitive Assessment</div>
          </div>
        </div>

        {/* Center — Timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#A59F97', letterSpacing: '0.05em', marginBottom: '2px', textTransform: 'uppercase' }}>Time Remaining</div>
          <div style={{
            fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: isUrgent ? '#DC2626' : '#000',
            letterSpacing: '0.02em',
          }}>{formatTime(timeLeft)}</div>
        </div>

        {/* Right — System integrity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#A59F97', letterSpacing: '0.05em', textTransform: 'uppercase' }}>System Integrity</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { icon: '📷', active: true },
              { icon: '🎙', active: true },
              { icon: '🔒', active: true },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px',
                background: item.active ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${item.active ? '#A7F3D0' : '#FECACA'}`,
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.active ? '#10B981' : '#EF4444' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        {currentDay === 15 ? (
          <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #000', borderRadius: '24px', padding: '48px', boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ padding: '6px 16px', background: '#F5F3F1', border: '1px solid #E8E6E3', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#000', letterSpacing: '0.05em' }}>
                  MID-TERM PROGRAMMING ASSESSMENT
                </div>
              </div>
              <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', color: '#000' }}>
                Implement a distributed LoRA fine-tuning algorithm for a 7B parameter model.
              </h2>
              <div style={{ fontSize: '15px', color: '#6B6B6B', marginBottom: '40px', lineHeight: 1.6 }}>
                You have 45 minutes to implement the core algorithm. Your code will be evaluated on correctness, efficiency, and proper gradient scaling.
              </div>
              <div style={{ background: '#FDFCFC', padding: '24px', borderRadius: '16px', minHeight: '300px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#000', border: '1px solid #E8E6E3' }}>
                <span style={{ color: '#A59F97' }}>// Write your Python implementation here...</span>
                <br /><br />
                <span style={{ color: '#2563EB' }}>def</span> apply_lora(model, r=8, alpha=16):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#2563EB' }}>pass</span>
              </div>
              <button 
                onClick={() => navigate('milestone')}
                className="btn btn-primary"
                style={{ marginTop: '32px', padding: '14px 28px', fontSize: '14px', fontWeight: 600, borderRadius: '10px' }}
              >
                Run Test Suite
              </button>
            </div>
          </div>
        ) : currentDay === 30 ? (
          <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #000', borderRadius: '24px', padding: '48px', boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ padding: '6px 16px', background: '#F5F3F1', border: '1px solid #E8E6E3', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#000', letterSpacing: '0.05em' }}>
                  FINAL VALIDATION INTERVIEW
                </div>
              </div>
              <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', color: '#000' }}>
                    Live Technical Interview with Vishesh AI
                  </h2>
                  <div style={{ fontSize: '15px', color: '#6B6B6B', marginBottom: '40px', lineHeight: 1.6 }}>
                    This is your final assessment. You will engage in a live voice/text conversation where Vishesh will probe your architectural decisions, system design capabilities, and core ML fundamentals.
                  </div>
                  <button 
                    onClick={() => navigate('interview')}
                    className="btn btn-primary"
                    style={{ padding: '16px 32px', fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                  >
                    Start Interview
                  </button>
                </div>
                <div style={{ width: '240px', height: '240px', borderRadius: '50%', background: '#FDFCFC', border: '2px solid #E8E6E3', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-dot 3s infinite', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: '#F5F3F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '64px' }}>🎙</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Question card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '48px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.04)',
            animation: 'fadeInUp 0.4s ease both',
          }}>
            {/* Question header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{
                padding: '6px 16px',
                background: '#F5F3F1',
                borderRadius: '8px',
                fontSize: '12px', fontWeight: 700,
                color: '#44403B', letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Question {String(currentQ + 1).padStart(2, '0')} of {String(questions.length).padStart(2, '0')}</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: i < currentQ ? '#000' : i === currentQ ? '#44403B' : '#E8E6E3',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            </div>

            {/* Question text */}
            <h2 style={{
              fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700,
              lineHeight: 1.35, marginBottom: '40px', color: '#000',
            }}>{q.question}</h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {q.options.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    id={`assessment-opt-${opt.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '20px',
                      padding: '20px 24px',
                      background: isSelected ? '#FDFCFC' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#000' : '#E8E6E3'}`,
                      borderRadius: '16px', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#000'; } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#E8E6E3'; } }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                      background: isSelected ? '#000' : '#F5F3F1',
                      border: `1px solid ${isSelected ? '#000' : '#DCDCDC'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: 12, height: 12, borderRadius: '4px', background: '#FFFFFF' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#000' : '#A59F97', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        Option {opt.id}
                      </div>
                      <div style={{ fontSize: '16px', color: '#000', lineHeight: 1.5, fontWeight: 500 }}>{opt.text}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confidence Matrix */}
            <div style={{
              padding: '24px', background: '#FDFCFC',
              border: '1px solid #E8E6E3', borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#000', fontSize: '16px' }}>◎</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#000' }}>Confidence Matrix</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '18px', color: '#000' }}>{confidence}%</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '20px' }}>
                Calibrate your certainty for algorithmic weighting.
              </div>
              <input
                type="range"
                min="0" max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                id="assessment-confidence-slider"
                style={{ width: '100%', appearance: 'none', height: '6px', borderRadius: '3px', outline: 'none', background: `linear-gradient(90deg, #000 ${confidence}%, #E8E6E3 ${confidence}%)`, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#A59F97', fontWeight: 500 }}>Low Certainty (Guess)</span>
                <span style={{ fontSize: '12px', color: '#A59F97', fontWeight: 500 }}>High Certainty (Calculated)</span>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        height: '80px', background: '#FFFFFF',
        borderTop: '1px solid #E8E6E3',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <button
          onClick={() => { if (currentQ > 0) setCurrentQ((q) => q - 1); }}
          disabled={currentQ === 0}
          className="btn"
          id="assessment-prev-btn"
          style={{ gap: '10px', background: '#F5F3F1', border: '1px solid #E8E6E3', color: '#000', padding: '12px 20px', borderRadius: '10px', fontWeight: 600, opacity: currentQ === 0 ? 0.4 : 1 }}
        >
          ← Previous Question
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: 32, height: 4, borderRadius: '2px',
              background: i < answers.length ? '#000' : i === currentQ ? '#6B6B6B' : '#E8E6E3',
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
            gap: '10px',
            background: selected && !submitted ? '#000' : '#E8E6E3',
            color: selected && !submitted ? '#fff' : '#A59F97',
            cursor: selected && !submitted ? 'pointer' : 'not-allowed',
            minWidth: '220px', justifyContent: 'center',
            padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
            border: 'none'
          }}
        >
          {submitted ? '✓ Submitting...' : currentQ < questions.length - 1 ? 'Next Question →' : 'Submit for Validation →'}
        </button>
      </div>
    </div>
  );
}
