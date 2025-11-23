import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Button, Input, Select, Card } from '../components/UI';
import { UserRole, User, CropItem } from '../types';
import { CROP_TYPES, LOCATIONS } from '../constants';
import { Copy, Check, Tractor, ShoppingBag, Plus, Trash2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, t } = useContext(AppContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [error, setError] = useState('');

  // Registration State
  const [formData, setFormData] = useState({
    realName: '',
    role: UserRole.FARMER,
    location: LOCATIONS[0],
  });

  // Multiple Items State
  const [items, setItems] = useState<CropItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: CROP_TYPES[0],
    price: '',
    quantity: '',
  });

  const cropOptions = CROP_TYPES.map(crop => ({
    value: crop,
    label: t(crop)
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(loginId.trim())) {
      setError(t('userIdNotFound'));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.name || !currentItem.price || !currentItem.quantity) return;

    const newItem: CropItem = {
      name: currentItem.name,
      price: Number(currentItem.price),
      area: formData.location,
      quantity: currentItem.quantity,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      name: CROP_TYPES[0],
      price: '',
      quantity: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleRegister = () => {
    if (!formData.realName) {
      setError("Please enter your real name.");
      return;
    }
    if (items.length === 0) {
      setError(t('addOneItem'));
      return;
    }

    const newId = `${formData.role.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: User = {
      id: newId,
      anonymousName: `${formData.role === UserRole.FARMER ? 'Farmer' : 'Vendor'}${Math.floor(Math.random() * 1000)}`,
      realName: formData.realName,
      role: formData.role,
      location: formData.location,
      items: items,
      ratings: [],
      trustScore: 5.0,
      joinedAt: Date.now()
    };

    register(newUser);
    alert(`${t('regSuccess')} ${t('anonymous')}: ${newId}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-800">{t('welcome')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <Card className="p-6 shadow-xl border-t-4 border-t-green-600">
          <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isRegistering ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-green-600'}`}
            >
              {t('login')}
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isRegistering ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-green-600'}`}
            >
              {t('register')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
               <span className="block w-1.5 h-1.5 bg-red-500 rounded-full" />
               {error}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                label={t('enterId')} 
                placeholder={t('idPlaceholder')}
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
              <Button fullWidth type="submit">
                {t('login')}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, role: UserRole.FARMER})}
                    className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === UserRole.FARMER ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'}`}
                  >
                     <Tractor size={24} />
                     <span className="font-medium text-sm">{t('farmer')}</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, role: UserRole.VENDOR})}
                    className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === UserRole.VENDOR ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200'}`}
                  >
                     <ShoppingBag size={24} />
                     <span className="font-medium text-sm">{t('vendor')}</span>
                  </div>
               </div>

               <Input 
                 label={t('realName')}
                 value={formData.realName}
                 onChange={e => setFormData({...formData, realName: e.target.value})}
               />

               <Select 
                 label={t('area')}
                 options={LOCATIONS}
                 value={formData.location}
                 onChange={e => setFormData({...formData, location: e.target.value})}
               />

               <div className="border-t pt-4 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{formData.role === UserRole.FARMER ? t('cropsGrown') : t('cropsNeeded')}</label>
                  
                  <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-3">
                    <Select 
                      options={cropOptions}
                      value={currentItem.name}
                      onChange={e => setCurrentItem({...currentItem, name: e.target.value})}
                      className="mb-0"
                    />
                    <div className="flex gap-2">
                      <Input 
                        placeholder={t('price')} 
                        type="number" 
                        value={currentItem.price}
                        onChange={e => setCurrentItem({...currentItem, price: e.target.value})}
                        className="mb-0"
                      />
                      <Input 
                        placeholder={t('quantity')} 
                        value={currentItem.quantity}
                        onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})}
                        className="mb-0"
                      />
                    </div>
                    <Button type="button" onClick={handleAddItem} variant="secondary" fullWidth className="py-2 text-sm">
                      <Plus size={16} /> {t('add')}
                    </Button>
                  </div>

                  {items.length > 0 && (
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border p-2 rounded-lg text-sm">
                          <span>{item.name} - ₹{item.price} ({item.quantity})</span>
                          <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               <Button fullWidth onClick={handleRegister} disabled={!formData.realName || items.length === 0}>
                 {t('register')}
               </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};