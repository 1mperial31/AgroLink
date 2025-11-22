import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { storageService } from '../services/storageService';
import { Message } from '../types';
import { Card, Input, Button } from '../components/UI';
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
  const myMessages = storageService.getMessages();

  useEffect(() => {
    setMessages(storageService.getMessages());
    // Poll for new messages every 3 seconds (simple alternative to websockets)
    const interval = setInterval(() => {
      setMessages(storageService.getMessages());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePartnerId, selectedImage]);

  if (!currentUser) return null;

  // Group conversations
  const conversations = Array.from(new Set(
    myMessages
      .filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)
      .map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  ));

  // Add the active partner if not in history yet
  if (activePartnerId && !conversations.includes(activePartnerId)) {
    conversations.unshift(activePartnerId);
  }

  const activeMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === activePartnerId) ||
    (m.senderId === activePartnerId && m.receiverId === currentUser.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  // Helper to resize image to save localStorage space
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
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to jpeg 70%
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple size check (5MB)
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

  const getPartnerName = (id: string) => allUsers.find(u => u.id === id)?.anonymousName || id;

  // Mobile View: List vs Chat
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
            <p className="p-4 text-gray-400 text-center text-sm">{t('noConversations')}</p>
          ) : (
            conversations.map(id => (
              <div 
                key={id}
                onClick={() => setActivePartnerId(id)}
                className={`p-4 border-b cursor-pointer hover:bg-green-50 transition-colors flex items-center gap-3 ${activePartnerId === id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center