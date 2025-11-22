import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { askAgroBot } from '../services/geminiService';
import { Card, Button } from '../components/UI';
import { Sparkles, Send, Bot } from 'lucide-react';

interface AIMessage {
  role: 'user' | 'ai';
  text: string;
}

export const Assistant: React.FC = () => {
  const { currentUser, t } = useContext(AppContext);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (messages.length === 0) {
          setMessages([{ role: 'ai', text: t('aiIntro') }]);
      }
  }, [t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await askAgroBot(userMsg, currentUser?.role || 'Unknown');
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: t('aiError') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-3xl mx-auto">
      <Card className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-purple-50 to-white border-purple-100">
        <div className="p-4 border-b border-purple-100 bg-white flex items-center gap-2 shadow-sm">
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <Sparkles size={20} />
          </div>
          <div>
             <h2 className="font-bold text-purple-900">{t('assistant')}</h2>
             <p className="text-xs text-purple-600">{t('poweredBy')}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-600 text-white'}`}>
                   {msg.role === 'user' ? 'U' : <Bot size={18} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tr-none' 
                    : 'bg-purple-600 text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                   <Bot size={18} />
                 </div>
                 <div className="bg-purple-50 text-purple-800 p-3 rounded-2xl rounded-tl-none text-sm animate-pulse">
                   {t('loading')}
                 </div>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input 
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder={t('aiPrompt')}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </Card>
    </div>
  );
};