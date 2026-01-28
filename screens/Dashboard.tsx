
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, Challenge } from '../types';

interface DashboardProps {
  user: User;
  onUpdate: (coins: number, deposit?: number) => void;
  challenges: Challenge[];
  onRemoveChallenge: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDailyModal, setShowDailyModal] = useState(false);
  const DAILY_REWARD_AMOUNT = 50; 
  const CONVERSION_RATE = 100;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastClaim = localStorage.getItem('last_daily_claim');
    if (lastClaim !== today && location.pathname === '/') {
      setTimeout(() => setShowDailyModal(true), 1000);
    }
  }, [location.pathname]);

  const handleClaimDaily = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('last_daily_claim', today);
    onUpdate(DAILY_REWARD_AMOUNT);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setShowDailyModal(false);
  };

  const GameCard = ({ title, icon, color, route, sub, isBattle }: { title: string, icon: string, color: string, route: string, sub?: string, isBattle?: boolean }) => (
    <button
      onClick={() => navigate(route)}
      className={`relative w-full overflow-hidden rounded-2xl p-5 flex flex-col items-start justify-end h-40 shadow-lg active:scale-95 transition-all group border border-white/5`}
      style={{ background: color }}
    >
      <div className="absolute top-4 right-4 text-3xl opacity-30 group-hover:scale-125 transition-transform">{icon}</div>
      <div className="z-10 text-left">
        {isBattle && <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold mb-1 inline-block">LIVE BATTLE</span>}
        <h3 className="text-lg font-gaming font-bold text-white mb-0.5">{title}</h3>
        <p className="text-white/70 text-[10px] uppercase font-bold">{sub || 'Win Cash'}</p>
      </div>
    </button>
  );

  return (
    <div className="flex-1 bg-slate-950 pb-24 overflow-y-auto">
      {showDailyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-xs rounded-[2.5rem] p-8 text-center border-amber-500/50 shadow-2xl">
            <div className="w-20 h-20 gradient-gold rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg animate-bounce">🪙</div>
            <h2 className="text-xl font-gaming font-bold text-white mb-2">DAILY BONUS</h2>
            <div className="bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-800">
              <span className="text-3xl font-gaming font-bold text-amber-500">+{DAILY_REWARD_AMOUNT}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Coins Added</p>
            </div>
            <button onClick={handleClaimDaily} className="w-full gradient-purple py-4 rounded-2xl font-bold text-white shadow-xl active:scale-95">CLAIM NOW</button>
          </div>
        </div>
      )}

      <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={user.photo_url} className="w-10 h-10 rounded-full border-2 border-amber-500 cursor-pointer" alt="p" onClick={() => navigate('/profile')} />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Pro Player</p>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{user.name}</p>
            </div>
          </div>
          <button onClick={() => navigate('/deposit')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 active:scale-95">
            + RECHARGE
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Win Coins</p>
            <div className="flex items-center justify-between">
              <span className="text-amber-500 font-gaming font-bold">🪙 {user.current_coins}</span>
              <span className="text-slate-400 text-[10px]">₹{(user.current_coins / CONVERSION_RATE).toFixed(1)}</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Deposit ₹</p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-gaming font-bold">₹{user.deposit_balance.toFixed(1)}</span>
              <span className="text-slate-400 text-[10px]">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 mb-8">
        <div className="gradient-gold p-6 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-slate-950">
            <h2 className="text-xl font-gaming font-bold mb-1">MEGA WIN LUDO</h2>
            <p className="text-[10px] font-bold opacity-70 mb-4">Pot: ₹50 | Win ₹90 | Instant Payout</p>
            <button 
              onClick={() => navigate('/ludo')} 
              className="bg-slate-950 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg active:scale-95"
            >
              Play Now
            </button>
          </div>
          <div className="absolute -bottom-2 -right-4 text-8xl opacity-10 rotate-12">🎲</div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div>
          <h2 className="text-xs font-gaming font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Solo Quick Cash</h2>
          <div className="grid grid-cols-2 gap-4">
            <GameCard title="Scratch" icon="🎁" color="#1e3a8a" route="/scratch" sub="Win Up to ₹5" />
            <GameCard title="Spin Win" icon="🎡" color="#4c1d95" route="/spin" sub="Daily Luck" />
          </div>
        </div>
        
        <div>
          <h2 className="text-xs font-gaming font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Multiplayer Battles</h2>
          <div className="grid grid-cols-1 gap-4">
            <GameCard title="Ludo Arena" icon="🎲" color="#064e3b" route="/ludo" sub="Live Player Lobby" isBattle />
            <GameCard title="Mines Gold" icon="💣" color="#334155" route="/mines" sub="High Stakes Strategy" isBattle />
          </div>
        </div>

        <div className="pb-12">
          <button 
            onClick={() => navigate('/games')}
            className="w-full flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-[2rem] group active:scale-95 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl group-hover:rotate-12 transition-transform">🕹️</div>
              <div className="text-left">
                <h3 className="text-white font-gaming font-bold text-sm">VIEW ALL GAMES</h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold">10+ Mini Games Available</p>
              </div>
            </div>
            <div className="text-amber-500 font-bold">➔</div>
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-around items-center z-50">
        <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-amber-500' : 'text-slate-500'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[9px] font-bold uppercase">Home</span>
        </button>
        <button onClick={() => navigate('/games')} className={`flex flex-col items-center gap-1 ${location.pathname === '/games' ? 'text-amber-500' : 'text-slate-500'}`}>
          <span className="text-xl">🎮</span>
          <span className="text-[9px] font-bold uppercase">Games</span>
        </button>
        <button onClick={() => navigate('/withdrawal')} className={`flex flex-col items-center gap-1 ${location.pathname === '/withdrawal' ? 'text-amber-500' : 'text-slate-500'}`}>
          <span className="text-xl">💸</span>
          <span className="text-[9px] font-bold uppercase">Withdraw</span>
        </button>
        <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-amber-500' : 'text-slate-500'}`}>
          <span className="text-xl">👤</span>
          <span className="text-[9px] font-bold uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
