import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
// import ReactMarkdown from 'react-markdown'; // optional - uncomment if installed

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai' | 'ai error';
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Adjust this call to match YOUR actual endpoint & payload
      const response = await axios.post(
        'http://localhost:8080/rag',           // ← CHANGE THIS
        { query: input },                   // ← CHANGE field name if needed
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Adjust how you extract the answer – pick the one that matches your backend
      const aiText =
        response.data.answer ??
        response.data.response ??
        response.data.content ??
        response.data ??
        'No response content received';

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiText,
        sender: 'ai',
      };

      setMessages((prev) => [...prev, aiMessage]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('API error:', error);

      let errorText = 'Sorry, something went wrong.';
      if (error.response?.data?.message) {
        errorText += ` ${error.response.data.message}`;
      } else if (error.message) {
        errorText += ` ${error.message}`;
      }

      const errorMsg: Message = {
        id: Date.now() + 2,
        text: errorText,
        sender: 'ai error',
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header
        style={{
          padding: '16px',
          background: '#011a30',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <h2 style={{ margin: 0 }}>RAG Chat – Ask anything about your documents</h2>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#f0f2f5',
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '100px' }}>
            How can I help you today? Feel free to ask anything.
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent:
                msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: '18px',
                background:
                  msg.sender === 'user'
                    ? '#0084ff'
                    : msg.sender === 'ai error'
                      ? '#f8d7da'
                      : '#ffffff',
                color:
                  msg.sender === 'user'
                    ? 'white'
                    : msg.sender === 'ai error'
                      ? '#721c24'
                      : 'black',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {/* If using react-markdown: */}
              {/* <ReactMarkdown>{msg.text}</ReactMarkdown> */}
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '18px',
                background: '#e9ecef',
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <footer
        style={{
          padding: '16px',
          background: 'white',
          borderTop: '1px solid #dee2e6',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here... (Press Enter to send)"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              resize: 'none',
              fontSize: '16px',
              minHeight: '44px',
              maxHeight: '120px',
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '0 24px',
              background: '#0084ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;