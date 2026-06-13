/**
 * VisheshChat — Clean white streaming AI conversation component
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { streamVisheshResponse } from '../lib/vishesh';
import { useApp } from '../context/AppContext';

function WaveformIcon({ active }) {
  return (
    <div className="waveform" style={{ opacity: active ? 1 : 0.3 }}>
      {[0.4, 0.7, 1, 0.7, 0.5, 0.8, 0.6, 0.9, 0.4].map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: '24px',
            transform: `scaleY(${active ? h : 0.3})`,
            animationDelay: `${i * 120}ms`,
            animationPlayState: active ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isVishesh = msg.role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        animation: 'fadeInUp 0.4s ease forwards',
        marginBottom: '20px',
      }}
    >
      {isVishesh && (
        <div className="vishesh-avatar" style={{ flexShrink: 0 }}>V</div>
      )}
      <div
        style={{
          maxWidth: '85%',
          marginLeft: isVishesh ? 0 : 'auto',
        }}
      >
        {isVishesh && (
          <div style={{
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            color: '#A59F97',
            marginBottom: '6px',
            fontWeight: 600,
          }}>
            VISHESH
          </div>
        )}
        <div
          style={{
            background: isVishesh
              ? '#F5F3F1'
              : '#000000',
            border: `1px solid ${isVishesh ? '#E8E6E3' : 'transparent'}`,
            borderRadius: isVishesh ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
            padding: '14px 18px',
            fontSize: '14px',
            lineHeight: 1.7,
            color: isVishesh ? '#000000' : '#FFFFFF',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {msg.content}
          {msg.streaming && (
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '16px',
              background: isVishesh ? '#000' : '#fff',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'pulse-dot 0.8s ease-in-out infinite',
            }} />
          )}
        </div>
        {msg.timestamp && (
          <div style={{ fontSize: '11px', color: '#A59F97', marginTop: '4px' }}>
            {msg.timestamp}
          </div>
        )}
      </div>
      {!isVishesh && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F0EEEC',
            border: '1px solid #E8E6E3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0,
            color: '#44403B',
          }}
        >
          U
        </div>
      )}
    </div>
  );
}

export default function VisheshChat({ context = '', placeholder = 'Ask Vishesh anything...', initialGreeting = true }) {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Initial Vishesh greeting
  useEffect(() => {
    if (initialGreeting && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Welcome! I'm Vishesh, your AI learning mentor.\n\nI'm here to guide you through your learning journey. Ask me anything — concepts, problems, strategies, or career guidance.\n\nWhat would you like to explore today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        streaming: false,
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setIsThinking(true);

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Store in app context history
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: text } });

    // Create streaming assistant message placeholder
    const assistantMsgId = Date.now();
    setMessages((prev) => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      streaming: true,
      timestamp: null,
    }]);

    setIsThinking(false);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    await streamVisheshResponse({
      userMessage: text,
      history,
      context,
      abortController: abortRef.current,
      onToken: (token, fullText) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: fullText, streaming: true }
              : m
          )
        );
      },
      onDone: (fullText) => {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: fullText, streaming: false, timestamp: ts }
              : m
          )
        );
        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', content: fullText } });
        setIsStreaming(false);
      },
      onError: (errMsg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: errMsg, streaming: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
              : m
          )
        );
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages, context, dispatch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => m.streaming ? { ...m, streaming: false } : m)
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid #E8E6E3',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #E8E6E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FDFCFC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="vishesh-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>V</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>
              Vishesh
            </div>
            <div style={{ fontSize: 11, color: '#A59F97' }}>
              TruGen AI · online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WaveformIcon active={isStreaming} />
          <div className="badge badge-emerald" style={{ fontSize: '10px', padding: '2px 8px' }}>AI</div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="scroll-area"
        style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#FDFCFC' }}
      >
        {messages.map((msg, i) => (
          <Message key={msg.id || i} msg={msg} />
        ))}
        {isThinking && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <div className="vishesh-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>V</div>
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '12px 16px',
              background: '#F5F3F1',
              border: '1px solid #E8E6E3',
              borderRadius: '4px 14px 14px 14px',
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#A59F97',
                  animation: 'pulse-dot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 200}ms`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #E8E6E3',
        background: '#FFFFFF',
      }}>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #DCDCDC',
              borderRadius: 'var(--radius-md)',
              color: '#000',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              padding: '12px 16px',
              resize: 'none',
              outline: 'none',
              maxHeight: '120px',
              overflow: 'auto',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#000'; }}
            onBlur={(e) => { e.target.style.borderColor = '#DCDCDC'; }}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="btn btn-sm"
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FEE2E2',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
              }}
              aria-label="Stop Vishesh"
            >
              ■
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '12px 20px', opacity: input.trim() ? 1 : 0.4 }}
              aria-label="Send message to Vishesh"
            >
              →
            </button>
          )}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#A59F97', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line · powered by TruGen AI
        </div>
      </div>
    </div>
  );
}
