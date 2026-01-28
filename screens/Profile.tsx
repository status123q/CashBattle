
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Transaction, RedeemRequest, BattleRecord } from '../types';

interface ProfileProps { user: User; onLogout: () => void; }

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<RedeemRequest[]>([]);
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'requests' | 'battles'>('history');
  const CONVERSION_RATE = 100;

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
    const savedRequests = JSON.parse(localStorage.getItem('redeem_requests') || '[]');
    setRedeemRequests(savedRequests);
    const savedBattles = JSON.parse(localStorage.getItem('battle_history') || '[]');
    setBattleHistory(savedBattles);
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Rejected': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col pb-24 overflow-y-auto">
      {/* Profile Header */}
      <div className="gradient-purple p-8 rounded-b-[3rem] text-center relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/')} className="text-white text-2xl">←</button>
        </div>
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-amber-500 mx-auto mb-4 overflow-hidden shadow-2xl">
            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-gaming font-bold text-white">{user.name}</h2>
          <p className="text-purple-200 text-sm mb-4 opacity-70">{user.email}</p>
          
          <div className="flex justify-center gap-4">
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 min-w-[100px]">
              <p className="text-[10px] uppercase text-purple-300 font-bold">Earned</p>
              <p className="font-gaming text-amber-500 text-xs">🪙 {user.total_earned_coins}</p>
              <p className="text-[9px] text-slate-400 font-bold">≈ ₹{(user.total_earned_coins / CONVERSION_RATE).toFixed(2)}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 min-w-[100px]">
              <p className="text-[10px] uppercase text-purple-300 font-bold">Balance</p>
              <p className="font-gaming text-amber-500 text-xs">🪙 {user.current_coins}</p>
              <p className="text-[9px] text-slate-400 font-bold">≈ ₹{(user.current_coins / CONVERSION_RATE).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-8">
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 shadow-inner overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
              activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            HISTORY
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
              activeTab === 'battles' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            BATTLES
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
              activeTab === 'requests' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            REDEEMS
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-600 italic">No activity yet. Go battle!</div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="glass-card p-4 rounded-2xl flex items-center justify-between border-slate-800/50 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      t.amount > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {t.type === 'Scratch' ? '🎁' : t.type === 'Spin' ? '🎡' : t.type === 'Ludo' ? '🎲' : '🛒'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{t.type}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{formatDate(t.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-gaming font-bold ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.amount > 0 ? `+${t.amount}` : t.amount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'battles' && (
          <div className="space-y-3">
            {battleHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-600 italic">No battle records found. Play a game to see history!</div>
            ) : (
              battleHistory.map(b => (
                <div key={b.id} className="glass-card p-4 rounded-2xl border-slate-800/50 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-white font-bold text-sm uppercase tracking-tighter">{b.game_title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      b.outcome === 'Win' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>
                      {b.outcome.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                    <div>Entry: ₹{b.entry_fee}</div>
                    <div>{formatDate(b.timestamp)}</div>
                  </div>
                  {b.outcome === 'Win' && (
                    <div className="mt-2 text-right">
                      <span className="text-amber-500 font-gaming text-xs">REWARD: 🪙 {b.reward}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {redeemRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-600 italic">No redeems yet.</div>
            ) : (
              redeemRequests.map(req => (
                <div key={req.request_id} className="glass-card p-4 rounded-2xl border-slate-800/50 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-sm">{req.product_title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{formatDate(req.requested_at)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-12 px-6 space-y-3">
        <button onClick={() => window.location.href = 'mailto:support@cashbattle.com'} className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between group">
          <span className="flex items-center gap-3"><span>📧</span> Contact Support</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>
        <button onClick={onLogout} className="w-full p-4 rounded-2xl bg-red-900/10 border border-red-900/30 text-red-500 font-bold hover:bg-red-900/20 transition-colors">
          LOGOUT ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default Profile;
