
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, BattleState, Challenge } from '../types';

interface TapBallProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (fee: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const TapBallGame: React.FC<TapBallProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const TARGET_COUNT = 15;
  const [score, setScore] = useState(0);
  const [ballPos, setBallPos] = useState({ top: '50%', left: '50%' });
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
  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Tap Ball Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      handleJoinBattle(location.state.challengeFee, true);
      setOpponentName(location.state.opponent || 'Speedster');
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
          moveBall();
          const oppTime = 7 + Math.random() * 5;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime }));
          startTimer();
        }
      }, 1500);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          moveBall();
          const oppTime = 7 + Math.random() * 5;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime, entryFee: fee }));
          startTimer();
        }, 5000);
      }
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setBattle(prev => {
        const newTime = prev.userTime + 0.1;
        return { ...prev, userTime: newTime, opponentProgress: Math.min(100, (newTime / prev.opponentTime) * 100) };
      });
    }, 100);
  };

  const handleAcceptChallenge = (c: Challenge) => {
    onRemoveChallenge(c.id);
    setOpponentName(c.creator_name);
    handleJoinBattle(c.entry_fee, true);
  };

  const moveBall = () => {
    const t = Math.random() * 70 + 15;
    const l = Math.random() * 70 + 15;
    setBallPos({ top: `${t}%`, left: `${l}%` });
  };

  const handleTap = () => {
    if (!battle.isBattleActive || battle.isFinished) return;
    setScore(s => {
      const newVal = s + 1;
      if (newVal >= TARGET_COUNT) handleFinish();
      else moveBall();
      return newVal;
    });
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const won = battle.userTime < battle.opponentTime;
    const reward = won ? Math.floor(battle.entryFee * 1.8 * 100) : 0;
    
    setBattle(prev => ({ ...prev, isFinished: true, winner: won ? 'user' : 'opponent' }));
    onRecordBattle('Tap Ball Battle', battle.entryFee, won ? 'Win' : 'Loss', reward);

    if (won) confetti({ particleCount: 150 });
  };

  if (isPublishing) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-gaming text-white uppercase tracking-widest">Waiting for Rival</h2>
        <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">₹{battle.entryFee} Tap Battle Published</p>
      </div>
    );
  }

  if (battle.isSearching) return <div className="flex-1 bg-slate-950 flex items-center justify-center font-gaming text-white text-2xl animate-pulse">SEARCHING...</div>;

  if (!battle.isBattleActive && !battle.isFinished) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase">Tap Ball Lobby</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Live Speed Battles</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No fast fingers here yet.</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-slate-700" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-pink-500 text-[9px] font-bold uppercase">Stake: ₹{c.entry_fee}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcceptChallenge(c)}
                    className="bg-pink-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-4 tracking-widest text-center">Challenge Others</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[5, 10, 20, 50].map(fee => (
               <button key={fee} onClick={() => handleJoinBattle(fee)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-pink-500 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={manualFee} onChange={(e) => setManualFee(e.target.value)} placeholder="₹" className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white text-xs outline-none" />
            <button onClick={() => handleJoinBattle(parseInt(manualFee))} className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase">Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center relative overflow-hidden">
      <div className="w-full flex justify-between items-center z-50 bg-slate-900/50 p-4 rounded-3xl">
        <div className="text-center text-white"><p className="font-gaming text-lg">{battle.userTime.toFixed(1)}s</p></div>
        <div className="text-center text-white font-gaming text-xs uppercase tracking-widest">{opponentName} vs You</div>
        <div className="text-center text-white"><p className="font-gaming text-lg text-pink-500">{score}/{TARGET_COUNT}</p></div>
      </div>
      <button onClick={handleTap} className="absolute w-24 h-24 bg-pink-500 rounded-full shadow-lg border-4 border-pink-300 transition-all active:scale-75 z-10" style={{ top: ballPos.top, left: ballPos.left }}></button>
      {battle.isFinished && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8">
           <h2 className={`text-4xl font-gaming mb-8 ${battle.winner === 'user' ? 'text-pink-500' : 'text-slate-500'}`}>{battle.winner === 'user' ? 'VICTORY' : 'LOST'}</h2>
           <button onClick={() => navigate('/')} className="gradient-gold w-full py-5 rounded-2xl font-bold">HOME</button>
        </div>
      )}
    </div>
  );
};

export default TapBallGame;
