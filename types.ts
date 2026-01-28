
export interface User {
  uid: string;
  name: string;
  email: string;
  photo_url: string;
  phone_number?: string;
  current_coins: number; // This is the winning balance
  deposit_balance: number; // Real money deposited (₹)
  total_earned_coins: number;
  created_at: number;
}

export type TransactionType = 'Scratch' | 'Spin' | 'Ludo' | 'Redeem' | 'Deposit' | 'Battle_Entry' | 'Battle_Win';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  timestamp: number;
  description: string;
}

export interface BattleRecord {
  id: string;
  game_title: string;
  entry_fee: number;
  outcome: 'Win' | 'Loss' | 'Draw';
  reward: number;
  timestamp: number;
}

export interface Challenge {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_photo: string;
  game_title: string;
  entry_fee: number;
  status: 'Open' | 'Matched' | 'Full';
  created_at: number;
}

export interface Product {
  id: string;
  title: string;
  coin_cost: number;
  icon_url: string;
  is_active: boolean;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RedeemRequest {
  request_id: string;
  user_id: string;
  email: string;
  product_title: string;
  coin_cost: number;
  status: RequestStatus;
  redeem_code: string;
  requested_at: number;
}

export interface BattleState {
  isSearching: boolean;
  isBattleActive: boolean;
  entryFee: number;
  userTime: number;
  opponentTime: number;
  opponentProgress: number;
  isFinished: boolean;
  winner: 'user' | 'opponent' | null;
}
