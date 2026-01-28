
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, Challenge } from '../types';

interface LudoGameProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (amount: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const LudoGame: React.FC<LudoGameProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [battleJoined, setBattleJoined] = useState(false);
  const [entryFee, setEntryFee] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [manualFeeInput, setManualFeeInput] = useState('');
  const [opponentName, setOpponentName] = useState('Opponent');

  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Ludo Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      setEntryFee(location.state.challengeFee);
      setOpponentName(location.state.opponent || 'Pro Player');
      startBattle(location.state.challengeFee, true);
    }
  }, [location.state]);

  const startBattle = (fee: number, isDirectJoin: boolean = false) => {
    if (isNaN(fee) || fee <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const totalEffectiveRupees = user.deposit_balance + (user.current_coins / 100);
    
    if (totalEffectiveRupees < fee) {
      const needed = (fee - totalEffectiveRupees).toFixed(2);
      if (confirm(`Insufficient Balance!\nYou need ₹${needed} more to join this ₹${fee} battle.\n\nGo to Deposit?`)) {
        navigate('/deposit');
      }
      return;
    }

    setEntryFee(fee);
    
    if (isDirectJoin) {
      setIsSearching(true);
      setTimeout(() => {
        if (onPayFee(fee)) {
          setIsSearching(false);
          setBattleJoined(true);
        }
      }, 1500);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          setBattleJoined(true);
          setOpponentName('Matched Player');
        }, 6000);
      }
    }
  };

  const handleAcceptChallenge = (c: Challenge) => {
    onRemoveChallenge(c.id);
    setOpponentName(c.creator_name);
    startBattle(c.entry_fee, true);
  };

  useEffect(() => {
    let timer: any;
    if (battleJoined && !isGameOver) {
      timer = setInterval(() => {
        setSeconds(s => {
          if (s >= 15) {
            setIsGameOver(true);
            const winAmtInCoins = Math.floor(entryFee * 1.8 * 100);
            onRecordBattle('Ludo Battle', entryFee, 'Win', winAmtInCoins);
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleJoined, isGameOver, entryFee]);

  if (isPublishing) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-12">
          <div className="w-24 h-24 border-4 border-amber-500/20 rounded-full flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-[8px] font-bold px-2 py-1 rounded-lg animate-pulse">LOBBY</div>
        </div>
        <h2 className="text-xl font-gaming text-white mb-2 uppercase">Published in Ludo Lobby</h2>
        <p className="text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] mb-8">Waiting for opponent to accept ₹{entryFee} challenge...</p>
        <div className="glass-card p-4 rounded-2xl w-full max-w-xs">
           <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Real-Time Syncing</p>
           <ul className="text-left text-[9px] text-slate-500 space-y-1">
             <li>• Your challenge is visible to all Ludo players</li>
             <li>• Battle starts as soon as someone clicks 'Accept'</li>
             <li>• Prize: ₹{(entryFee * 1.8).toFixed(1)}</li>
           </ul>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-gaming text-white mb-2 uppercase">Entering Game...</h2>
        <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest tracking-tighter">Opponent: {opponentName}</p>
      </div>
    );
  }

  if (!battleJoined) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase tracking-tighter">Ludo Arena Lobby</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Open Challenges</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No active Ludo challenges.</p>
                <p className="text-slate-700 text-[9px] uppercase mt-1">Be the first to create one!</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-center justify-between animate-in slide-in-from-right-2">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-slate-700" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-amber-500 text-[9px] font-bold uppercase">Prize: ₹{(c.entry_fee * 1.8).toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-gaming text-xs font-bold mb-1">₹{c.entry_fee}</p>
                    <button 
                      onClick={() => handleAcceptChallenge(c)}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-4 tracking-widest text-center">Or Create Your Own Challenge</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[10, 50, 100, 200].map(fee => (
               <button key={fee} onClick={() => startBattle(fee)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left hover:border-amber-500/50 transition-all">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={manualFeeInput}
              onChange={(e) => setManualFeeInput(e.target.value)}
              placeholder="Custom Amount ₹" 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white text-xs outline-none focus:border-purple-500" 
            />
            <button 
              onClick={() => startBattle(parseInt(manualFeeInput))}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-purple-900/20"
            >Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900 flex flex-col relative">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="font-gaming text-[10px] text-white uppercase font-bold">{opponentName} vs You</div>
        </div>
        <div className="text-white font-bold text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
           {15 - seconds > 0 ? `00:${15 - seconds < 10 ? '0' : ''}${15 - seconds}` : 'DONE'}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-white relative">
        <iframe 
          title="Ludo Game"
          src="https://html5games.com/Game/Ludo-Hero/88bdc359-c26e-41eb-8c65-224422506b3d" 
          className="w-full h-full border-none" 
        />
      </div>
      {isGameOver && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
           <div className="text-7xl mb-4 text-amber-500 drop-shadow-2xl">🏆</div>
           <h2 className="text-4xl font-gaming text-amber-500 mb-2">VICTORY!</h2>
           <p className="text-white text-xl font-gaming mb-10 uppercase">You Won 🪙 {Math.floor(entryFee * 1.8 * 100)}</p>
           <button onClick={() => navigate('/')} className="gradient-gold text-slate-950 w-full py-5 rounded-2xl font-bold text-lg shadow-2xl uppercase tracking-widest">Back to Hub</button>
        </div>
      )}
    </div>
  );
};

export default LudoGame;
