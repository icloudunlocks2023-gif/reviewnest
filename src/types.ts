export type UserRole = 'reviewer' | 'business_owner' | 'admin';

export type AccountLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  country: string;
  phoneNumber: string;
  balance: number;
  totalEarnings: number;
  completedReviewsCount: number;
  pendingWithdrawalsCount: number;
  accountLevel: AccountLevel;
  verified: boolean;
  twoFactorEnabled: boolean;
  suspended?: boolean; // Admin suspension
  restricted?: boolean; // Admin restriction from receiving jobs
  restrictionNotes?: string; // Optional notes for admin
  restrictionHistory?: { timestamp: string; action: string; notes?: string }[];
  invitedBy?: string; // Inviter User ID (for multi-tier referrals)
  referralBalance?: number; // Separate referral balance section
  lastLoginRewardClaimed?: string; // Timestamp of last claimed daily login reward
  badges?: string[]; // Achievement badges
  xp?: number; // User XP for leaderboards
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  website: string;
  description: string;
  logoUrl: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  description: string;
  reviewsNeeded: number;
  reviewsCompleted: number;
  rewardPerReview: number;
  status: 'active' | 'completed' | 'paused';
  totalBudget: number;
  durationDays?: number; // Campaign duration in days
  createdAt: string;
}

export interface ReviewJob {
  id: string;
  campaignId: string;
  reviewerId: string;
  reviewerName: string;
  businessId: string;
  businessName: string;
  rating: number;
  content: string;
  feedback: string; // Private constructive feedback to business owner
  status: 'pending' | 'approved' | 'rejected';
  rewardAmount: number;
  isSuspicious?: boolean; // Flagged as suspicious by Admin
  submittedAt: string;
  approvedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number; // Withdrawal Amount
  fee: number; // Processing Tax
  amountReceived: number; // Net amount received
  paymentMethod: string; // flexible method name
  details: string; // account info string representation
  status: 'pending' | 'awaiting_tax_payment' | 'tax_received' | 'processing' | 'paid' | 'rejected' | 'cancelled';
  requestedAt: string;
  feePaymentStatus?: 'unpaid' | 'verifying' | 'verified' | 'failed';
  feePaymentReference?: string;
  feeAmountUsd?: number;
  feeAmountKes?: number;
  taxPaidAmount?: number;
  taxPaidMethod?: string;
  destinationDetails?: Record<string, string>; // structured destination details
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  timestamp: string;
}

export interface CampaignPackage {
  id: string;
  name: string;
  reviewsCount: number;
  costPerReview: number;
}

export interface Referral {
  id: string;
  inviterId: string;
  invitedId: string;
  invitedName: string;
  level: 1 | 2 | 3;
  commissionEarned: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'new_job' | 'earnings_credited' | 'withdrawal_status' | 'campaign_update' | 'referral' | 'deposit_update';
  read: boolean;
  createdAt: string;
  depositDetails?: {
    amount: number;
    paymentMethod: string;
    paymentDetails: string;
    expiryDate?: string;
    referenceNumber?: string;
  };
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  status: 'Pending Review' | 'Payment Instructions Sent' | 'Awaiting Payment' | 'Under Verification' | 'Approved' | 'Rejected';
  paymentDetails?: string;
  adminNotes?: string;
  expiryDate?: string;
  referenceNumber?: string;
  requestedAt: string;
}
