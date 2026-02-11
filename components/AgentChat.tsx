
import React, { useState, useEffect, useRef } from 'react';
import { queryAgent } from '../services/geminiService';
import { BookItem, School, ChatMessage } from '../types';

interface AgentChatProps {
  items: BookItem[];
  schools: School[];
}

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
];

const AgentChat: React.FC<AgentChatProps> = ({ items, schools }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "System online. I am Vortex Agent. I can analyze your entire distribution network in seconds.\n\nAsk me about stock across schools or publisher analytics.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      
      recognition.onstart = () => { setIsListening(true); setSpeechError(null); };
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setSpeechError(`Voice Error: ${event.error}`);
          setTimeout(() => setSpeechError(null), 3000);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await queryAgent(userMsg.content, { schools, items });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: "Vortex connection error. Terminal failed to fetch data.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
            <i className="fa-solid fa-hurricane text-lg animate-spin-reverse-slow"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Vortex Agent</h2>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Active Insight Mode</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-surfaceHighlight text-secondary rounded-tl-none border border-border'}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[10px] mt-2 opacity-40 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surfaceHighlight rounded-2xl rounded-tl-none px-4 py-3 border border-border flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
               <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surfaceHighlight/50 border-t border-border relative">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Vortex Listening..." : "Query Vortex Command Center..."}
              className={`w-full bg-background border border-border text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-accent transition-all ${isListening ? 'border-accent shadow-[0_0_15px_rgba(139,92,246,0.3)]' : ''}`}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-accent text-white animate-pulse' : 'text-secondary hover:text-white'}`}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
            </button>
          </div>
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-11 rounded-xl bg-accent text-white hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
