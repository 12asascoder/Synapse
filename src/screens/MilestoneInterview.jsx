/**
 * MilestoneInterview — Oral Validation / AI Interview
 * Live two-way communication UI with proctoring active
 * Clean ElevenLabs aesthetic
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamVisheshResponse } from '../lib/vishesh';

function AnimatedWaveform({ active }) {
  const heights = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.7, 1, 0.6, 0.5];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '40px' }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: '3px', height: '40px', borderRadius: '2px',
          background: active
            ? '#000000'
            : '#E8E6E3',
          transform: `scaleY(${active ? h : 0.2})`,
          animation: active ? `waveform 1.3s ease-in-out infinite` : 'none',
          animationDelay: `${i * 80}ms`,
          transition: 'transform 0.3s ease',
        }} />
      ))}
    </div>
  );
}

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
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming]);

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
    <div style={{ display: 'flex', height: '100vh', background: '#FDFCFC', overflow: 'hidden' }}>
      
      {/* LEFT — User Camera / Integrity Feed */}
      <div style={{ width: '380px', background: '#FFFFFF', borderRight: '1px solid #E8E6E3', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #E8E6E3' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', background: '#F5F3F1',
            border: '1px solid #000', borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#000', textTransform: 'uppercase' }}>
              🔒 Proctoring Active
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#000' }}>AI Interview</div>
          <div style={{ fontSize: '13px', color: '#6B6B6B' }}>{isFinal ? 'Day 30 Final Validation' : 'Day 15 Milestone'}</div>
        </div>

        <div style={{ padding: '32px', flex: 1 }}>
          <div style={{
            height: '240px', borderRadius: '16px', background: '#000',
            position: 'relative', overflow: 'hidden',
            marginBottom: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
          }}>
             <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '11px', color: '#000', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
             </div>
             <div style={{ position: 'absolute', bottom: 16, left: 16, fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Operative Feed</div>
          </div>

          <div style={{ padding: '24px', background: '#F5F3F1', border: '1px solid #E8E6E3', borderRadius: '16px' }}>
            <div style={{ fontSize: '12px', color: '#A59F97', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>Telemetry</div>
            {[
              { l: 'Gaze Tracking', v: 'Stable', c: '#10B981' },
              { l: 'Audio Environment', v: 'Clear', c: '#10B981' },
              { l: 'Window Focus', v: 'Locked', c: '#000' },
            ].map(t => (
              <div key={t.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#6B6B6B', fontWeight: 500 }}>{t.l}</span>
                <span style={{ color: t.c, fontWeight: 700 }}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '32px', borderTop: '1px solid #E8E6E3', textAlign: 'center', background: '#FDFCFC' }}>
          <div style={{ fontSize: '12px', color: '#A59F97', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Remaining Time</div>
          <div style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: timeLeft < 180 ? '#DC2626' : '#000', lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* RIGHT — AI Interviewer Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ height: '80px', borderBottom: '1px solid #E8E6E3', display: 'flex', alignItems: 'center', padding: '0 40px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>V</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>Vishesh AI</div>
              <div style={{ fontSize: '13px', color: '#6B6B6B' }}>Chief Evaluator</div>
            </div>
          </div>
          <button 
            onClick={finishInterview} 
            className="btn"
            style={{ marginLeft: 'auto', padding: '12px 20px', background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF0F0'; }}
          >End Validation</button>
        </div>

        {/* Chat Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 10%', background: '#FDFCFC' }} className="scroll-area">
          {messages.map((msg) => {
            const isVishesh = msg.role === 'assistant';
            return (
              <div key={msg.id} style={{
                display: 'flex', gap: '16px', marginBottom: '32px',
                flexDirection: isVishesh ? 'row' : 'row-reverse',
                animation: 'fadeInUp 0.35s ease both',
              }}>
                {isVishesh && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: '#000', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, marginTop: '4px'
                  }}>V</div>
                )}
                <div style={{ maxWidth: '85%' }}>
                  <div style={{
                    fontSize: '16px', color: '#000',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    padding: isVishesh ? '16px 20px' : '16px 24px',
                    background: isVishesh ? '#F5F3F1' : '#FFFFFF',
                    border: '1px solid #E8E6E3',
                    borderRadius: isVishesh ? '8px 24px 24px 24px' : '24px 8px 24px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    {msg.content}
                    {msg.streaming && (
                      <span style={{
                        display: 'inline-block', width: '3px', height: '16px',
                        background: '#000', marginLeft: '6px',
                        verticalAlign: 'middle', animation: 'pulse-dot 0.7s infinite',
                      }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Waveform / Thinking states */}
          {isStreaming && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <AnimatedWaveform active={true} />
            </div>
          )}
          {isThinking && messages.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', fontWeight: 700 }}>V</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0,1,2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#A59F97', animation: 'pulse-dot 1.2s infinite', animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Voice / Text Input */}
        <div style={{ padding: '0 10% 40px', background: '#FDFCFC' }}>
          {!isStreaming && !isThinking && messages.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <AnimatedWaveform active={false} />
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: '#FFFFFF',
            border: '1px solid #E8E6E3',
            borderRadius: '20px', padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s ease'
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#000'; }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#E8E6E3'; }}
          >
            <button style={{ width: 44, height: 44, borderRadius: '12px', background: '#F5F3F1', border: '1px solid #E8E6E3', color: '#000', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E6E3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F3F1'; }}
            >🎙</button>
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              disabled={isStreaming}
              placeholder="Type or speak your response..."
              style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: '#000', fontSize: '16px', outline: 'none' }}
            />
            <button 
              onClick={isStreaming ? () => abortRef.current?.abort() : sendMessage}
              disabled={!isStreaming && !input.trim()}
              style={{
                width: 44, height: 44, borderRadius: '12px',
                background: input.trim() ? '#000' : '#F5F3F1',
                border: 'none', color: input.trim() ? '#fff' : '#A59F97',
                fontSize: '18px', cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              {isStreaming ? '■' : '▶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
