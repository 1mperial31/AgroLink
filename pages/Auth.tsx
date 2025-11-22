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
      quantity