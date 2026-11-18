import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Minus,
} from 'lucide-react';
import { chatbotApi } from './chatbotApi';
import './ChatbotWidget.css';

/**
 * Lightweight markdown-like formatter for structured assistant responses
 */
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} style={{ height: '0.4rem' }} />;
        }

        // Headers: ### Title
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx}>
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Bullet points: • or - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <li key={idx} style={{ marginLeft: '1rem', listStyleType: 'disc' }}>
              <FormatInline text={content} />
            </li>
          );
        }

        // Numbered items: 1. 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <li key={idx} style={{ marginLeft: '1rem', listStyleType: 'decimal' }}>
              <FormatInline text={numMatch[2]} />
            </li>
          );
        }

        return (
          <p key={idx}>
            <FormatInline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline **bold** and `code` tags
 */
const FormatInline = ({ text }) => {
  if (!text) return null;

  // Split on **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
};

export const ChatbotWidget = () => {
  const location = useLocation();

  // Remove AI Chatbot from assignment and assessment sections.
  // Chatbot is strictly enabled for Candidate Portal pages and Admin pages only.
  const isAssignmentSection =
    location.pathname.startsWith('/assignment') ||
    location.pathname.startsWith('/interview') ||
    location.pathname.includes('assignment');

  if (isAssignmentSection) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Draggable position state
  const getInitialPosition = () => {
    try {
      const saved = localStorage.getItem('hp_chatbot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.min(Math.max(12, parsed.x), Math.max(12, window.innerWidth - 170)),
            y: Math.min(Math.max(12, parsed.y), Math.max(12, window.innerHeight - 70)),
          };
        }
      }
    } catch (_) {}
    return {
      x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 180) : 1000,
      y: typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 76) : 700,
    };
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reposition clamp when window resizes or when modal opens
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const width = isOpen ? 390 : 160;
        const height = isOpen ? 560 : 55;
        const maxX = Math.max(10, window.innerWidth - width - 10);
        const maxY = Math.max(10, window.innerHeight - height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPosition((prev) => {
        const maxX = Math.max(10, window.innerWidth - 410);
        const maxY = Math.max(10, window.innerHeight - 580);
        const clamped = {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
        try {
          localStorage.setItem('hp_chatbot_pos', JSON.stringify(clamped));
        } catch (_) {}
        return clamped;
      });
    }
  }, [isOpen]);

  // Pointer drag handler for moving anywhere across the screen
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.hp-chatbot-action-btn')) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture?.(e.pointerId);
    } catch (_) {}
    document.body.style.userSelect = 'none';

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x,
      posY: position.y,
    };

    const handlePointerMove = (moveEvt) => {
      if (!isDraggingRef.current) return;

      const curX = moveEvt.clientX ?? moveEvt.touches?.[0]?.clientX ?? 0;
      const curY = moveEvt.clientY ?? moveEvt.touches?.[0]?.clientY ?? 0;

      const deltaX = curX - dragStartRef.current.mouseX;
      const deltaY = curY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          setIsDragging(true);
        }
      }

      if (hasMovedRef.current) {
        if (moveEvt.cancelable) {
          moveEvt.preventDefault();
        }

        const width = isOpen ? 390 : 160;
        const height = isOpen ? 560 : 55;

        const maxX = Math.max(10, window.innerWidth - width - 10);
        const maxY = Math.max(10, window.innerHeight - height - 10);

        const newX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
        const newY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

        setPosition({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = '';
      try {
        targetEl.releasePointerCapture?.(e.pointerId);
      } catch (_) {}

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);

        if (hasMovedRef.current) {
          setPosition((cur) => {
            try {
              localStorage.setItem('hp_chatbot_pos', JSON.stringify(cur));
            } catch (_) {}
            return cur;
          });
        }
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleTriggerClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  // Initialize chatbot starter greeting on first load
  useEffect(() => {
    const initChatbot = async () => {
      try {
        const starters = await chatbotApi.getStarters();
        setMessages([
          {
            role: 'assistant',
            content: starters.greeting || "👋 Hi! I'm the **HirePulse Platform Assistant**. How can I help you today with our courses, ATS resume screening, assignments, or AI voice interview?",
          },
        ]);
        setSuggestions(starters.suggested_questions || []);
      } catch (err) {
        setMessages([
          {
            role: 'assistant',
            content: "👋 Welcome to **HirePulse**! I am your AI Platform Assistant, exclusively trained to answer any questions about our website, courses, ATS resume screening (≥70% cutoff), coding assignments, and AI voice interviews.",
          },
        ]);
        setSuggestions([
          "How many courses are there in HirePulse?",
          "Which roles & experience are eligible for each course?",
          "How does AI ATS shortlisting work?",
          "What happens during the AI Voice Interview?",
        ]);
      }
    };

    initChatbot();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText('');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Build conversation history excluding initial greeting
      const history = newMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await chatbotApi.sendMessage(text, history);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
        },
      ]);

      if (response.suggested_questions && response.suggested_questions.length > 0) {
        setSuggestions(response.suggested_questions);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm here to help with anything on our platform! You can ask about our technical courses, ATS evaluation scores, assignments, or the AI voice interview rules.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    const starters = await chatbotApi.getStarters();
    setMessages([
      {
        role: 'assistant',
        content: starters.greeting,
      },
    ]);
    setSuggestions(starters.suggested_questions || []);
  };

  return (
    <div
      className="hp-chatbot-wrapper"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }}
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={handleTriggerClick}
          className={`hp-chatbot-trigger ${isDragging ? 'dragging' : ''}`}
          title="Click to open or drag anywhere across the screen"
        >
          <div className="hp-chatbot-trigger-icon">
            <Sparkles size={18} />
          </div>
          <span>AI Support</span>
          <span className="hp-chatbot-trigger-pulse" />
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="hp-chatbot-window">
          {/* Header (Draggable) */}
          <div
            className={`hp-chatbot-header ${isDragging ? 'dragging' : ''}`}
            onPointerDown={handlePointerDown}
            title="Drag header to move anywhere"
          >
            <div className="hp-chatbot-header-info">
              <div className="hp-chatbot-avatar">
                <Bot size={20} />
                <span className="hp-chatbot-avatar-online" />
              </div>
              <div className="hp-chatbot-header-text">
                <h4>HirePulse AI Assistant</h4>
                <span>• Online (Platform Guide)</span>
              </div>
            </div>

            <div className="hp-chatbot-header-actions">
              <button
                type="button"
                onClick={handleClearChat}
                className="hp-chatbot-action-btn"
                title="Restart conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hp-chatbot-action-btn"
                title="Minimize chat"
              >
                <Minus size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hp-chatbot-action-btn"
                title="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Strict Platform Guardrail Banner */}
          <div className="hp-chatbot-guardrail-banner">
            <ShieldCheck size={14} color="#818cf8" />
            <span>Answers questions strictly about this website & platform.</span>
          </div>

          {/* Messages Area */}
          <div className="hp-chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`hp-chat-msg-row ${
                  msg.role === 'user' ? 'hp-chat-msg-user' : 'hp-chat-msg-assistant'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Bot size={15} color="#818cf8" />
                  </div>
                )}
                <div className="hp-chat-msg-bubble">
                  <FormattedMessage text={msg.content} />
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="hp-chat-msg-row hp-chat-msg-assistant">
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={15} color="#818cf8" />
                </div>
                <div className="hp-chat-typing">
                  <div className="hp-chat-dot" />
                  <div className="hp-chat-dot" />
                  <div className="hp-chat-dot" />
                </div>
              </div>
            )}

            {/* Quick Suggestion Pills */}
            {!isTyping && suggestions.length > 0 && (
              <div className="hp-chat-suggestions">
                <span style={{ fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Suggested Questions:
                </span>
                {suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSend(sug)}
                    className="hp-chat-suggestion-pill"
                  >
                    <ChevronRight size={12} color="#818cf8" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="hp-chatbot-footer">
            <div className="hp-chatbot-input-row">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses, ATS, interviews, proctoring..."
                className="hp-chatbot-input"
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className="hp-chatbot-send-btn"
                title="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="hp-chatbot-disclaimer">
              Powered by HirePulse AI • Restricted to website & platform questions
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;

