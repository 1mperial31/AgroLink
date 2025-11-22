export enum UserRole {
  FARMER = 'FARMER',
  VENDOR = 'VENDOR',
}

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
  BENGALI = 'bn',
  TAMIL = 'ta',
  TELUGU = 'te',
  KANNADA = 'kn',
  GUJARATI = 'gu',
  PUNJABI = 'pa',
  MALAYALAM = 'ml',
}

export interface CropItem {
  name: string;
  price: number; // Per kg/unit
  area: string;
  quantity: string;
  description?: string;
}

export interface Rating {
  fromUserId: string;
  value: number; // 1-5
  comment: string;
  timestamp: number;
}

export interface User {
  id: string;
  anonymousName: string; // e.g., Farmer123
  realName: string; // stored but not shown publicly
  role: UserRole;
  location: string;
  items: CropItem[]; // Crops grown (Farmer) or needed (Vendor)
  ratings: Rating[];
  trustScore: number; // Average rating
  joinedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  image?: string; // Base64 string for image
  timestamp: number;
  read: boolean;
}

export interface AppContextType {
  currentUser: User | null;
  login: (id: string) => boolean;
  logout: () => void;
  register: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
