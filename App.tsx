import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, Language, AppContextType } from './types';
import { storageService } from './services/storageService';
import { TRANSLATIONS } from './constants';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Assistant } from './pages/Assistant';

export const AppContext = React.createContext<AppContextType>({} as AppContextType);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);

  useEffect(() => {
    // Initialize local storage with demo data if empty
    storageService.initDemoData();
    
    // Check for active session
    const savedUserId = localStorage.getItem('agrolink_active_user');
    if (savedUserId) {
      const user = storageService.getUserById(savedUserId);
      if (user) setCurrentUser(user);
    }

    const savedLang = localStorage.getItem('agrolink_lang');
    if (savedLang) setLanguage(savedLang as Language);
  }, []);

  const login = (id: string) => {
    const user = storageService.getUserById(id);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('agrolink_active_user', user.id);
      return true;
    }
    return false;
  };

  const register = (user: User) => {
    storageService.saveUser(user);
    login(user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agrolink_active_user');
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agrolink_lang', lang);
  };

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      register, 
      language, 
      setLanguage: handleSetLanguage, 
      t 
    }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={currentUser ? <Dashboard /> : <Auth />} />
            
            {currentUser && (
              <>
                <Route path="/marketplace" element={<Matches />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/assistant" element={<Assistant />} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
