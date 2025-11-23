import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { storageService } from '../services/storageService';
import { Message } from '../types';
import { Card, Button } from '../components/UI';
import { Send, User as UserIcon, ArrowLeft, MessageCircle, Image as ImageIcon, X } from 'lucide-react';

export const Chat: React.FC = () => {
  const { currentUser, t } = useContext(AppContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPartnerId = searchParams.get('with');
  
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allUsers = storageService.getUsers();
  
  // Load messages initially
  useEffect(() => {
    setMessages(storageService.getMessages());
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      setMessages(storageService.getMessages());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new message or chat switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePartnerId, selectedImage]);

  if (!currentUser) return null;

  // Get all conversations relevant to current user
  const myMessages = messages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id);
  
  // Explicitly type conversations as string[] to prevent implicit 'unknown' type inference issues
  const conversations: string[] = Array.from(new Set(
    myMessages.map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  ));

  // Add the active partner if not in history yet (e.g. started from Matching page)
  if (activePartnerId && !conversations.includes(activePartnerId)) {
    conversations.unshift(activePartnerId);
  }

  // Filter messages for the active conversation
  const activeMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === activePartnerId) ||
    (m.senderId === activePartnerId && m.receiverId === currentUser.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  // Image processing helper
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Please select an image under 5MB.");
        return;
      }
      const base64 = await resizeImage(file);
      setSelectedImage(base64);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !activePartnerId) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activePartnerId,
      content: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now(),
      read: false
    };

    storageService.sendMessage(newMsg);
    setMessages([...messages, newMsg]); // optimistic update
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getPartnerDetails = (id: string) => {
    const user = allUsers.find(u => u.id === id);
    return {
      name: user?.anonymousName || id,
      avatar: user?.anonymousName?.charAt(0) || '?'
    };
  };

  const getLastMessage = (partnerId: string) => {
    const thread = messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === partnerId) ||
      (m.senderId === partnerId && m.receiverId === currentUser.id)
    ).sort((a, b) => b.timestamp - a.timestamp);
    
    if (thread.length === 0) return t('noConversations');
    const last = thread[0];
    if (last.image && !last.content) return `[${t('photo')}]`;
    return last.content.length > 25 ? last.content.substring(0, 25) + '...' : last.content;
  };

  // Mobile UI Logic
  const isMobile = window.innerWidth < 768;
  const showList = !activePartnerId;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4">
      {/* Sidebar / List */}
      <div className={`${showList ? 'w-full' : 'hidden'} md:w-1/3 md:block flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-700">{t('recentChats')}</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
               <MessageCircle size={32} className="opacity-50" />
               <p className="text-sm">{t('noConversations')}</p>
            </div>
          ) : (
            conversations.map(id => {
              const details = getPartnerDetails(id);
              return (
                <div 
                  key={id}
                  onClick={() => setActivePartnerId(id)}
                  className={`p-4 border-b cursor-pointer hover:bg-green-50 transition-colors flex items-center gap-3 ${activePartnerId === id ? 'bg-green-50 border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                    {details.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{details.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{getLastMessage(id)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showList ? 'w-full' : 'hidden'} md:w-2/3 md:flex flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
        {activePartnerId ? (
          <>
            <div className="p-3 border-b flex items-center gap-3 bg-gray-50 shadow-sm z-10">
              <button onClick={() => setActivePartnerId(null)} className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                 {getPartnerDetails(activePartnerId).avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{getPartnerDetails(activePartnerId).name}</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('online')}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {activeMessages.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  {t('typeMessage')}
                </div>
              )}
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                       <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                         isMe 
                           ? 'bg-green-600 text-white rounded-br-none' 
                           : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                       }`}>
                         {msg.image && (
                           <img 
                             src={msg.image} 
                             alt="attachment" 
                             className="max-w-full rounded-lg mb-2 max-h-60 object-cover border border-black/10"
                           />
                         )}
                         {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                       </div>
                       <span className="text-[10px] text-gray-400 mt-1 px-1">
                         {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedImage} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title={t('photo')}
                >
                  <ImageIcon size={20} />
                </button>
                <input 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                  placeholder={t('typeMessage')}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <Button type="submit" variant="primary" disabled={!inputText.trim() && !selectedImage} className="p-3 rounded-xl">
                  <Send size={20} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <MessageCircle size={40} className="text-gray-300" />
            </div>
            <p>{t('selectConversation')}</p>
          </div>
        )}
      </div>
    </div>
  );
};