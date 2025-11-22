import { User, Message, Rating, UserRole } from '../types';

const USERS_KEY = 'agrolink_users';
const MESSAGES_KEY = 'agrolink_messages';

// Helper to get data
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Helper to set data
const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  getUsers: (): User[] => getLocalData<User[]>(USERS_KEY, []),
  
  saveUser: (user: User): void => {
    const users = storageService.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    setLocalData(USERS_KEY, users);
  },

  getUserById: (id: string): User | undefined => {
    return storageService.getUsers().find(u => u.id === id);
  },

  getMessages: (): Message[] => getLocalData<Message[]>(MESSAGES_KEY, []),

  sendMessage: (msg: Message): void => {
    const messages = storageService.getMessages();
    messages.push(msg);
    setLocalData(MESSAGES_KEY, messages);
  },

  addRating: (targetUserId: string, rating: Rating): void => {
    const users = storageService.getUsers();
    const targetIndex = users.findIndex(u => u.id === targetUserId);
    if (targetIndex >= 0) {
      const user = users[targetIndex];
      user.ratings.push(rating);
      // Recalculate trust score
      const sum = user.ratings.reduce((acc, r) => acc + r.value, 0);
      user.trustScore = Number((sum / user.ratings.length).toFixed(1));
      users[targetIndex] = user;
      setLocalData(USERS_KEY, users);
    }
  },
  
  // Seed data for demo purposes if empty
  initDemoData: () => {
    const users = storageService.getUsers();
    if (users.length === 0) {
      const demoUsers: User[] = [
        {
          id: 'demo_farmer',
          anonymousName: 'Farmer001',
          realName: 'Ramesh Kumar',
          role: UserRole.FARMER,
          location: 'Punjab',
          items: [{ name: 'Wheat', price: 20, area: 'Punjab', quantity: '500kg' }],
          ratings: [{ fromUserId: 'sys', value: 5, comment: 'Great quality', timestamp: Date.now() }],
          trustScore: 5.0,
          joinedAt: Date.now()
        },
        {
          id: 'demo_vendor',
          anonymousName: 'Vendor99',
          realName: 'City Mart',
          role: UserRole.VENDOR,
          location: 'Maharashtra',
          items: [{ name: 'Wheat', price: 22, area: 'Punjab', quantity: '1000kg' }],
          ratings: [],
          trustScore: 0,
          joinedAt: Date.now()
        }
      ];
      setLocalData(USERS_KEY, demoUsers);
    }
  }
};