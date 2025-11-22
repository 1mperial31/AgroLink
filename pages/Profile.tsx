import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { storageService } from '../services/storageService';
import { Card, Button, Badge, Select, Input } from '../components/UI';
import { useLocation } from 'react-router-dom';
import { UserRole, Rating, CropItem } from '../types';
import { Star, MapPin, Shield, AlertTriangle, Plus, X, Check, Edit2, Trash2, Save } from 'lucide-react';
import { CROP_TYPES, LOCATIONS } from '../constants';

export const Profile: React.FC = () => {
  const { currentUser, login, t } = useContext(AppContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profileId = searchParams.get('id');

  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Add Item State
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: CROP_TYPES[0], price: '', quantity: '' });

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    realName: '',
    location: ''
  });

  if (!currentUser) return null;

  const isOwnProfile = !profileId || profileId === currentUser.id;
  const user = isOwnProfile ? currentUser : storageService.getUserById(profileId!);

  useEffect(() => {
    if (user && isOwnProfile) {
      setEditFormData({
        realName: user.realName,
        location: user.location
      });
    }
  }, [user, isOwnProfile]);

  if (!user) return <div>User not found</div>;

  const handleRate = () => {
    if (!user.id) return;
    const newRating: Rating = {
      fromUserId: currentUser.id,
      value: ratingValue,
      comment: ratingComment,
      timestamp: Date.now()
    };
    storageService.addRating(user.id, newRating);
    window.location.reload(); // Simple refresh to show new data
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.quantity || !currentUser) return;

    const itemToAdd: CropItem = {
      name: newItem.name,
      price: Number(newItem.price),
      quantity: newItem.quantity,
      area: currentUser.location
    };

    const updatedUser = { ...currentUser, items: [...currentUser.items, itemToAdd] };
    storageService.saveUser(updatedUser);
    login(currentUser.id); // Refresh context
    
    setIsAdding(false);
    setNewItem({ name: CROP_TYPES[0], price: '', quantity: '' });
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      realName: editFormData.realName,
      location: editFormData.location
    };
    storageService.saveUser(updatedUser);
    login(currentUser.id); // Refresh context
    setIsEditing(false);
  };

  const handleDeleteItem = (index: number) => {
    if (!currentUser) return;
    if (window.confirm(t('confirmDelete'))) {
      const newItems = [...currentUser.items];
      newItems.splice(index, 1);
      const updatedUser = { ...currentUser, items: newItems };
      storageService.saveUser(updatedUser);
      login(currentUser.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <Card className="overflow-visible">
        <div className="bg-green-600 h-32 w-full rounded-t-2xl relative">
           <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {user.anonymousName.charAt(0)}
                </div>
              </div>
           </div>
        </div>
        <div className="pt-16 px-6 pb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {user.anonymousName}
                <Badge color={user.role === UserRole.FARMER ? 'green' : 'blue'}>{user.role === UserRole.FARMER ? t('farmer') : t('vendor')}</Badge>
              </h1>
              
              {isEditing ? (
                <div className="mt-4 space-y-3 max-w-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Input 
                    label={t('realName')} 
                    value={editFormData.realName}
                    onChange={(e) => setEditFormData({...editFormData, realName: e.target.value})}
                    className="bg-white"
                  />
                  <Select 
                    label={t('area')}
                    options={LOCATIONS}
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="py-2 text-sm" variant="primary">
                      <Save size={16} /> {t('save')}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} className="py-2 text-sm" variant="secondary">
                      <X size={16} /> {t('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-gray-600 mt-2 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {user.location}</span>
                  <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star size={16} className="fill-current" /> {user.trustScore} / 5.0</span>
                </div>
              )}
            </div>
            
            {isOwnProfile ? (
              !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                >
                  <Edit2 size={16} /> {t('editProfile')}
                </button>
              )
            ) : (
               <button className="text-red-500 text-xs flex items-center gap-1 hover:underline">
                 <AlertTriangle size={12} /> {t('report')}
               </button>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h3 className="font-bold text-gray-800">{t('productInfo')}</h3>
                {isOwnProfile && !isAdding && (
                  <button onClick={() => setIsAdding(true)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1">
                    <Plus size={12} /> {t('add')}
                  </button>
                )}
              </div>

              {/* Add Item Form */}
              {isAdding && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                   <p className="text-xs font-bold text-gray-500 mb-2">{t('newItem')}</p>
                   <div className="space-y-2">
                     <Select 
                       options={CROP_TYPES} 
                       className="py-1 text-sm mb-0" 
                       value={newItem.name}
                       onChange={e => setNewItem({...newItem, name: e.target.value})}
                     />
                     <div className="flex gap-2">
                       <Input 
                         placeholder={t('priceLabel')}
                         type="number" 
                         className="py-1 text-sm mb-0"
                         value={newItem.price}
                         onChange={e => setNewItem({...newItem, price: e.target.value})}
                        />
                       <Input 
                         placeholder={t('qtyLabel')} 
                         className="py-1 text-sm mb-0" 
                         value={newItem.quantity}
                         onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                        />
                     </div>
                     <div className="flex gap-2 pt-1">
                       <Button onClick={handleAddItem} className="flex-1 py-1 text-sm" variant="primary"><Check size={14} /> {t('save')}</Button>
                       <Button onClick={() => setIsAdding(false)} className="flex-1 py-1 text-sm" variant="secondary"><X size={14} /> {t('cancel')}</Button>
                     </div>
                   </div>
                </div>
              )}

              {user.items.map((item, i) => (
                <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg group relative">
                  <p className="text-xs text-gray-500 uppercase">{t('cropLabel')}</p>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{t('priceLabel')}</p>
                      <p className="font-medium text-sm">₹{item.price}/{t('perKg')}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase">{t('qtyLabel')}</p>
                       <p className="font-medium text-sm">{item.quantity}</p>
                    </div>
                  </div>
                  
                  {/* Delete Button for Items */}
                  {isOwnProfile && (
                    <button 
                      onClick={() => handleDeleteItem(i)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                      title={t('deleteItem')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {user.items.length === 0 && <p className="text-gray-400 text-sm italic">{t('noItems')}</p>}
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">{t('trustSafety')}</h3>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                   <Shield size={16} /> {t('verifiedMember')} {new Date(user.joinedAt).getFullYear()}
                 </div>
                 <p className="text-sm text-gray-600">
                   {user.ratings.length} {t('reviews')}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{t('reviews')}</h2>
        
        {!isOwnProfile && (
          <Card className="p-4 bg-gray-50">
             <h3 className="text-sm font-bold mb-2">{t('rate')}</h3>
             <div className="flex gap-2 mb-3">
               {[1,2,3,4,5].map(star => (
                 <button key={star} onClick={() => setRatingValue(star)} className={`transition-transform hover:scale-110 ${ratingValue >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                   <Star size={24} className="fill-current" />
                 </button>
               ))}
             </div>
             <textarea 
               className="w-full p-2 rounded-lg border mb-2 text-sm" 
               rows={2} 
               placeholder={t('writeReview')}
               value={ratingComment}
               onChange={e => setRatingComment(e.target.value)}
             />
             <Button onClick={handleRate} className="py-1 text-sm">{t('submitReview')}</Button>
          </Card>
        )}

        {user.ratings.map((r, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex justify-between mb-1">
              <div className="flex gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < r.value ? "fill-current" : "text-gray-200"} />
                ))}
              </div>
              <span className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700 text-sm">"{r.comment}"</p>
          </Card>
        ))}
        {user.ratings.length === 0 && <p className="text-gray-400 text-sm">{t('noReviews')}</p>}
      </div>
    </div>
  );
};