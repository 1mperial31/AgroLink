import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { storageService } from '../services/storageService';
import { UserRole, User } from '../types';
import { Card, Button, Select, Badge } from '../components/UI';
import { CROP_TYPES, LOCATIONS } from '../constants';
import { MapPin, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Matches: React.FC = () => {
  const { currentUser, t } = useContext(AppContext);
  const [filterCrop, setFilterCrop] = useState('');
  const [filterLoc, setFilterLoc] = useState('');

  if (!currentUser) return null;

  const allUsers = storageService.getUsers();
  const targetRole = currentUser.role === UserRole.FARMER ? UserRole.VENDOR : UserRole.FARMER;

  // Basic Matching Logic + Filters
  const filteredMatches = allUsers.filter(u => {
    if (u.role !== targetRole) return false;
    
    // Check filter overrides first
    if (filterCrop) {
      if (!u.items.some(i => i.name === filterCrop)) return false;
    }
    if (filterLoc) {
      if (u.location !== filterLoc) return false;
    }

    // If no filters, match based on user's own items
    if (!filterCrop && !filterLoc) {
      const myCrops = currentUser.items.map(i => i.name);
      const hasMatchingCrop = u.items.some(i => myCrops.includes(i.name));
      return hasMatchingCrop;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('findMatches')}</h1>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 bg-white border rounded-lg text-sm outline-none" 
            value={filterCrop} 
            onChange={e => setFilterCrop(e.target.value)}
          >
            <option value="">{t('allCrops')}</option>
            {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="px-3 py-2 bg-white border rounded-lg text-sm outline-none"
            value={filterLoc}
            onChange={e => setFilterLoc(e.target.value)}
          >
            <option value="">{t('allLocations')}</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map(match => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{match.anonymousName}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={14} />
                    {match.location}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star size={14} className="fill-current" />
                  {match.trustScore}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {match.items.map((item, idx) => (
                  <div key={idx} className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">{item.name}</p>
                      <p className="text-xs text-green-700">{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-800">₹{item.price}</p>
                      <p className="text-xs text-green-600">{t('perKg')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Link to={`/chat?with=${match.id}`} className="flex-1">
                  <Button fullWidth variant="primary" className="py-2 text-sm">
                    <MessageCircle size={18} />
                    {t('chat')}
                  </Button>
                </Link>
                <Link to={`/profile?id=${match.id}`} className="flex-1">
                  <Button fullWidth variant="outline" className="py-2 text-sm">
                    {t('profile')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredMatches.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <MapPin className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">{t('noMatchesCriteria')}</p>
          </div>
        )}
      </div>
    </div>
  );
};