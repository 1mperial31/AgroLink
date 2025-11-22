import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Store, MessageSquare, User, LogOut, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppContext } from '../App';
import { Language } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, language, setLanguage, t } = useContext(AppContext);
  const location = useLocation();
  
  // Initialize sidebar state from local storage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('agrolink_sidebar_collapsed');
    return stored === 'true';
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('agrolink_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
      >
        <Icon size={24} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
        <span className="mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Store className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-green-900 tracking-tight hidden sm:block">AgroLink</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-100 border-none text-sm rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none max-w-[120px] md:max-w-xs truncate"
            >
              <option value={Language.ENGLISH}>English</option>
              <option value={Language.HINDI}>हिंदी (Hindi)</option>
              <option value={Language.MARATHI}>मराठी (Marathi)</option>
              <option value={Language.BENGALI}>বাংলা (Bengali)</option>
              <option value={Language.TAMIL}>தமிழ் (Tamil)</option>
              <option value={Language.TELUGU}>తెలుగు (Telugu)</option>
              <option value={Language.KANNADA}>ಕನ್ನಡ (Kannada)</option>
              <option value={Language.GUJARATI}>ગુજરાતી (Gujarati)</option>
              <option value={Language.PUNJABI}>ਪੰਜਾਬੀ (Punjabi)</option>
              <option value={Language.MALAYALAM}>മലയാളം (Malayalam)</option>
            </select>
            
            {currentUser && (
               <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 md:hidden">
                 <LogOut size={20} />
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      {currentUser && (
        <div className={`hidden md:flex fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 text-gray-500 hover:text-green-600 shadow-sm hover:shadow-md transition-all z-50"
            title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
             <Link to="/" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : ''}`} title={t('dashboard')}>
                <LayoutDashboard size={22} className={`flex-shrink-0 ${location.pathname === '/' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}`} /> 
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('dashboard')}</span>
             </Link>
             
             <Link to="/marketplace" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/marketplace' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : ''}`} title={t('findMatches')}>
                <Store size={22} className={`flex-shrink-0 ${location.pathname === '/marketplace' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}`} />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('findMatches')}</span>
             </Link>
             
             <Link to="/chat" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/chat' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : ''}`} title={t('chat')}>
                <MessageSquare size={22} className={`flex-shrink-0 ${location.pathname === '/chat' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}`} />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('chat')}</span>
             </Link>
             
             <Link to="/assistant" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/assistant' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : ''}`} title={t('assistant')}>
                <Sparkles size={22} className={`flex-shrink-0 ${location.pathname === '/assistant' ? 'text-purple-600' : 'text-purple-500 group-hover:text-purple-600'}`} />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('assistant')}</span>
             </Link>
             
             <Link to="/profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/profile' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : ''}`} title={t('profile')}>
                <User size={22} className={`flex-shrink-0 ${location.pathname === '/profile' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'}`} />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('profile')}</span>
             </Link>
          </div>
          
          <div className="p-3 border-t border-gray-100">
            <button onClick={logout} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all duration-200 group ${isCollapsed ? 'justify-center' : 'text-left'}`} title={t('logout')}>
              <LogOut size={22} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-300 ease-in-out ${currentUser ? (isCollapsed ? 'md:ml-20' : 'md:ml-64') : ''}`}>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
          <div className="flex justify-around items-center h-16">
            <NavItem to="/" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem to="/marketplace" icon={Store} label={t('findMatches')} />
            <NavItem to="/assistant" icon={Sparkles} label="AgroBot" />
            <NavItem to="/chat" icon={MessageSquare} label={t('chat')} />
            <NavItem to="/profile" icon={User} label={t('profile')} />
          </div>
        </nav>
      )}
    </div>
  );
};