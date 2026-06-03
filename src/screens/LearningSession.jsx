/**
 * LearningSession — AI-powered lesson screen
 * Exact match to reference: chat center, video panel top-right, curriculum sidebar right,
 * left sidebar with Neural Progress, LIVE ANALYSIS bar at top
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { streamVisheshResponse } from '../lib/vishesh';

const CURRICULUM = [
  { day: 1, topic: 'Neural Foundations', status: 'complete' },
  { day: 14, topic: 'Optimization Strategies', status: 'active', sublabel: 'Active Session · LORA focus' },
  { day: 15, topic: 'Milestone Assessment', status: 'locked', sublabel: 'Phase 1 Final Validation' },
  { day: 22, topic: 'Deployment & Scale', status: 'pending' },
  { day: 30, topic: 'Final Validation', status: 'locked', sublabel: 'Certification Day' },
];

function AnimatedWaveform({ active }) {
  const heights = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.7, 1, 0.6, 0.5];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '40px' }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: '3px', height: '40px', borderRadius: '2px',
          background: active
            ? 'linear-gradient(180deg, var(--cyan-400), var(--violet-500))'
            : 'rgba(139,92,246,0.25)',
          transform: `scaleY(${active ? h : 0.2})`,
          animation: active ? `waveform 1.3s ease-in-out infinite` : 'none',
          animationDelay: `${i * 80}ms`,
          transition: 'transform 0.3s ease',
        }} />
      ))}
    </div>
  );
}

export default function LearningSession() {
  const { state, dispatch, navigate } = useApp();
  const { selectedBootcamp, currentDay, ollamaOnline, ollamaModel } = state;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Tell me about a time you had to customize a large model for a specific use case. What approach did you take?`,
      id: 'init-1',
    },
    {
      role: 'user',
      content: `We looked at a few options but landed on LoRA — it was the right balance for what we needed.`,
      id: 'init-2',
    },
    {
      role: 'assistant',
      content: `Walk me through that. Can you sketch out on the whiteboar_`,
      id: 'init-3',
      streaming: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(() => `0x${Math.random().toString(16).slice(2, 8).toUpperCase()}-${Math.random().toString(16).slice(2, 4).toUpperCase()}`);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const userMsg = { role: 'user', content: text, id: Date.now().toString() };
    setMessages((p) => [...p, userMsg]);
    setIsThinking(true);

    const aId = `a-${Date.now()}`;
    setMessages((p) => [...p, { role: 'assistant', content: '', id: aId, streaming: true }]);
    setIsThinking(false);
    setIsStreaming(true);

    abortRef.current = new AbortController();
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    await streamVisheshResponse({
      userMessage: text,
      history,
      context: `${selectedBootcamp?.name || 'AI Engineering'} — Day ${currentDay} — Optimization Strategies`,
      model: ollamaModel,
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
  }, [input, isStreaming, messages, selectedBootcamp, currentDay, ollamaModel]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const completeLesson = () => {
    dispatch({ type: 'COMPLETE_LESSON', payload: currentDay });
    navigate('assessment');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP NAV — matches reference exactly */}
        <nav style={{
          height: '52px', background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          gap: '0', flexShrink: 0, position: 'relative', zIndex: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', marginRight: '32px', letterSpacing: '-0.02em' }}>
            SYNAPSE
          </div>
          {['Curriculum', 'Network', 'Simulations'].map((item, i) => (
            <button key={item} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0 16px', height: '100%',
              borderBottom: i === 0 ? '2px solid var(--violet-500)' : '2px solid transparent',
              fontWeight: i === 0 ? 600 : 400,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >{item}</button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '4px 8px' }}>⊡</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '4px 8px' }}>🔔</button>
            <button
              onClick={completeLesson}
              id="lesson-neural-link-btn"
              style={{
                padding: '8px 20px',
                background: 'linear-gradient(135deg, var(--violet-600), var(--violet-500))',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                color: 'white', letterSpacing: '0.04em',
                boxShadow: '0 0 16px rgba(124,58,237,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.4)'; }}
            >Launch Neural Link</button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer',
            }}>👤</div>
          </div>
        </nav>

        {/* LIVE ANALYSIS BAR */}
        <div style={{
          height: '44px', background: 'rgba(8,8,14,0.9)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="dot-live" />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-400)', letterSpacing: '0.1em' }}>LIVE ANALYSIS</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'var(--border-default)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Session ID: {sessionId}
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
              padding: '4px 12px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: '4px', color: 'var(--violet-300)', letterSpacing: '0.1em',
            }}>NEURAL LINK ACTIVE</span>
          </div>
        </div>

        {/* CONTENT ROW */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* CENTER — Chat */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid var(--border-subtle)',
          }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }} className="scroll-area">
              {messages.map((msg) => {
                const isVishesh = msg.role === 'assistant';
                return (
                  <div key={msg.id} style={{
                    display: 'flex', gap: '14px', marginBottom: '24px',
                    flexDirection: isVishesh ? 'row' : 'row',
                    animation: 'fadeInUp 0.35s ease both',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: isVishesh
                        ? 'linear-gradient(135deg, var(--violet-700), var(--violet-500))'
                        : 'rgba(255,255,255,0.1)',
                      border: `1px solid ${isVishesh ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      boxShadow: isVishesh ? '0 0 10px rgba(124,58,237,0.3)' : 'none',
                    }}>
                      {isVishesh ? '◈' : ''}
                    </div>

                    <div style={{ maxWidth: '78%' }}>
                      <div style={{
                        fontSize: '14px', color: 'var(--text-primary)',
                        lineHeight: 1.7, whiteSpace: 'pre-wrap',
                        padding: isVishesh ? '0' : '12px 16px',
                        background: isVishesh ? 'transparent' : 'rgba(124,58,237,0.12)',
                        border: isVishesh ? 'none' : '1px solid rgba(124,58,237,0.2)',
                        borderRadius: isVishesh ? '0' : '4px 14px 14px 14px',
                      }}>
                        {msg.content}
                        {msg.streaming && (
                          <span style={{
                            display: 'inline-block', width: '2px', height: '15px',
                            background: 'var(--violet-400)', marginLeft: '2px',
                            verticalAlign: 'middle',
                            animation: 'pulse-dot 0.7s ease-in-out infinite',
                          }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Waveform when AI is streaming */}
              {isStreaming && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px', animation: 'fadeIn 0.3s ease' }}>
                  <AnimatedWaveform active={true} />
                </div>
              )}
              {isThinking && (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 0 10px rgba(124,58,237,0.3)' }}>◈</div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet-400)', animation: 'pulse-dot 1.2s ease-in-out infinite', animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Waveform idle indicator */}
            {!isStreaming && !isThinking && (
              <div style={{ padding: '0 32px 8px', display: 'flex', justifyContent: 'center' }}>
                <AnimatedWaveform active={false} />
              </div>
            )}

            {/* INPUT BAR — exact reference match */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '16px 24px',
              background: 'rgba(8,8,14,0.9)',
            }}>
              {!ollamaOnline && (
                <div style={{ marginBottom: '10px', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '11px', color: 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>
                  ⚡ Start Ollama locally to activate Vishesh AI
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(14,14,22,0.8)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px', padding: '4px 12px 4px 4px',
                transition: 'border-color 0.2s ease',
              }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                <button style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
                  cursor: 'pointer', color: 'var(--violet-300)', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>+</button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Vishesh anything..."
                  rows={1}
                  disabled={isStreaming}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px',
                    resize: 'none', maxHeight: '100px', overflow: 'auto',
                    lineHeight: 1.5, padding: '8px 0',
                  }}
                />
                <button
                  onClick={() => {}}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '4px', flexShrink: 0 }}
                  aria-label="Voice input"
                >🎙</button>
                <button
                  onClick={isStreaming ? () => abortRef.current?.abort() : sendMessage}
                  id="lesson-send-btn"
                  style={{
                    width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                    background: input.trim() || isStreaming ? 'linear-gradient(135deg, var(--violet-600), var(--violet-500))' : 'rgba(139,92,246,0.1)',
                    border: 'none', cursor: 'pointer', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Send message"
                >
                  {isStreaming ? '■' : '▷'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Video + Curriculum */}
          <div style={{
            width: '260px', display: 'flex', flexDirection: 'column',
            background: 'rgba(8,8,14,0.8)', flexShrink: 0,
          }}>
            {/* Vishesh Video Panel */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                height: '160px',
                background: 'linear-gradient(135deg, #0f1523, #1a1535)',
                position: 'relative', overflow: 'hidden',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Futuristic avatar/person placeholder */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(124,58,237,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--violet-700), var(--cyan-500))',
                    border: '2px solid rgba(34,211,238,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', boxShadow: '0 0 24px rgba(34,211,238,0.3)',
                    animation: 'glow-pulse 3s ease-in-out infinite',
                  }}>V</div>
                </div>

                {/* Label overlay */}
                <div style={{
                  position: 'absolute', bottom: '10px', left: '10px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(5,5,10,0.85)', borderRadius: '6px',
                  padding: '4px 10px', backdropFilter: 'blur(8px)',
                }}>
                  <div className="dot-live" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-400)', letterSpacing: '0.08em' }}>
                    VISHESH AI · EXPLORING LORA
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <button style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px' }}>⊡</button>
                  <button style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px' }}>🎙</button>
                </div>
              </div>
            </div>

            {/* Curriculum section */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scroll-area">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)' }}>Curriculum</span>
                <span style={{
                  fontSize: '9px', fontFamily: 'var(--font-mono)', padding: '3px 8px',
                  background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)',
                  borderRadius: '4px', color: 'var(--violet-300)', fontWeight: 700,
                }}>Phase 1</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {CURRICULUM.map((item) => {
                  const isActive = item.status === 'active';
                  const isComplete = item.status === 'complete';
                  const isLocked = item.status === 'locked';
                  return (
                    <div key={item.day} style={{
                      padding: '10px 12px',
                      background: isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                      borderRadius: '8px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isLocked ? 0.5 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '5px', flexShrink: 0,
                          background: isActive ? 'rgba(124,58,237,0.4)' : isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.08)',
                          border: `1px solid ${isActive ? 'rgba(124,58,237,0.6)' : isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.15)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                          color: isActive ? 'var(--violet-300)' : isComplete ? 'var(--emerald-400)' : 'var(--text-muted)',
                        }}>
                          {isComplete ? '✓' : item.day}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
                            color: isActive ? 'var(--violet-300)' : isComplete ? 'var(--text-muted)' : 'var(--text-muted)',
                            lineHeight: 1.3,
                          }}>{item.topic}</div>
                          {item.sublabel && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              {item.sublabel}
                            </div>
                          )}
                          {isComplete && <div style={{ fontSize: '10px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>Completed · 100%</div>}
                        </div>
                        {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet-400)', boxShadow: '0 0 6px var(--violet-400)', flexShrink: 0 }} />}
                        {isLocked && <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>🔒</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View Detailed Performance */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <button
                onClick={() => navigate('analytics')}
                id="lesson-performance-btn"
                style={{
                  width: '100%', padding: '12px',
                  background: 'rgba(14,14,22,0.8)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <span>▦</span> View Detailed Performance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
