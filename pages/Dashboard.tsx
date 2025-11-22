import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { Card, Badge } from '../components/UI';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Star, IndianRupee, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';

export const Dashboard: React.FC = () => {
  const { currentUser, t } = useContext(AppContext);

  // Calculate stats dynamically
  const users = storageService.getUsers();
  const matches = useMemo(() => {
    if (!currentUser) return [];
    const targetRole = currentUser.role === UserRole.FARMER ? UserRole.VENDOR : UserRole.FARMER;
    return users.filter(u => 
      u.role === targetRole && 
      currentUser.items.some(myItem => 
        u.items.some(theirItem => theirItem.name === myItem.name)
      )
    );
  }, [currentUser, users]);

  // Mock data for charts - In a real app, this would be historical data
  const priceData = [
    { name: 'Mon', price: 20 },
    { name: 'Tue', price: 22 },
    { name: 'Wed', price: 21 },
    { name: 'Thu', price: 24 },
    { name: 'Fri', price: 25 },
  ];

  if (!currentUser) return null;

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="p-4 flex items-center gap-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500">{t('welcomeBack')} {currentUser.anonymousName}</p>
        </div>
        <Badge color="green">{currentUser.role === UserRole.FARMER ? t('farmer') : t('vendor')}</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('potentialMatches')} value={matches.length} color="blue" />
        <StatCard icon={Star} label={t('trustScore')} value={currentUser.trustScore || "N/A"} color="yellow" />
        <StatCard icon={IndianRupee} label={t('listedItems')} value={currentUser.items.length} color="green" />
        <StatCard icon={TrendingUp} label={t('marketTrend')} value="+5%" color="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matching Users Preview */}
        <Card className="p-0">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{t('recentMatches')}</h3>
            <Link to="/marketplace" className="text-sm text-green-600 font-medium hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="divide-y">
            {matches.slice(0, 4).map(match => (
              <div key={match.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{match.anonymousName}</p>
                  <p className="text-xs text-gray-500">{match.location} • {match.role === UserRole.FARMER ? t('grows') : t('needs')} {match.items[0]?.name}</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-green-700">₹{match.items[0]?.price}/{t('perKg')}</p>
                   <span className="text-xs text-gray-400">{t('trust')}: {match.trustScore}★</span>
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {t('noMatches')}
              </div>
            )}
          </div>
        </Card>

        {/* Price Trend Chart */}
        <Card className="p-4 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">{t('priceTrend')} ({currentUser.items[0]?.name || 'General'})</h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="price" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};