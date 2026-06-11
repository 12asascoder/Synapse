/**
 * LearningSession — AI-powered live bootcamp session
 * Clean ElevenLabs aesthetic
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamVisheshResponse, generateLessonIntro } from '../lib/vishesh';
import SessionStartModal from '../components/SessionStartModal';
import * as faceapi from '@vladmandic/face-api';

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

export default function LearningSession() {
  const { state, dispatch, navigate } = useApp();
  const { selectedBootcamp, currentDay, user } = state;

  const [hasPermissions, setHasPermissions] = useState(false);
  const [curriculum, setCurriculum] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(`Session-${Math.random().toString(16).slice(2, 5).toUpperCase()}`);
  
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const speechBufferRef = useRef('');
  const lastSpokenIndexRef = useRef(0);
  
  const [expressionStatus, setExpressionStatus] = useState('Initializing Vision...');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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
        const topic = curriculum.find(c => String(c.day) === String(currentDay))?.topic || 'Optimization Strategies';
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
      speakMessage(introMessage || "Welcome to today's learning session. How are you doing?", () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); setIsListening(true); } catch (e) {}
        }
      });
    };

    startSession();
  }, [hasPermissions, currentDay, curriculum, selectedBootcamp, messages.length]);

  // --- Voice Setup ---
  const speakMessage = (text, onEnd) => {
    if (!window.speechSynthesis) {
       if (onEnd) onEnd();
       return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, '')); // Strip markdown
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) || voices[0];
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setTimeout(() => document.getElementById('session-send-btn')?.click(), 100);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition not supported in this browser.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  // -------------------

  // Init Webcam and FaceAPI
  useEffect(() => {
    if (!hasPermissions) return;

    let isMounted = true;
    const startWebcam = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Webcam/FaceAPI init error:", err);
        if (isMounted) setExpressionStatus('Camera Unavailable');
      }
    };
    startWebcam();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [hasPermissions]);

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (detection) {
          const expressions = detection.expressions;
          const maxExpr = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
          
          let state = "Focused (Neutral)";
          if (maxExpr === 'happy') state = "Understanding";
          if (maxExpr === 'sad' || maxExpr === 'angry' || maxExpr === 'fearful' || maxExpr === 'disgusted') state = "Confused";
          if (maxExpr === 'surprised') state = "Curious";
          
          setExpressionStatus(state);
        } else {
          setExpressionStatus('Face Not Detected');
        }
      }
    }, 500);
    
    window._faceApiInterval = interval;
  };

  useEffect(() => {
    return () => {
      if (window._faceApiInterval) clearInterval(window._faceApiInterval);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    
    // Stop speaking if user interrupts
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speechBufferRef.current = '';
    lastSpokenIndexRef.current = 0;

    const userMsg = { role: 'user', content: text, id: Date.now().toString() };
    setMessages((p) => [...p, userMsg]);
    setIsThinking(true);

    const aId = `a-${Date.now()}`;
    setMessages((p) => [...p, { role: 'assistant', content: '', id: aId, streaming: true }]);
    setIsThinking(false);
    setIsStreaming(true);

    abortRef.current = new AbortController();
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    
    const isValidation = currentDay === 15 || currentDay === 30;
    const modeContext = isValidation ? "Validation Mode: Assess the user" : "Teaching Mode: Instruct, explain, and interactively guide the user.";
    const topic = curriculum.find(c => String(c.day) === String(currentDay))?.topic || 'this subject';

    await streamVisheshResponse({
      userMessage: text,
      history,
      context: `Bootcamp: ${selectedBootcamp?.name || 'AI Engineering'} | Day: ${currentDay} | Topic: ${topic} | Mode: ${modeContext}`,

      abortController: abortRef.current,
      onToken: (_, full) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: full } : m));
        
        // Streaming TTS logic: Check for sentence boundaries
        const newText = full.slice(lastSpokenIndexRef.current);
        const match = newText.match(/([.!?\n])\s/);
        if (match) {
          const endIndex = newText.indexOf(match[0]) + match[0].length;
          const sentence = newText.slice(0, endIndex);
          if (sentence.trim()) {
            speakMessage(sentence);
          }
          lastSpokenIndexRef.current += endIndex;
        }
      },
      onDone: (full) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: full, streaming: false } : m));
        setIsStreaming(false);
        
        const autoMic = () => {
          if (recognitionRef.current && !isListening) {
             try { recognitionRef.current.start(); setIsListening(true); } catch (e) {}
          }
        };

        const remaining = full.slice(lastSpokenIndexRef.current);
        if (remaining.trim()) {
          speakMessage(remaining, autoMic);
        } else {
          autoMic();
        }
      },
      onError: (err) => {
        setMessages((p) => p.map((m) => m.id === aId ? { ...m, content: err, streaming: false } : m));
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages, selectedBootcamp, currentDay]);

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
      
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#FDFCFC', overflow: 'hidden' }}>
        
        {/* TOP NAV */}
        <nav style={{
          height: '64px', background: '#FFFFFF',
          borderBottom: '1px solid #E8E6E3',
          display: 'flex', alignItems: 'center', padding: '0 32px',
          gap: '0', flexShrink: 0, position: 'relative', zIndex: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginRight: '40px', color: '#000' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('dashboard')}>Synapse</span>
          </div>
          {['Curriculum', 'Network', 'Simulations'].map((item, i) => (
            <button key={item} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px',
              color: i === 0 ? '#000' : '#6B6B6B',
              padding: '0 20px', height: '100%',
              borderBottom: i === 0 ? '2px solid #000' : '2px solid transparent',
              fontWeight: i === 0 ? 600 : 500,
              transition: 'color 0.15s ease',
            }}>
              {item}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={completeLesson}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}
            >Finish Session</button>
          </div>
        </nav>

        {/* SUB NAV: LIVE ANALYSIS BAR */}
        <div style={{
          height: '48px', background: '#FFFFFF',
          borderBottom: '1px solid #E8E6E3',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: '24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, background: '#059669', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Live Session</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: '#E8E6E3' }} />
          <span style={{ fontSize: '12px', color: '#A59F97' }}>
            Session ID: {sessionId}
          </span>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 10%', background: '#FDFCFC' }} className="scroll-area">

              {messages.length === 0 && isThinking && (
                <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, color: '#6B6B6B' }}>
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
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', color: 'white', marginTop: '4px'
                      }}>V</div>
                    )}

                    <div style={{ maxWidth: '85%' }}>
                      <div style={{
                        fontSize: '15px', color: '#000',
                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        padding: isVishesh ? '12px 16px' : '12px 20px',
                        background: isVishesh ? '#F5F3F1' : '#FFFFFF',
                        border: '1px solid #E8E6E3',
                        borderRadius: isVishesh ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}>
                        {msg.content.replace(/\*/g, '')}
                        {msg.streaming && (
                          <span style={{
                            display: 'inline-block', width: '3px', height: '16px',
                            background: '#000', marginLeft: '4px',
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
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff' }}>V</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A59F97', animation: 'pulse-dot 1.2s infinite', animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div style={{ padding: '0 10% 40px', background: '#FDFCFC' }}>
              {!isStreaming && !isThinking && messages.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <AnimatedWaveform active={false} />
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#FFFFFF',
                border: '1px solid #DCDCDC',
                borderRadius: '16px', padding: '10px 16px',
                transition: 'border-color 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#000'; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#DCDCDC'; }}
              >
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
                    color: '#000', fontSize: '15px',
                    resize: 'none', maxHeight: '120px', overflow: 'auto',
                    lineHeight: 1.5, padding: '8px 0',
                  }}
                />
                <button 
                  onClick={toggleListening}
                  style={{ 
                    background: isListening ? '#FEF2F2' : 'none', 
                    border: `1px solid ${isListening ? '#FCA5A5' : 'transparent'}`,
                    borderRadius: '8px', cursor: 'pointer', 
                    color: isListening ? '#DC2626' : '#A59F97', 
                    fontSize: '18px', padding: '6px 10px',
                    transition: 'all 0.2s ease',
                    animation: isListening ? 'pulse-dot 1.5s infinite' : 'none'
                  }}
                >
                  🎙
                </button>
                <button
                  id="session-send-btn"
                  onClick={isStreaming ? () => abortRef.current?.abort() : sendMessage}
                  style={{
                    background: input.trim() ? '#000' : '#F5F3F1', border: 'none', cursor: 'pointer', 
                    color: input.trim() ? '#fff' : '#A59F97', 
                    fontSize: '18px', padding: '6px 12px', borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isStreaming ? '■' : '▶'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: VISHESH VIDEO & CURRICULUM */}
          <div style={{
            width: '380px', display: 'flex', flexDirection: 'column',
            background: '#FFFFFF', flexShrink: 0,
            borderLeft: '1px solid #E8E6E3',
          }}>
            
            {/* VISHESH LIVE PANEL */}
            <div style={{ padding: '32px 32px 16px' }}>
              <div style={{
                width: '100%', height: '220px',
                background: '#000',
                borderRadius: '16px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              }}>
                {/* Live Webcam Feed */}
                <video 
                  ref={videoRef}
                  autoPlay 
                  muted 
                  playsInline
                  onPlay={handleVideoPlay}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror the webcam
                    opacity: 0.8
                  }}
                />

                {/* Overlay Controls & Info */}
                <div style={{
                  position: 'absolute', bottom: '12px', left: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(0,0,0,0.6)', borderRadius: '8px',
                  padding: '6px 12px', backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', textTransform: 'uppercase' }}>
                    {expressionStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* CURRICULUM SIDEBAR */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px' }} className="scroll-area">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#000' }}>Curriculum</span>
                <span style={{
                  fontSize: '11px', padding: '4px 10px',
                  background: '#F5F3F1', border: '1px solid #E8E6E3',
                  borderRadius: '6px', color: '#44403B', fontWeight: 600,
                }}>Phase 1</span>
              </div>

              {/* Current Bootcamp Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: '#F5F3F1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '20px'
                }}>◈</div>
                <div>
                  <div style={{ color: '#000', fontWeight: 600, fontSize: '15px' }}>Vishesh Learning Lab</div>
                  <div style={{ color: '#6B6B6B', fontSize: '13px' }}>Day {currentDay} of 30</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loadingCurriculum && <div style={{ color: '#A59F97', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading curriculum...</div>}
                
                {!loadingCurriculum && curriculum.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#A59F97' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#44403B', marginBottom: '8px' }}>No active bootcamp</div>
                    <div style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '16px' }}>Select a bootcamp from the Dashboard to see your curriculum here.</div>
                    <button onClick={() => navigate('dashboard')} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Go to Dashboard</button>
                  </div>
                )}
                
                {curriculum.map((item) => {
                  const isActive = item.status === 'active';
                  const isComplete = item.status === 'complete';
                  const isLocked = item.status === 'locked';
                  
                  return (
                    <div key={item.day} style={{
                      padding: '16px',
                      background: isActive ? '#F5F3F1' : 'transparent',
                      border: `1px solid ${isActive ? '#E8E6E3' : 'transparent'}`,
                      borderRadius: '12px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isLocked ? 0.5 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                          background: isActive ? '#000' : isComplete ? '#F5F3F1' : '#FFFFFF',
                          border: `1px solid ${isComplete ? '#E8E6E3' : isActive ? '#000' : '#E8E6E3'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 600,
                          color: isActive ? 'white' : '#6B6B6B',
                        }}>
                          {String(item.day).padStart(2, '0')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px', fontWeight: 600,
                            color: isActive ? '#000' : '#44403B',
                            marginBottom: '4px'
                          }}>{item.topic}</div>
                          {item.sublabel && (
                            <div style={{ fontSize: '12px', color: '#A59F97' }}>
                              {isComplete ? 'Completed · 100%' : (isActive ? `Active · ${item.sublabel}` : item.sublabel)}
                            </div>
                          )}
                        </div>
                        {isComplete && <div style={{ color: '#10B981', fontSize: '16px', fontWeight: 700 }}>✓</div>}
                        {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />}
                        {isLocked && <div style={{ color: '#A59F97', fontSize: '14px' }}>🔒</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View Detailed Performance Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid #E8E6E3' }}>
              <button
                onClick={() => navigate('analytics')}
                className="btn"
                style={{
                  width: '100%', padding: '14px',
                  background: '#FDFCFC',
                  border: '1px solid #E8E6E3',
                  borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  color: '#44403B', fontSize: '13px', fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3F1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FDFCFC'; }}
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
