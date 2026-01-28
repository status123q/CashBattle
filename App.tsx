
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import ScratchGame from './screens/ScratchGame';
import SpinWheel from './screens/SpinWheel';
import LudoGame from './screens/LudoGame';
import Shop from './screens/Shop';
import Profile from './screens/Profile';
import Login from './screens/Login';
import MinesGame from './screens/MinesGame';
import IslandAdventure from './screens/IslandAdventure';
import MinesweeperGame from './screens/MinesweeperGame';
import TapBallGame from './screens/TapBallGame';
import MemoryMatchGame from './screens/MemoryMatchGame';
import Deposit from './screens/Deposit';
import Withdrawal from './screens/Withdrawal';
import GamesList from './screens/GamesList';
import EmojiHunt from './screens/EmojiHunt';
import BalloonPop from './screens/BalloonPop';
import { User, BattleRecord, Challenge } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalChallenges, setGlobalChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cashbattle_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Initialize Lobby
    const savedChallenges = localStorage.getItem('global_challenges');
    if (savedChallenges) {
      setGlobalChallenges(JSON.parse(savedChallenges));
    } else {
      const seed: Challenge[] = [
        { id: 'c1', creator_id: 'bot1', creator_name: 'Rahul Kumar', creator_photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', game_title: 'Ludo Battle', entry_fee: 10, status: 'Open', created_at: Date.now() },
        { id: 'c2', creator_id: 'bot2', creator_name: 'Priya S.', creator_photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', game_title: 'Mines Battle', entry_fee: 50, status: 'Open', created_at: Date.now() },
      ];
      setGlobalChallenges(seed);
      localStorage.setItem('global_challenges', JSON.stringify(seed));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = JSON.parse(localStorage.getItem('global_challenges') || '[]');
      if (current.length < 8 && Math.random() > 0.5) {
        const botNames = ['Aryan', 'Deepak', 'Sonia', 'Vikram', 'Anjali', 'Karan', 'Meena', 'Rohan', 'Sneha'];
        const games = [
          'Ludo Battle', 'Mines Battle', 'Island Adventure Battle', 
          'Minesweeper Battle', 'Tap Ball Battle', 'Memory Match Battle',
          'Emoji Hunt Battle', 'Balloon Pop Battle'
        ];
        const fees = [10, 20, 50, 100];
        const newBotChallenge: Challenge = {
          id: 'bot_' + Math.random().toString(36).substr(2, 5),
          creator_id: 'bot_id',
          creator_name: botNames[Math.floor(Math.random() * botNames.length)],
          creator_photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
          game_title: games[Math.floor(Math.random() * games.length)],
          entry_fee: fees[Math.floor(Math.random() * fees.length)],
          status: 'Open',
          created_at: Date.now()
        };
        current.push(newBotChallenge);
        // Limit history size
        const trimmed = current.slice(-20);
        setGlobalChallenges(trimmed);
        localStorage.setItem('global_challenges', JSON.stringify(trimmed));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateChallenge = (gameTitle: string, fee: number) => {
    if (!user) return;
    const newChallenge: Challenge = {
      id: 'CHL_' + Math.random().toString(36).substr(2, 9),
      creator_id: user.uid,
      creator_name: user.name,
      creator_photo: user.photo_url,
      game_title: gameTitle,
      entry_fee: fee,
      status: 'Open',
      created_at: Date.now()
    };
    const current = JSON.parse(localStorage.getItem('global_challenges') || '[]');
    const updated = [...current, newChallenge];
    setGlobalChallenges(updated);
    localStorage.setItem('global_challenges', JSON.stringify(updated));
  };

  const handleRemoveChallenge = (id: string) => {
    const current = JSON.parse(localStorage.getItem('global_challenges') || '[]');
    const updated = current.filter((c: Challenge) => c.id !== id);
    setGlobalChallenges(updated);
    localStorage.setItem('global_challenges', JSON.stringify(updated));
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cashbattle_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cashbattle_user');
  };

  const updateUserBalance = (coinDelta: number, depositDelta: number = 0) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        current_coins: Math.max(0, prev.current_coins + coinDelta),
        deposit_balance: Math.max(0, prev.deposit_balance + depositDelta),
        total_earned_coins: coinDelta > 0 ? prev.total_earned_coins + coinDelta : prev.total_earned_coins
      };
      localStorage.setItem('cashbattle_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRecordBattle = (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => {
    if (!user) return;
    if (outcome === 'Win' && rewardCoins > 0) {
      updateUserBalance(rewardCoins, 0);
    }
    const record: BattleRecord = {
      id: 'BTL_' + Math.random().toString(36).substr(2, 9),
      game_title: gameTitle,
      entry_fee: entryFee,
      outcome: outcome,
      reward: rewardCoins,
      timestamp: Date.now()
    };
    const history = JSON.parse(localStorage.getItem('battle_history') || '[]');
    history.unshift(record);
    localStorage.setItem('battle_history', JSON.stringify(history.slice(0, 50)));
  };

  const handlePayBattleFee = (feeInRupees: number): boolean => {
    if (!user) return false;
    const totalValueInRupees = user.deposit_balance + (user.current_coins / 100);
    if (totalValueInRupees < feeInRupees) return false;
    let remainingToPay = feeInRupees;
    let newDeposit = user.deposit_balance;
    let newCoins = user.current_coins;
    if (newDeposit >= remainingToPay) {
      newDeposit -= remainingToPay;
      remainingToPay = 0;
    } else {
      remainingToPay -= newDeposit;
      newDeposit = 0;
    }
    if (remainingToPay > 0) {
      const coinCost = remainingToPay * 100;
      newCoins -= Math.floor(coinCost);
    }
    const updatedUser = { ...user, current_coins: newCoins, deposit_balance: newDeposit };
    setUser(updatedUser);
    localStorage.setItem('cashbattle_user', JSON.stringify(updatedUser));
    return true;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-400 font-gaming">CASHBATTLE PRO</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col bg-slate-950">
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard user={user} onUpdate={updateUserBalance} challenges={globalChallenges} onRemoveChallenge={handleRemoveChallenge} />} />
              <Route path="/games" element={<GamesList user={user} />} />
              <Route path="/deposit" element={<Deposit user={user} onDeposit={(amt) => updateUserBalance(0, amt)} />} />
              <Route path="/withdrawal" element={<Withdrawal user={user} onWithdraw={(coinAmt) => updateUserBalance(-coinAmt, 0)} />} />
              <Route path="/scratch" element={<ScratchGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} />} />
              <Route path="/spin" element={<SpinWheel user={user} onWin={(amt) => updateUserBalance(amt, 0)} />} />
              <Route path="/ludo" element={<LudoGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Ludo Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/mines" element={<MinesGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Mines Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/island" element={<IslandAdventure user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Island Adventure Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/minesweeper" element={<MinesweeperGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Minesweeper Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/tapball" element={<TapBallGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Tap Ball Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/memory" element={<MemoryMatchGame user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Memory Match Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/emojihunt" element={<EmojiHunt user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Emoji Hunt Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/balloonpop" element={<BalloonPop user={user} onWin={(amt) => updateUserBalance(amt, 0)} onPayFee={handlePayBattleFee} onRecordBattle={handleRecordBattle} onCreateChallenge={(fee) => handleCreateChallenge('Balloon Pop Battle', fee)} onRemoveChallenge={handleRemoveChallenge} challenges={globalChallenges} />} />
              <Route path="/shop" element={<Shop user={user} onRedeem={(amt) => updateUserBalance(amt, 0)} />} />
              <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
