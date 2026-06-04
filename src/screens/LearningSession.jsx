/**
 * LearningSession — AI-powered live bootcamp session
 * Layout matches reference image exactly: edge-to-edge, chat on left, 
 * floating Vishesh live video panel on right, curriculum on right sidebar.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamVisheshResponse, generateLessonIntro } from '../lib/vishesh';
import SessionStartModal from '../components/SessionStartModal';

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
  const { selectedBootcamp, currentDay, ollamaOnline, ollamaModel, user } = state;

  const [hasPermissions, setHasPermissions] = useState(false);
  const [curriculum, setCurriculum] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(`Bootcamp-${Math.random().toString(16).slice(2, 5).toUpperCase()}`);
  
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isThinking]);

  // Fetch Curriculum from backend
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/curriculum/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setCurriculum(data);
        }
      } catch (err) {
        console.error("Failed to fetch curriculum:", err);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    fetchCurriculum();
  }, [user]);

  // Generate initial teaching message once permissions are granted
  useEffect(() => {
    if (!hasPermissions) return;
    if (messages.length > 0) return;

    const startSession = async () => {
      setIsThinking(true);
      const isValidation = currentDay === 15 || currentDay === 30;
      
      let introMessage = "";
      if (isValidation) {
        introMessage = "Welcome to your Milestone Validation. I will be assessing your knowledge across the topics we've covered. Are you ready to begin?";
      } else {
        // Teach mode
        const topic = curriculum.find(c => c.day === currentDay)?.topic || 'Optimization Strategies';
        const bootcampName = selectedBootcamp?.name || 'AI Engineering';
        
        try {
          introMessage = await generateLessonIntro({ bootcamp: bootcampName, topic, day: currentDay });
        } catch (err) {
          introMessage = `Welcome back. Today we are covering ${topic}. Let's dive in.`;
        }
      }

      setMessages([
        {
          role: 'assistant',
          content: introMessage || "Welcome to today's learning session. How are you doing?",
          id: 'init-1',
          streaming: false,
        }
      ]);
      setIsThinking(false);
    };

    startSession();
  }, [hasPermissions, currentDay, curriculum, selectedBootcamp, messages.length]);

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
    
    // Inject teaching persona context
    const isValidation = currentDay === 15 || currentDay === 30;
    const modeContext = isValidation ? "Validation Mode: Assess the user" : "Teaching Mode: Instruct, explain, and interactively guide the user.";

    await streamVisheshResponse({
      userMessage: text,
      history,
      context: `${selectedBootcamp?.name || 'AI Engineering'} — Day ${currentDay} — ${modeContext}`,
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
    <>
      {!hasPermissions && <SessionStartModal onJoin={() => setHasPermissions(true)} />}
      
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
        
        {/* TOP NAV — Matches reference exactly */}
        <nav style={{
          height: '56px', background: 'var(--bg-void)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', alignItems: 'center', padding: '0 32px',
          gap: '0', flexShrink: 0, position: 'relative', zIndex: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', marginRight: '40px', letterSpacing: '-0.02em', color: 'white' }}>
            SYNAPSE
          </div>
          {['Curriculum', 'Network', 'Simulations'].map((item, i) => (
            <button key={item} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '14px',
              color: i === 0 ? 'var(--violet-300)' : 'var(--text-muted)',
              padding: '0 20px', height: '100%',
              borderBottom: i === 0 ? '2px solid var(--violet-500)' : '2px solid transparent',
              fontWeight: i === 0 ? 600 : 400,
              transition: 'color 0.15s ease',
            }}>
              {item}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}>⊡</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}>🔔</button>
            <button
              onClick={completeLesson}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--violet-600), var(--violet-500))',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                color: 'white', letterSpacing: '0.04em',
              }}
            >Launch Neural Link</button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: '16px', color: 'var(--cyan-400)' }}>👤</span>
            </div>
          </div>
        </nav>

        {/* SUB NAV: LIVE ANALYSIS BAR */}
        <div style={{
          height: '48px', background: 'var(--bg-void)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: '24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="dot-live" style={{ width: 8, height: 8, background: 'var(--cyan-400)', borderRadius: '50%', boxShadow: '0 0 8px var(--cyan-400)' }} />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-400)', letterSpacing: '0.1em' }}>LIVE ANALYSIS</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Session ID: {sessionId}
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
              padding: '6px 16px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '4px', color: 'var(--violet-400)', letterSpacing: '0.1em',
            }}>LEARNING SESSION ACTIVE</span>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT: CHAT AREA */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 10%' }} className="scroll-area">
              {!ollamaOnline && (
                <div style={{ marginBottom: '24px', padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>
                  ⚡ Start Ollama locally to activate Vishesh AI
                </div>
              )}

              {messages.length === 0 && isThinking && (
                <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                  Preparing learning session...
                </div>
              )}

              {messages.map((msg) => {
                const isVishesh = msg.role === 'assistant';
                return (
                  <div key={msg.id} style={{
                    display: 'flex', gap: '16px', marginBottom: '32px',
                    flexDirection: isVishesh ? 'row' : 'row-reverse',
                    animation: 'fadeInUp 0.35s ease both',
                  }}>
                    {/* Avatar */}
                    {isVishesh && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--violet-600)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', color: 'white', marginTop: '4px'
                      }}>◈</div>
                    )}

                    <div style={{ maxWidth: '85%' }}>
                      <div style={{
                        fontSize: '15px', color: 'white',
                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        padding: isVishesh ? '4px 0' : '16px 20px',
                        background: isVishesh ? 'transparent' : 'rgba(124,58,237,0.1)',
                        border: isVishesh ? 'none' : '1px solid rgba(124,58,237,0.2)',
                        borderRadius: isVishesh ? '0' : '12px',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {msg.content.replace(/\*/g, '')}
                        {msg.streaming && (
                          <span style={{
                            display: 'inline-block', width: '3px', height: '16px',
                            background: 'var(--violet-400)', marginLeft: '4px',
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
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--violet-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>◈</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet-400)', animation: 'pulse-dot 1.2s infinite', animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div style={{ padding: '0 10% 40px' }}>
              {!isStreaming && !isThinking && messages.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <AnimatedWaveform active={false} />
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(14,14,22,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '8px 16px 8px 8px',
                transition: 'border-color 0.2s ease',
              }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <button style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '0 8px'
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
                    color: 'white', fontFamily: 'var(--font-mono)', fontSize: '14px',
                    resize: 'none', maxHeight: '120px', overflow: 'auto',
                    lineHeight: 1.5, padding: '8px 0',
                  }}
                />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', padding: '4px' }}>🎙</button>
                <button
                  onClick={isStreaming ? () => abortRef.current?.abort() : sendMessage}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: input.trim() || isStreaming ? 'white' : 'var(--text-muted)', 
                    fontSize: '18px', padding: '4px'
                  }}
                >
                  {isStreaming ? '■' : '▷'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: VISHESH VIDEO & CURRICULUM */}
          <div style={{
            width: '380px', display: 'flex', flexDirection: 'column',
            background: 'var(--bg-void)', flexShrink: 0,
            borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            
            {/* VISHESH LIVE PANEL */}
            <div style={{ padding: '32px 32px 16px' }}>
              <div style={{
                width: '100%', height: '200px',
                background: 'linear-gradient(135deg, #101827, #1e1b4b)',
                borderRadius: '12px',
                position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
              }}>
                {/* Mock Video Image / Avatar */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'url("https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=250") center/cover',
                  opacity: 0.8
                }}>
                  {/* Holographic overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(34,211,238,0.2), rgba(124,58,237,0.2))', mixBlendMode: 'overlay' }} />
                </div>

                {/* Overlay Controls & Info */}
                <div style={{
                  position: 'absolute', bottom: '12px', left: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(5, 5, 8, 0.8)', borderRadius: '4px',
                  padding: '6px 12px', backdropFilter: 'blur(4px)',
                }}>
                  <div className="dot-live" style={{ width: 8, height: 8, background: 'var(--rose-500)', borderRadius: '50%', boxShadow: '0 0 8px var(--rose-500)' }} />
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
                    VISHESH AI · EXPLORING LORA
                  </span>
                </div>
                
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <div style={{ background: 'rgba(5,5,8,0.8)', padding: '6px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                    <span style={{ fontSize: '12px', color: 'white' }}>🎥</span>
                  </div>
                  <div style={{ background: 'rgba(5,5,8,0.8)', padding: '6px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                    <span style={{ fontSize: '12px', color: 'white' }}>🎙</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CURRICULUM SIDEBAR */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px' }} className="scroll-area">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontWeight: 800, fontSize: '16px', color: 'white', fontFamily: 'Inter, sans-serif' }}>Curriculum</span>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '4px 10px',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '4px', color: 'var(--violet-400)', fontWeight: 700,
                }}>PHASE 1</span>
              </div>

              {/* Current Bootcamp Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '8px',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-400)', fontSize: '20px'
                }}>◈</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Vishesh Learning Lab</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Day {currentDay} of 30</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loadingCurriculum && <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>Loading curriculum...</div>}
                
                {curriculum.map((item) => {
                  const isActive = item.status === 'active';
                  const isComplete = item.status === 'complete';
                  const isLocked = item.status === 'locked';
                  
                  return (
                    <div key={item.day} style={{
                      padding: '16px',
                      background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                      borderRadius: '8px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isLocked ? 0.4 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '4px', flexShrink: 0,
                          background: isActive ? 'var(--violet-600)' : isComplete ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                          color: isActive ? 'white' : 'var(--text-muted)',
                        }}>
                          {String(item.day).padStart(2, '0')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px', fontWeight: 600,
                            color: isActive ? 'var(--violet-300)' : 'var(--text-muted)',
                            marginBottom: '4px'
                          }}>{item.topic}</div>
                          {item.sublabel && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {isComplete ? 'Completed · 100%' : (isActive ? `Active · ${item.sublabel}` : item.sublabel)}
                            </div>
                          )}
                        </div>
                        {isComplete && <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>✓</div>}
                        {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet-400)', boxShadow: '0 0 6px var(--violet-400)' }} />}
                        {isLocked && <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>🔒</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View Detailed Performance Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => navigate('analytics')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <span>▦</span> View Detailed Performance
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
