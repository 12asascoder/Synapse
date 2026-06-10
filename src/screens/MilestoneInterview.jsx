/**
 * MilestoneInterview — Oral Validation / AI Interview
 * Live two-way communication UI with proctoring active
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamVisheshResponse } from '../lib/vishesh';

export default function MilestoneInterview() {
  const { state, dispatch, navigate } = useApp();
  const { currentDay } = state;
  const isFinal = currentDay >= 30;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to your ${isFinal ? 'Day 30 Final' : 'Day 15 Milestone'} Oral Validation. I will be evaluating your technical reasoning. Let's begin with your first question.`,
      id: 'init-1',
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 min interview
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); finishInterview(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    setMessages((p) => [...p, { role: 'user', content: text, id: Date.now().toString() }]);
    setIsThinking(true);

    const aId = `a-${Date.now()}`;
    setMessages((p) => [...p, { role: 'assistant', content: '', id: aId, streaming: true }]);
    setIsThinking(false);
    setIsStreaming(true);

    abortRef.current = new AbortController();
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    await streamVisheshResponse({
      userMessage: text,
      history,
      context: `You are conducting an oral validation technical interview for a software engineering bootcamp. Grade responses strictly. Ask follow up questions.`,

      abortController: abortRef.current,
      onToken: (_, full) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: full } : m));
      },
      onDone: (full) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: full, streaming: false } : m));
        setIsStreaming(false);
      },
      onError: (err) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: err, streaming: false } : m));
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages]);

  const finishInterview = () => {
    const totalMessages = messages.filter((m) => m.role === 'user').length;
    const qualityScore = Math.min(100, 60 + totalMessages * 5);
    dispatch({
      type: 'COMPLETE_ASSESSMENT',
      payload: {
        day: currentDay,
        scores: {
          knowledge: qualityScore,
          accuracy: qualityScore - 5,
          confidence: qualityScore - 3,
          communication: Math.min(100, qualityScore + 2),
          problemSolving: qualityScore - 2,
        },
      },
    });
    navigate('lesson-analytics');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      
      {/* LEFT — User Camera / Integrity Feed */}
      <div style={{ width: '320px', background: 'rgba(8,8,14,0.98)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>🔒 PROCTORING ACTIVE</div>
          <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Interview</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{isFinal ? 'Day 30 Final Validation' : 'Day 15 Milestone'}</div>
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{
            height: '240px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(6,182,212,0.4)', position: 'relative', overflow: 'hidden',
            marginBottom: '20px',
          }}>
             <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(5,5,10,0.8)', padding: '4px 8px', borderRadius: '6px' }}>
                <div className="dot-live" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: '9px', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>LIVE</span>
             </div>
             <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>Operative Feed</div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(10,10,18,0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '12px' }}>TELEMETRY</div>
            {[
              { l: 'Gaze Tracking', v: 'Stable', c: 'var(--emerald-400)' },
              { l: 'Audio Environment', v: 'Clear', c: 'var(--emerald-400)' },
              { l: 'Window Focus', v: 'Locked', c: 'var(--cyan-400)' },
            ].map(t => (
              <div key={t.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.l}</span>
                <span style={{ color: t.c, fontWeight: 700 }}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '8px' }}>REMAINING TIME</div>
          <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: timeLeft < 180 ? 'var(--rose-400)' : 'var(--cyan-400)' }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* RIGHT — AI Interviewer Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ height: '64px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 32px', background: 'rgba(10,10,15,0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="vishesh-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>V</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Vishesh AI</div>
              <div style={{ fontSize: '11px', color: 'var(--violet-400)', fontFamily: 'var(--font-mono)' }}>Chief Evaluator</div>
            </div>
          </div>
          <button onClick={finishInterview} style={{ marginLeft: 'auto', padding: '8px 16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '6px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>End Validation</button>
        </div>

        {/* Chat Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="scroll-area">
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px', animation: 'fadeInUp 0.3s ease both' }}>
              {msg.role === 'assistant' && (
                 <div className="vishesh-avatar" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>V</div>
              )}
              <div style={{
                background: msg.role === 'assistant' ? 'transparent' : 'rgba(124,58,237,0.15)',
                border: msg.role === 'assistant' ? 'none' : '1px solid rgba(124,58,237,0.3)',
                padding: msg.role === 'assistant' ? '0' : '16px 20px',
                borderRadius: msg.role === 'assistant' ? '0' : '8px 16px 16px 16px',
                fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)',
              }}>
                {msg.content}
                {msg.streaming && <span style={{ display: 'inline-block', width: '2px', height: '15px', background: 'var(--violet-400)', marginLeft: '4px', animation: 'pulse-dot 0.7s infinite' }} />}
              </div>
            </div>
          ))}
          {isThinking && (
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="vishesh-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>V</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[0,1,2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet-400)', animation: `pulse-dot 1s infinite ${i*0.2}s` }} />)}
                </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Voice / Text Input */}
        <div style={{ padding: '24px 32px', background: 'rgba(8,8,14,0.9)', borderTop: '1px solid var(--border-subtle)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: 'var(--emerald-400)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>🎙</button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                disabled={isStreaming}
                placeholder="Type or speak your response..."
                style={{ flex: 1, padding: '16px 20px', background: 'rgba(14,14,22,0.8)', border: '1px solid var(--border-default)', borderRadius: '12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '14px', outline: 'none' }}
              />
              <button 
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                style={{ width: 48, height: 48, borderRadius: '12px', background: input.trim() ? 'linear-gradient(135deg, var(--violet-600), var(--violet-500))' : 'rgba(124,58,237,0.2)', border: 'none', color: 'white', fontSize: '18px', cursor: input.trim() ? 'pointer' : 'default' }}
              >▷</button>
           </div>
        </div>
      </div>
    </div>
  );
}
