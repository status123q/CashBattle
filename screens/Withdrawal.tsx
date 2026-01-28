
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface WithdrawalProps {
  user: User;
  onWithdraw: (amount: number) => void;
}

const Withdrawal: React.FC<WithdrawalProps> = ({ user, onWithdraw }) => {
  const navigate = useNavigate();
  const [coinInput, setCoinInput] = useState<string>('');
  const CONVERSION_RATE = 100;
  const MIN_WITHDRAWAL_COINS = 500; // ₹5 minimum

  const coins = parseInt(coinInput) || 0;
  const rupeeValue = coins / CONVERSION_RATE;

  const handleWithdraw = () => {
    if (coins < MIN_WITHDRAWAL_COINS) {
      alert(`Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins (₹${MIN_WITHDRAWAL_COINS/CONVERSION_RATE})`);
      return;
    }
    if (user.current_coins < coins) {
      alert("Insufficient earned coins for this withdrawal!");
      return;
    }

    onWithdraw(coins);
    
    const req = JSON.parse(localStorage.getItem('redeem_requests') || '[]');
    req.unshift({
      request_id: 'REQ_' + Date.now(),
      user_id: user.uid,
      product_title: `Redeem ₹${rupeeValue.toFixed(2)}`,
      coin_cost: coins,
      status: 'Pending',
      requested_at: Date.now()
    });
    localStorage.setItem('redeem_requests', JSON.stringify(req));

    alert(`Successfully requested ₹${rupeeValue.toFixed(2)} withdrawal! Will be processed within 24 hours.`);
    navigate('/');
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col pb-24">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
        <h1 className="text-xl font-gaming font-bold text-white uppercase tracking-tighter">Withdraw Cash</h1>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 mb-8 shadow-xl">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Available to Withdraw</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-gaming font-bold text-amber-500">🪙 {user.current_coins}</span>
          <span className="text-slate-500 font-bold text-sm mb-1">(₹{(user.current_coins / CONVERSION_RATE).toFixed(2)})</span>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-8 border-amber-500/20 shadow-2xl">
        <h2 className="text-xs font-gaming text-slate-400 uppercase tracking-widest mb-6 text-center">Enter Coins to Redeem</h2>
        
        <div className="relative mb-8">
          <input 
            type="number" 
            value={coinInput}
            onChange={(e) => setCoinInput(e.target.value)}
            placeholder="0000"
            className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-amber-500/50 rounded-2xl py-5 text-center text-4xl font-gaming text-amber-500 outline-none transition-all placeholder:text-slate-800"
          />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            Coins
          </div>
        </div>

        <div className="flex flex-col items-center mb-10">
          <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">You will receive</p>
          <div className="text-4xl font-gaming text-white">
             ₹<span className="text-emerald-400">{rupeeValue.toFixed(2)}</span>
          </div>
          <p className="text-[8px] text-slate-600 font-bold uppercase mt-2">100 Coins = ₹1.00</p>
        </div>

        <button 
          onClick={handleWithdraw}
          className="w-full gradient-gold py-4 rounded-2xl font-bold text-slate-950 shadow-xl active:scale-95 transition-transform disabled:opacity-50"
          disabled={coins === 0}
        >
          REDEEM TO GOOGLE PLAY
        </button>
      </div>

      <div className="mt-auto p-4 bg-slate-900/30 rounded-2xl border border-slate-900 flex items-center gap-4">
        <span className="text-3xl opacity-50">🛡️</span>
        <div className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed">
          Payments are processed daily at 10:00 AM IST. Ensure your profile details are correct.
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
