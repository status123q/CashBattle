
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface GamesListProps {
  user: User;
}

const GamesList: React.FC<GamesListProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const games = [
    { title: 'Scratch', icon: '🎁', route: '/scratch', color: 'bg-blue-600', type: 'Quick' },
    { title: 'Spin Wheel', icon: '🎡', route: '/spin', color: 'bg-purple-600', type: 'Quick' },
    { title: 'Ludo Battle', icon: '🎲', route: '/ludo', color: 'bg-emerald-600', type: 'Battle' },
    { title: 'Mines', icon: '💣', route: '/mines', color: 'bg-slate-700', type: 'Battle' },
    { title: 'Island Adventure', icon: '🏝️', route: '/island', color: 'bg-amber-600', type: 'Fun' },
    { title: 'Minesweeper', icon: '🚩', route: '/minesweeper', color: 'bg-indigo-600', type: 'Fun' },
    { title: 'Tap Ball', icon: '🎾', route: '/tapball', color: 'bg-pink-600', type: 'Fun' },
    { title: 'Brain Match', icon: '🧠', route: '/memory', color: 'bg-violet-600', type: 'Skill' },
    { title: 'Emoji Hunt', icon: '🧐', route: '/emojihunt', color: 'bg-orange-600', type: 'Skill' },
    { title: 'Balloon Pop', icon: '🎈', route: '/balloonpop', color: 'bg-red-600', type: 'Fun' },
  ];

  return (
    <div className="flex-1 bg-slate-950 pb-24 flex flex-col">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <h1 className="text-xl font-gaming font-bold text-white uppercase tracking-widest">Game Zone</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Play games to earn real cash</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {games.map((game, i) => (
            <button
              key={i}
              onClick={() => navigate(game.route)}
              className={`relative h-32 rounded-3xl p-4 flex flex-col justify-end items-start shadow-lg active:scale-95 transition-all overflow-hidden border border-white/5 ${game.color}`}
            >
              <div className="absolute -top-1 -right-1 text-5xl opacity-20 transform rotate-12">{game.icon}</div>
              <span className="text-[8px] bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full font-bold text-white mb-1 uppercase tracking-widest">
                {game.type}
              </span>
              <h3 className="text-white font-bold text-sm leading-tight">{game.title}</h3>
            </button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] text-center">
            <p className="text-slate-400 text-xs italic">"Gaming is not just a hobby, it's a lifestyle."</p>
        </div>
      </div>

      {/* Bottom Nav Sync */}
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

export default GamesList;
