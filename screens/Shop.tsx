
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Product, RedeemRequest } from '../types';

interface ShopProps {
  user: User;
  onRedeem: (amount: number) => void;
}

const Shop: React.FC<ShopProps> = ({ user, onRedeem }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const CONVERSION_RATE = 100;

  useEffect(() => {
    // 100 coins = ₹1
    const mockProducts: Product[] = [
      { id: 'p1', title: '₹10 Google Play Code', coin_cost: 1000, icon_url: '🎮', is_active: true },
      { id: 'p2', title: '₹25 Google Play Code', coin_cost: 2500, icon_url: '🎮', is_active: true },
      { id: 'p3', title: '₹50 Google Play Code', coin_cost: 5000, icon_url: '🎮', is_active: true },
      { id: 'p4', title: '₹100 Google Play Code', coin_cost: 10000, icon_url: '🎮', is_active: true },
      { id: 'p5', title: 'Premium Battle Pass', coin_cost: 20000, icon_url: '🎟️', is_active: true },
    ];
    setProducts(mockProducts);
  }, []);

  const handleRedeem = (product: Product) => {
    if (user.current_coins < product.coin_cost) {
      setMessage({ text: 'Insufficient Coins! Keep playing to earn more.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    onRedeem(-product.coin_cost);

    const request: RedeemRequest = {
      request_id: 'REQ_' + Math.random().toString(36).substr(2, 9),
      user_id: user.uid,
      email: user.email,
      product_title: product.title,
      coin_cost: product.coin_cost,
      status: 'Pending',
      redeem_code: '',
      requested_at: Date.now()
    };

    const requests = JSON.parse(localStorage.getItem('redeem_requests') || '[]');
    requests.unshift(request);
    localStorage.setItem('redeem_requests', JSON.stringify(requests));

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift({
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.uid,
      type: 'Redeem',
      amount: -product.coin_cost,
      timestamp: Date.now(),
      description: `Redeemed ${product.title}`
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    setMessage({ text: 'Success! Your request is pending. Check email within 24h.', type: 'success' });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white">Redeem Shop</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-full">
             <span className="font-gaming font-bold text-amber-500">🪙 {user.current_coins}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase">≈ ₹{(user.current_coins / CONVERSION_RATE).toFixed(2)}</span>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="glass-card rounded-2xl p-5 flex items-center justify-between group hover:border-purple-500 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                {product.icon_url}
              </div>
              <div>
                <h3 className="text-white font-bold">{product.title}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-amber-500 text-sm font-gaming">{product.coin_cost} Coins</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">(₹{(product.coin_cost / CONVERSION_RATE).toFixed(2)})</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRedeem(product)}
              className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-purple-500 active:scale-95 transition-all shadow-lg shadow-purple-900/40"
            >
              REDEEM
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
        <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
          <span>📜</span> Economics
        </h4>
        <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
          <li>Standard conversion rate: 100 Coins = ₹1.00.</li>
          <li>Redemptions are processed manually for security.</li>
          <li>Codes are delivered directly to your profile and email.</li>
        </ul>
      </div>
    </div>
  );
};

export default Shop;
