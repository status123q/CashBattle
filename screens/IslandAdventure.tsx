
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, BattleState, Challenge } from '../types';

interface IslandProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (fee: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const IslandAdventure: React.FC<IslandProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const BOSS_HP = 40;
  const [hp, setHp] = useState(BOSS_HP);
  const [manualFee, setManualFee] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [battle, setBattle] = useState<BattleState>({
    isSearching: false,
    isBattleActive: false,
    entryFee: 0,
    userTime: 0,
    opponentTime: 0,
    opponentProgress: 0,
    isFinished: false,
    winner: null
  });

  const timerRef = useRef<any>(null);
  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Island Adventure Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      handleJoinBattle(location.state.challengeFee, true);
      setOpponentName(location.state.opponent || 'Rival');
    }
  }, [location.state]);

  const handleJoinBattle = (fee: number, isDirectJoin: boolean = false) => {
    if (isNaN(fee) || fee <= 0) return;
    
    const totalEffectiveRupees = user.deposit_balance + (user.current_coins / 100);
    if (totalEffectiveRupees < fee) {
      alert("Insufficient funds!");
      return;
    }

    if (isDirectJoin) {
      setBattle(prev => ({ ...prev, isSearching: true, entryFee: fee }));
      setTimeout(() => {
        if (onPayFee(fee)) {
          const oppTime = 8 + Math.random() * 5;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime }));
          startBattleTimer();
        }
      }, 1500);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          setOpponentName('Matched Adventurer');
          const oppTime = 8 + Math.random() * 5;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime, entryFee: fee }));
          startBattleTimer();
        }, 5000);
      }
    }
  };

  const startBattleTimer = () => {
    timerRef.current = setInterval(() => {
      setBattle(prev => {
        const newTime = prev.userTime + 0.1;
        const oppProg = Math.min(100, (newTime / prev.opponentTime) * 100);
        return { ...prev, userTime: newTime, opponentProgress: oppProg };
      });
    }, 100);
  };

  const handleAcceptChallenge = (c: Challenge) => {
    onRemoveChallenge(c.id);
    setOpponentName(c.creator_name);
    handleJoinBattle(c.entry_fee, true);
  };

  const handleTap = () => {
    if (!battle.isBattleActive || battle.isFinished) return;
    setHp(prev => {
      const newHp = prev - 1;
      if (newHp <= 0) handleFinish();
      return newHp;
    });
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const won = battle.userTime < battle.opponentTime;
    const reward = won ? Math.floor(battle.entryFee * 1.8 * 100) : 0;
    
    setBattle(prev => ({ ...prev, isFinished: true, winner: won ? 'user' : 'opponent' }));
    onRecordBattle('Island Adventure', battle.entryFee, won ? 'Win' : 'Loss', reward);

    if (won) {
      confetti({ particleCount: 150 });
    }
  };

  if (isPublishing) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-gaming text-white uppercase tracking-widest">Waiting for Opponent</h2>
        <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">₹{battle.entryFee} Island Challenge Live</p>
      </div>
    );
  }

  if (battle.isSearching) return <div className="flex-1 bg-slate-950 flex items-center justify-center font-gaming text-white">READY TO FIGHT...</div>;

  if (!battle.isBattleActive && !battle.isFinished) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase tracking-tighter">Island Battle Lobby</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Live Challenges</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No adventurers waiting.</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-slate-700" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-amber-500 text-[9px] font-bold uppercase">Stake: ₹{c.entry_fee}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcceptChallenge(c)}
                    className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-4 tracking-widest text-center">Custom Challenge</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[5, 10, 20, 50].map(fee => (
               <button key={fee} onClick={() => handleJoinBattle(fee)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={manualFee} 
              onChange={(e) => setManualFee(e.target.value)} 
              placeholder="Amount ₹" 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white text-xs outline-none focus:border-amber-500" 
            />
            <button 
              onClick={() => handleJoinBattle(parseInt(manualFee))} 
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-amber-900/20"
            >Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-sky-950 p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-10 bg-black/30 p-4 rounded-2xl">
        <div><p className="font-gaming text-white text-lg">{battle.userTime.toFixed(1)}s</p></div>
        <div className="font-gaming text-white text-xs uppercase tracking-widest">{opponentName} vs You</div>
        <div className="w-20"><div className="h-1.5 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${battle.opponentProgress}%` }}></div></div></div>
      </div>
      <div className="mb-12 text-center w-full">
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${(hp/BOSS_HP)*100}%` }}></div></div>
      </div>
      <button onClick={handleTap} className="w-56 h-56 bg-slate-800/50 rounded-full flex items-center justify-center text-9xl active:scale-90 relative">👾</button>
      {battle.isFinished && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center">
           <h2 className={`text-4xl font-gaming mb-6 ${battle.winner === 'user' ? 'text-amber-500' : 'text-red-500'}`}>{battle.winner === 'user' ? 'VICTORY' : 'DEFEATED'}</h2>
           <button onClick={() => navigate('/')} className="gradient-gold w-full py-5 rounded-2xl font-bold text-slate-950">HOME</button>
        </div>
      )}
    </div>
  );
};

export default IslandAdventure;
