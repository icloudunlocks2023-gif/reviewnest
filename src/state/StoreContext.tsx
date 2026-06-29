import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, Campaign, ReviewJob, WithdrawalRequest, SecurityLog, UserRole, AccountLevel, CampaignPackage, Referral, Notification, DepositRequest } from '../types';
import { INITIAL_USERS, INITIAL_BUSINESSES, INITIAL_CAMPAIGNS, INITIAL_REVIEWS, INITIAL_WITHDRAWALS } from '../initialData';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  businesses: Business[];
  campaigns: Campaign[];
  reviews: ReviewJob[];
  withdrawals: WithdrawalRequest[];
  logs: SecurityLog[];
  theme: 'dark' | 'light';
  campaignPackages: CampaignPackage[];
  referrals: Referral[];
  notifications: Notification[];
  toggleTheme: () => void;
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  register: (fullName: string, email: string, role: UserRole, country: string, phone: string, invitedByEmail?: string) => boolean;
  updateUserSecurity: (twoFactor: boolean, verified: boolean) => void;
  addBusiness: (name: string, category: string, website: string, description: string, logoUrl: string) => void;
  approveBusiness: (id: string, status: 'approved' | 'rejected') => void;
  createCampaign: (businessId: string, reviewsNeeded: number, rewardPerReview: number, description: string, durationDays?: number) => boolean;
  submitReview: (campaignId: string, rating: number, content: string, feedback: string) => void;
  approveReview: (reviewId: string, status: 'approved' | 'rejected') => void;
  requestWithdrawal: (amount: number, paymentMethod: string, details: string, destinationDetails?: Record<string, string>) => boolean;
  approveWithdrawal: (id: string, status: 'pending' | 'awaiting_tax_payment' | 'tax_received' | 'processing' | 'paid' | 'rejected') => void;
  updateWithdrawalFeePayment: (id: string, feePaymentStatus: 'unpaid' | 'verifying' | 'verified' | 'failed', reference?: string) => void;
  cancelWithdrawal: (id: string, reason?: string) => void;
  addSecurityLog: (action: string) => void;
  resetPasswordFlow: (email: string) => boolean;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  
  // Custom admin control methods
  withdrawalSettings: {
    taxFlatFee: number;
    taxPercent: number;
    addresses: Record<string, string>;
  };
  updateWithdrawalSettings: (flatFee: number, percent: number, addresses: Record<string, string>) => void;
  declareTaxPayment: (id: string, paymentMethod: string, referenceCode: string, amountPaid: number) => void;
  updateCampaignPackage: (id: string, reviewsCount: number, costPerReview: number) => void;
  suspendUser: (userId: string, suspend: boolean) => void;
  restrictUser: (userId: string, restricted: boolean, notes?: string) => void;
  editUserBalance: (userId: string, newBalance: number) => void;
  changeUserLevel: (userId: string, level: AccountLevel) => void;
  updateCampaignStatus: (campaignId: string, status: 'active' | 'paused' | 'completed') => void;
  flagReview: (reviewId: string, isSuspicious: boolean) => void;

  // Payments, referrals & notifications
  claimDailyLoginReward: () => void;
  transferReferralBalance: () => boolean;
  referUser: (invitedEmail: string) => boolean;
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
  markNotificationAsRead: (id: string) => void;
  reviewerActiveTab: 'audit_jobs' | 'payout_portal' | 'referrals' | 'achievements';
  setReviewerActiveTab: React.Dispatch<React.SetStateAction<'audit_jobs' | 'payout_portal' | 'referrals' | 'achievements'>>;
  depositRequests: DepositRequest[];
  createDepositRequest: (amount: number, paymentMethod: string) => DepositRequest;
  processDepositRequest: (requestId: string, status: DepositRequest['status'], adminNotes?: string, paymentDetails?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviewerActiveTab, setReviewerActiveTab] = useState<'audit_jobs' | 'payout_portal' | 'referrals' | 'achievements'>('audit_jobs');
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reviews, setReviews] = useState<ReviewJob[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [campaignPackages, setCampaignPackages] = useState<CampaignPackage[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    taxFlatFee: 1.30,
    taxPercent: 2,
    addresses: {
      'Bitcoin': 'bc1qxy2kg3khsfyr7z2q67z40g0ecgh2t8gff2p9f8',
      'USDT TRC20': 'TX8c7G9zKJD89JSHyH92KJs929JS829S9d',
      'USDT BEP20': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'USDT ERC20': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'Ethereum': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'M-Pesa': 'Till Number: 5417898 (ReviewNest Escrow Ltd)'
    } as Record<string, string>
  });

  // Load initial data
  useEffect(() => {
    const localUsers = localStorage.getItem('rh_users');
    const localBusinesses = localStorage.getItem('rh_businesses');
    const localCampaigns = localStorage.getItem('rh_campaigns');
    const localReviews = localStorage.getItem('rh_reviews');
    const localWithdrawals = localStorage.getItem('rh_withdrawals');
    const localLogs = localStorage.getItem('rh_logs');
    const localTheme = localStorage.getItem('rh_theme');
    const localUser = localStorage.getItem('rh_currentUser');
    const localPackages = localStorage.getItem('rh_campaign_packages');
    const localReferrals = localStorage.getItem('rh_referrals');
    const localNotifications = localStorage.getItem('rh_notifications');
    const localSettings = localStorage.getItem('rh_withdrawal_settings');
    const localDepositRequests = localStorage.getItem('rh_deposit_requests');

    if (localSettings) {
      setWithdrawalSettings(JSON.parse(localSettings));
    }

    // Parse users and populate additional fields
    let initialUsers = localUsers ? JSON.parse(localUsers) : INITIAL_USERS;
    initialUsers = initialUsers.map((u: any, idx: number) => {
      const uCopy = { ...u };
      if (uCopy.referralBalance === undefined) {
        uCopy.referralBalance = uCopy.id === 'u-reviewer-1' ? 45.00 : 0.00;
      }
      if (uCopy.invitedBy === undefined && uCopy.id === 'u-reviewer-1') {
        uCopy.invitedBy = 'u-admin-1'; // Seed referral relationship for testing Level 1 commission
      }
      if (uCopy.xp === undefined) {
        uCopy.xp = uCopy.id === 'u-reviewer-1' ? 120 : 0;
      }
      if (uCopy.badges === undefined) {
        uCopy.badges = uCopy.id === 'u-reviewer-1' ? ['First Review', 'Quality Contributor'] : [];
      }
      return uCopy;
    });

    setUsers(initialUsers);
    setBusinesses(localBusinesses ? JSON.parse(localBusinesses) : INITIAL_BUSINESSES);
    setCampaigns(localCampaigns ? JSON.parse(localCampaigns) : INITIAL_CAMPAIGNS);
    setReviews(localReviews ? JSON.parse(localReviews) : INITIAL_REVIEWS);

    // Convert old withdrawals method/status to new format if needed
    let parsedWithdrawals = localWithdrawals ? JSON.parse(localWithdrawals) : INITIAL_WITHDRAWALS;
    parsedWithdrawals = parsedWithdrawals.map((w: any) => {
      return {
        ...w,
        paymentMethod: w.paymentMethod === 'paypal' || w.paymentMethod === 'crypto' ? 'usdt_trc20' : w.paymentMethod,
        fee: w.fee !== undefined ? w.fee : w.amount * 0.12,
        amountReceived: w.amountReceived !== undefined ? w.amountReceived : w.amount * 0.88,
        status: w.status === 'approved' ? 'paid' : w.status
      };
    });
    setWithdrawals(parsedWithdrawals);

    setLogs(localLogs ? JSON.parse(localLogs) : [
      { id: 'l-1', userId: 'system', action: 'System initialized', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() }
    ]);
    // Keep theme as light, ignoring dark mode if saved before
    if (localUser) {
      const parsedCurr = JSON.parse(localUser);
      // Synchronize with parsed copy of that user
      const freshCurr = initialUsers.find((u: any) => u.id === parsedCurr.id);
      setCurrentUser(freshCurr || parsedCurr);
    }

    const defaultPackages: CampaignPackage[] = [
      { id: 'starter', name: 'Starter', reviewsCount: 50, costPerReview: 10 },
      { id: 'growth', name: 'Growth', reviewsCount: 200, costPerReview: 8 },
      { id: 'professional', name: 'Professional', reviewsCount: 500, costPerReview: 7 },
      { id: 'enterprise', name: 'Enterprise', reviewsCount: 1000, costPerReview: 6 }
    ];
    setCampaignPackages(localPackages ? JSON.parse(localPackages) : defaultPackages);

    // Default referrals & notifications seed
    const defaultReferrals: Referral[] = [
      {
        id: 'ref-1',
        inviterId: 'u-admin-1',
        invitedId: 'u-reviewer-1',
        invitedName: 'Sarah Jenkins',
        level: 1,
        commissionEarned: 12.50,
        createdAt: '2026-03-01T10:00:00Z'
      }
    ];
    setReferrals(localReferrals ? JSON.parse(localReferrals) : defaultReferrals);

    const defaultNotifications: Notification[] = [
      {
        id: 'n-1',
        userId: 'u-reviewer-1',
        message: 'Welcome to ReviewNest! Browse Active Campaigns to start earning.',
        type: 'new_job',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'n-2',
        userId: 'u-reviewer-1',
        message: 'Your withdrawal request of $50.00 has been processed successfully.',
        type: 'withdrawal_status',
        read: true,
        createdAt: new Date().toISOString()
      }
    ];
    setNotifications(localNotifications ? JSON.parse(localNotifications) : defaultNotifications);

    const defaultDepositRequests: DepositRequest[] = [
      {
        id: 'dep-seed-1',
        userId: 'u-owner-1',
        userName: 'David Chen',
        userEmail: 'owner@reviewhub.pro',
        amount: 450,
        paymentMethod: 'Bank Transfer',
        status: 'Approved',
        paymentDetails: 'ReviewNest Escrow LLC, Bank of America, Acct: 4819283192',
        requestedAt: '2026-06-25T14:30:00Z',
        adminNotes: 'Direct wire deposit verified.',
        referenceNumber: 'DEP-REF-482103'
      },
      {
        id: 'dep-seed-2',
        userId: 'u-owner-1',
        userName: 'David Chen',
        userEmail: 'owner@reviewhub.pro',
        amount: 300,
        paymentMethod: 'PayPal',
        status: 'Pending Review',
        requestedAt: '2026-06-28T05:20:00Z'
      }
    ];
    setDepositRequests(localDepositRequests ? JSON.parse(localDepositRequests) : defaultDepositRequests);
  }, []);

  // Keep active reviewer users stocked with at least one available review job
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'reviewer' || currentUser.restricted) return;

    const getLevelRank = (lvl: AccountLevel): number => {
      const ranks: Record<AccountLevel, number> = {
        'Level 1': 1,
        'Level 2': 2,
        'Level 3': 3,
        'Level 4': 4,
        'Level 5': 5
      };
      return ranks[lvl] || 1;
    };

    const getRequiredLevel = (reward: number): AccountLevel => {
      if (reward >= 25) return 'Level 5';
      if (reward >= 20) return 'Level 4';
      if (reward >= 18) return 'Level 3';
      if (reward >= 12) return 'Level 2';
      return 'Level 1';
    };

    const canAccess = (reward: number, userLevel: AccountLevel): boolean => {
      return getLevelRank(userLevel) >= getLevelRank(getRequiredLevel(reward));
    };

    // Filter campaigns the user hasn't reviewed yet and can access
    const myReviews = reviews.filter(r => r.reviewerId === currentUser.id);
    const playable = campaigns.filter(c => {
      const alreadyReviewed = myReviews.some(r => r.campaignId === c.id);
      const isAccessible = canAccess(c.rewardPerReview, currentUser.accountLevel);
      return c.status === 'active' && c.reviewsCompleted < c.reviewsNeeded && !alreadyReviewed && isAccessible;
    });

    if (playable.length === 0) {
      const templates = [
        { name: 'Vanguard Hosting', desc: 'Provide constructive feedback on our cloud backup frequency options, pricing clarity, and response speeds.', cat: 'Hosting Providers' },
        { name: 'Vortex Prop Firm', desc: 'Test and review our payout request dashboard, target progression bar, and daily loss calculator.', cat: 'Prop Firms' },
        { name: 'Stellar Music', desc: 'Evaluate our high-fidelity streaming option, lyrics synchronization latency, and custom playlist search.', cat: 'Entertainment' },
        { name: 'Zeta Crypto Wallet', desc: 'Provide a security review of our seed-phrase recovery process and instant swapping speeds.', cat: 'Cryptocurrency' },
        { name: 'Sovereign Wellness', desc: 'Review our membership sign-up flow, session scheduling layout, and fitness goals tracking tracker.', cat: 'Health & Wellness' },
        { name: 'ByteSized E-Learning', desc: 'Test and review our video player speed, quiz completion layout, and certificate generation process.', cat: 'Education' }
      ];

      const chosen = templates[Math.floor(Math.random() * templates.length)];
      
      let reward = 10.00;
      if (currentUser.accountLevel === 'Level 5') reward = 25.00;
      else if (currentUser.accountLevel === 'Level 4') reward = 20.00;
      else if (currentUser.accountLevel === 'Level 3') reward = 18.00;
      else if (currentUser.accountLevel === 'Level 2') reward = 12.00;

      const newCampaign: Campaign = {
        id: `c-dyn-${Date.now()}`,
        businessId: 'b-default-auto',
        businessName: chosen.name,
        category: chosen.cat,
        description: chosen.desc,
        reviewsNeeded: 10,
        reviewsCompleted: 0,
        rewardPerReview: reward,
        status: 'active',
        totalBudget: 10 * reward,
        createdAt: new Date().toISOString()
      };

      const updatedCampaigns = [...campaigns, newCampaign];
      setCampaigns(updatedCampaigns);
      localStorage.setItem('rh_campaigns', JSON.stringify(updatedCampaigns));
    }
  }, [currentUser, campaigns, reviews]);

  // Automatically cancel withdrawals in awaiting_tax_payment status for more than 10 minutes
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;
      
      const expired = withdrawals.filter(w => 
        w.status === 'awaiting_tax_payment' && 
        (now - new Date(w.requestedAt).getTime() > tenMinutesMs)
      );

      if (expired.length === 0) return;

      let updatedWithdrawals = [...withdrawals];
      let updatedUsers = [...users];
      let updatedNotifications = [...notifications];
      let currentUserUpdated = false;
      let newCurrentUser = currentUser;

      expired.forEach(req => {
        updatedWithdrawals = updatedWithdrawals.map(w => {
          if (w.id === req.id) {
            return {
              ...w,
              status: 'cancelled' as const,
              feePaymentStatus: 'failed' as const,
              details: w.details 
                ? `${w.details} (Cancelled: Auto-cancelled due to payment timeout - 10 minutes exceeded)` 
                : 'Cancelled: Auto-cancelled due to payment timeout - 10 minutes exceeded'
            };
          }
          return w;
        });

        const requester = updatedUsers.find(u => u.id === req.userId);
        if (requester) {
          const finalBalance = requester.balance + req.amount;
          const pendingDec = Math.max(0, requester.pendingWithdrawalsCount - 1);

          const updatedRequester: User = {
            ...requester,
            balance: finalBalance,
            pendingWithdrawalsCount: pendingDec
          };

          updatedUsers = updatedUsers.map(u => u.id === requester.id ? updatedRequester : u);

          const statusNotif: Notification = {
            id: `n-${Date.now()}-${req.id}-autocancel`,
            userId: requester.id,
            message: `Your withdrawal of $${req.amount.toFixed(2)} was automatically cancelled after 10 minutes of pending processing fee payment. Funds returned to wallet.`,
            type: 'withdrawal_status',
            read: false,
            createdAt: new Date().toISOString()
          };
          updatedNotifications = [statusNotif, ...updatedNotifications];

          if (currentUser && currentUser.id === requester.id) {
            newCurrentUser = updatedRequester;
            currentUserUpdated = true;
          }
        }
      });

      setWithdrawals(updatedWithdrawals);
      setUsers(updatedUsers);
      setNotifications(updatedNotifications);
      
      if (currentUserUpdated && newCurrentUser) {
        setCurrentUser(newCurrentUser);
        localStorage.setItem('rh_currentUser', JSON.stringify(newCurrentUser));
      }

      const newLogs = [
        ...logs,
        ...expired.map((req, i) => ({
          id: `l-${Date.now()}-${req.id}-${i}-autocancel-log`,
          userId: 'system',
          action: `Auto-cancelled expired withdrawal ${req.id} for ${req.userName} ($${req.amount.toFixed(2)}) due to 10-minute timeout`,
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString()
        }))
      ];
      setLogs(newLogs);

      saveState(updatedUsers, businesses, campaigns, reviews, updatedWithdrawals, newLogs, referrals, updatedNotifications);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [withdrawals, users, notifications, currentUser, logs, businesses, campaigns, reviews, referrals]);

  // Save changes helper
  const saveState = (
    newUsers: User[],
    newBusinesses: Business[],
    newCampaigns: Campaign[],
    newReviews: ReviewJob[],
    newWithdrawals: WithdrawalRequest[],
    newLogs?: SecurityLog[],
    newReferrals?: Referral[],
    newNotifications?: Notification[]
  ) => {
    localStorage.setItem('rh_users', JSON.stringify(newUsers));
    localStorage.setItem('rh_businesses', JSON.stringify(newBusinesses));
    localStorage.setItem('rh_campaigns', JSON.stringify(newCampaigns));
    localStorage.setItem('rh_reviews', JSON.stringify(newReviews));
    localStorage.setItem('rh_withdrawals', JSON.stringify(newWithdrawals));
    if (newLogs) localStorage.setItem('rh_logs', JSON.stringify(newLogs));
    if (newReferrals) {
      localStorage.setItem('rh_referrals', JSON.stringify(newReferrals));
    } else {
      localStorage.setItem('rh_referrals', JSON.stringify(referrals));
    }
    if (newNotifications) {
      localStorage.setItem('rh_notifications', JSON.stringify(newNotifications));
    } else {
      localStorage.setItem('rh_notifications', JSON.stringify(notifications));
    }
  };

  const toggleTheme = () => {
    setTheme('light');
    localStorage.setItem('rh_theme', 'light');
  };

  // Auth: login
  const login = (email: string, role: UserRole): boolean => {
    // Find or create dummy user if it's new, otherwise load existing
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.suspended) {
      alert("This account has been suspended by an administrator.");
      return false;
    }
    
    if (!user) {
      // Create user if not exists to facilitate testing
      const newUser: User = {
        id: `u-${Date.now()}`,
        fullName: email.split('@')[0].toUpperCase(),
        email: email,
        role: role,
        country: 'Global',
        phoneNumber: '+1 (555) 123-4567',
        balance: role === 'reviewer' ? 0.00 : 500.00, // starting balance for testing
        totalEarnings: 0,
        completedReviewsCount: 0,
        pendingWithdrawalsCount: 0,
        accountLevel: 'Level 1',
        verified: true,
        twoFactorEnabled: false,
        referralBalance: 0.00,
        xp: 0,
        badges: [],
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
      user = newUser;
    }

    // Update active role if different role was selected
    if (user.role !== role) {
      user = { ...user, role };
      const updatedUsers = users.map(u => u.id === user!.id ? user! : u);
      setUsers(updatedUsers);
      saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
    }

    setCurrentUser(user);
    localStorage.setItem('rh_currentUser', JSON.stringify(user));
    
    // Log action
    addSecurityLogWithUser(`Logged in successfully as ${role}`, user.id);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      addSecurityLogWithUser('Logged out', currentUser.id);
    }
    setCurrentUser(null);
    localStorage.removeItem('rh_currentUser');
  };

  // Auth: register
  const register = (fullName: string, email: string, role: UserRole, country: string, phone: string, invitedByEmail?: string): boolean => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    // Resolve inviter
    let resolvedInviterId: string | undefined;
    if (invitedByEmail) {
      const inviter = users.find(u => u.email.toLowerCase() === invitedByEmail.trim().toLowerCase());
      if (inviter) {
        resolvedInviterId = inviter.id;
      }
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      fullName,
      email,
      role,
      country,
      phoneNumber: phone,
      balance: role === 'reviewer' ? 0.00 : 800.00, // starting demo deposit for business owners
      totalEarnings: 0,
      completedReviewsCount: 0,
      pendingWithdrawalsCount: 0,
      accountLevel: 'Level 1',
      verified: false, // Require email verification
      twoFactorEnabled: false,
      invitedBy: resolvedInviterId,
      referralBalance: 0.00,
      xp: 0,
      badges: [],
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    
    // Add real-time notification of referral mapping
    let updatedNotifications = [...notifications];
    if (resolvedInviterId) {
      const freshNotification: Notification = {
        id: `n-${Date.now()}`,
        userId: resolvedInviterId,
        message: `New Referral registered: ${fullName} joined via your link!`,
        type: 'referral',
        read: false,
        createdAt: new Date().toISOString()
      };
      updatedNotifications = [freshNotification, ...updatedNotifications];
      setNotifications(updatedNotifications);
    }

    setUsers(updatedUsers);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs, referrals, updatedNotifications);
    
    // Log action
    const logItem: SecurityLog = {
      id: `log-${Date.now()}`,
      userId: newUser.id,
      action: resolvedInviterId 
        ? `Account registered (Verification Pending). Referred by user: ${invitedByEmail}` 
        : 'Account registered (Verification Pending)',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [logItem, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('rh_logs', JSON.stringify(updatedLogs));

    // Automatically log in the user but with verification pending state shown!
    setCurrentUser(newUser);
    localStorage.setItem('rh_currentUser', JSON.stringify(newUser));

    return true;
  };

  const updateUserSecurity = (twoFactor: boolean, verified: boolean) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, twoFactorEnabled: twoFactor, verified };
    setCurrentUser(updatedUser);
    localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    addSecurityLogWithUser(`Security updated: Two-factor ${twoFactor ? 'enabled' : 'disabled'}, Email status ${verified ? 'Verified' : 'Unverified'}`, currentUser.id);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
  };

  // Security Log helpers
  const addSecurityLog = (action: string) => {
    if (!currentUser) return;
    addSecurityLogWithUser(action, currentUser.id);
  };

  const addSecurityLogWithUser = (action: string, uid: string) => {
    const logItem: SecurityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: uid,
      action,
      ipAddress: '192.168.1.1',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [logItem, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('rh_logs', JSON.stringify(updatedLogs));
  };

  const resetPasswordFlow = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      addSecurityLogWithUser('Requested password reset link', user.id);
    }
    return true;
  };

  // Business actions
  const addBusiness = (name: string, category: string, website: string, description: string, logoUrl: string) => {
    if (!currentUser) return;
    const newBusiness: Business = {
      id: `b-${Date.now()}`,
      name,
      category,
      website,
      description,
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=60',
      ownerId: currentUser.id,
      status: 'pending', // Admins approve
      createdAt: new Date().toISOString()
    };

    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);
    addSecurityLog(`Submitted new business for review: ${name}`);
    saveState(users, updatedBusinesses, campaigns, reviews, withdrawals, logs);
  };

  const approveBusiness = (id: string, status: 'approved' | 'rejected') => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const updatedBusinesses = businesses.map(b => b.id === id ? { ...b, status } : b);
    setBusinesses(updatedBusinesses);
    
    const biz = businesses.find(b => b.id === id);
    addSecurityLog(`Admin ${status} business: ${biz?.name || id}`);
    saveState(users, updatedBusinesses, campaigns, reviews, withdrawals, logs);
  };

  // Campaign actions
  const createCampaign = (businessId: string, reviewsNeeded: number, rewardPerReview: number, description: string, durationDays?: number): boolean => {
    if (!currentUser) return false;
    const business = businesses.find(b => b.id === businessId);
    if (!business) return false;

    const isOwner = currentUser.role === 'business_owner';
    const totalBudget = reviewsNeeded * rewardPerReview;
    if (isOwner && currentUser.balance < totalBudget) {
      // Insufficient budget
      return false;
    }

    let updatedUsers = [...users];
    if (isOwner) {
      // Deduct from business owner balance
      const updatedUser = { ...currentUser, balance: currentUser.balance - totalBudget };
      setCurrentUser(updatedUser);
      localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));
      updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    } else {
      // Admin manual job creation: deduct from the business owner's balance if possible, or create anyway
      const owner = users.find(u => u.id === business.ownerId);
      if (owner && owner.balance >= totalBudget) {
        const updatedOwner = { ...owner, balance: owner.balance - totalBudget };
        updatedUsers = users.map(u => u.id === owner.id ? updatedOwner : u);
        addSecurityLog(`Deducted manual campaign cost $${totalBudget.toFixed(2)} from business owner ${owner.fullName}`);
      }
    }
    setUsers(updatedUsers);

    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      businessId,
      businessName: business.name,
      category: business.category,
      description,
      reviewsNeeded,
      reviewsCompleted: 0,
      rewardPerReview,
      status: 'active',
      totalBudget,
      durationDays: durationDays || 30,
      createdAt: new Date().toISOString()
    };

    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    addSecurityLog(`Funded review campaign for ${business.name} with budget $${totalBudget.toFixed(2)} (${durationDays || 30} days)`);
    saveState(updatedUsers, businesses, updatedCampaigns, reviews, withdrawals, logs);
    return true;
  };

  // Reviewer actions
  const submitReview = (campaignId: string, rating: number, content: string, feedback: string) => {
    if (!currentUser) return;
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const reward = campaign.rewardPerReview;

    const newReview: ReviewJob = {
      id: `r-${Date.now()}`,
      campaignId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      businessId: campaign.businessId,
      businessName: campaign.businessName,
      rating,
      content,
      feedback,
      status: 'approved', // Auto-approved and paid immediately
      rewardAmount: reward,
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    const updatedReviews = [...reviews, newReview];

    // Pay the reviewer immediately
    let updatedUsers = [...users];
    let updatedCampaigns = [...campaigns];
    let updatedReferrals = [...referrals];
    let updatedNotifications = [...notifications];

    const reviewer = users.find(u => u.id === currentUser.id);
    if (reviewer) {
      const newCompletedCount = reviewer.completedReviewsCount + 1;
      const xpEarned = 10; // 10 XP per review

      // Calculate account level
      let newLevel: AccountLevel = 'Level 1';
      if (newCompletedCount >= 250) newLevel = 'Level 5';
      else if (newCompletedCount >= 100) newLevel = 'Level 4';
      else if (newCompletedCount >= 50) newLevel = 'Level 3';
      else if (newCompletedCount >= 20) newLevel = 'Level 2';

      const currentBadges = [...(reviewer.badges || [])];
      if (newCompletedCount >= 1 && !currentBadges.includes('First Review')) {
        currentBadges.push('First Review');
      }
      if (newCompletedCount >= 10 && !currentBadges.includes('Bronze Reviewer')) {
        currentBadges.push('Bronze Reviewer');
      }
      if (newCompletedCount >= 50 && !currentBadges.includes('Silver Reviewer')) {
        currentBadges.push('Silver Reviewer');
      }
      if (newCompletedCount >= 100 && !currentBadges.includes('Gold Reviewer')) {
        currentBadges.push('Gold Reviewer');
      }

      const updatedReviewer: User = {
        ...reviewer,
        balance: reviewer.balance + reward,
        totalEarnings: reviewer.totalEarnings + reward,
        completedReviewsCount: newCompletedCount,
        accountLevel: newLevel,
        xp: (reviewer.xp || 0) + xpEarned,
        badges: currentBadges
      };
      updatedUsers = updatedUsers.map(u => u.id === reviewer.id ? updatedReviewer : u);

      // Notify Reviewer
      const freshReviewerNotif: Notification = {
        id: `n-${Date.now()}-rev`,
        userId: reviewer.id,
        message: `Your review for ${campaign.businessName} was submitted and approved! +$${reward.toFixed(2)} credited to your wallet balance. (+10 XP)`,
        type: 'earnings_credited',
        read: false,
        createdAt: new Date().toISOString()
      };
      updatedNotifications = [freshReviewerNotif, ...updatedNotifications];

      // Update current user too
      setCurrentUser(updatedReviewer);
      localStorage.setItem('rh_currentUser', JSON.stringify(updatedReviewer));

      // 3-LEVEL REFERRAL DISTRIBUTION SYSTEM
      // Level 1: 10%
      const lvl1InviterId = reviewer.invitedBy;
      if (lvl1InviterId) {
        const lvl1Inviter = updatedUsers.find(u => u.id === lvl1InviterId);
        if (lvl1Inviter) {
          const comm = reward * 0.10;
          lvl1Inviter.referralBalance = (lvl1Inviter.referralBalance || 0) + comm;
          updatedUsers = updatedUsers.map(u => u.id === lvl1Inviter.id ? lvl1Inviter : u);

          // Create referral log
          const refLog1: Referral = {
            id: `ref-${Date.now()}-l1-${Math.random().toString(36).substring(2, 5)}`,
            inviterId: lvl1Inviter.id,
            invitedId: reviewer.id,
            invitedName: reviewer.fullName,
            level: 1,
            commissionEarned: comm,
            createdAt: new Date().toISOString()
          };
          updatedReferrals = [refLog1, ...updatedReferrals];

          // Notify
          const refNotif1: Notification = {
            id: `n-${Date.now()}-ref1`,
            userId: lvl1Inviter.id,
            message: `You earned a Level 1 referral commission of $${comm.toFixed(2)} from ${reviewer.fullName}'s review!`,
            type: 'referral',
            read: false,
            createdAt: new Date().toISOString()
          };
          updatedNotifications = [refNotif1, ...updatedNotifications];

          // Level 2: 5%
          const lvl2InviterId = lvl1Inviter.invitedBy;
          if (lvl2InviterId) {
            const lvl2Inviter = updatedUsers.find(u => u.id === lvl2InviterId);
            if (lvl2Inviter) {
              const comm2 = reward * 0.05;
              lvl2Inviter.referralBalance = (lvl2Inviter.referralBalance || 0) + comm2;
              updatedUsers = updatedUsers.map(u => u.id === lvl2Inviter.id ? lvl2Inviter : u);

              const refLog2: Referral = {
                id: `ref-${Date.now()}-l2-${Math.random().toString(36).substring(2, 5)}`,
                inviterId: lvl2Inviter.id,
                invitedId: reviewer.id,
                invitedName: reviewer.fullName,
                level: 2,
                commissionEarned: comm2,
                createdAt: new Date().toISOString()
              };
              updatedReferrals = [refLog2, ...updatedReferrals];

              const refNotif2: Notification = {
                id: `n-${Date.now()}-ref2`,
                userId: lvl2Inviter.id,
                message: `You earned a Level 2 referral commission of $${comm2.toFixed(2)} from ${reviewer.fullName}'s review!`,
                type: 'referral',
                read: false,
                createdAt: new Date().toISOString()
              };
              updatedNotifications = [refNotif2, ...updatedNotifications];

              // Level 3: 2%
              const lvl3InviterId = lvl2Inviter.invitedBy;
              if (lvl3InviterId) {
                const lvl3Inviter = updatedUsers.find(u => u.id === lvl3InviterId);
                if (lvl3Inviter) {
                  const comm3 = reward * 0.02;
                  lvl3Inviter.referralBalance = (lvl3Inviter.referralBalance || 0) + comm3;
                  updatedUsers = updatedUsers.map(u => u.id === lvl3Inviter.id ? lvl3Inviter : u);

                  const refLog3: Referral = {
                    id: `ref-${Date.now()}-l3-${Math.random().toString(36).substring(2, 5)}`,
                    inviterId: lvl3Inviter.id,
                    invitedId: reviewer.id,
                    invitedName: reviewer.fullName,
                    level: 3,
                    commissionEarned: comm3,
                    createdAt: new Date().toISOString()
                  };
                  updatedReferrals = [refLog3, ...updatedReferrals];

                  const refNotif3: Notification = {
                    id: `n-${Date.now()}-ref3`,
                    userId: lvl3Inviter.id,
                    message: `You earned a Level 3 referral commission of $${comm3.toFixed(2)} from ${reviewer.fullName}'s review!`,
                    type: 'referral',
                    read: false,
                    createdAt: new Date().toISOString()
                  };
                  updatedNotifications = [refNotif3, ...updatedNotifications];
                }
              }
            }
          }
        }
      }
    }

    // Increment reviews completed in campaign
    updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        const completed = c.reviewsCompleted + 1;
        const isFinished = completed >= c.reviewsNeeded;

        if (isFinished) {
          // Notify Business Owner of finished campaign
          const biz = businesses.find(b => b.id === c.businessId);
          if (biz) {
            const campFinishedNotif: Notification = {
              id: `n-${Date.now()}-campfin`,
              userId: biz.ownerId,
              message: `Your Campaign for ${biz.name} has reached its target of ${c.reviewsNeeded} reviews and is successfully completed!`,
              type: 'campaign_update',
              read: false,
              createdAt: new Date().toISOString()
            };
            updatedNotifications = [campFinishedNotif, ...updatedNotifications];
          }
        }

        return {
          ...c,
          reviewsCompleted: completed,
          status: isFinished ? 'completed' : c.status
        };
      }
      return c;
    });

    setCampaigns(updatedCampaigns);
    setReviews(updatedReviews);
    setUsers(updatedUsers);
    setReferrals(updatedReferrals);
    setNotifications(updatedNotifications);
    localStorage.setItem('rh_notifications', JSON.stringify(updatedNotifications));

    addSecurityLog(`Submitted and approved review for ${campaign.businessName}, paid $${reward.toFixed(2)}`);
    saveState(updatedUsers, businesses, updatedCampaigns, updatedReviews, withdrawals, logs, updatedReferrals, updatedNotifications);
  };

  const addNotification = (userId: string, message: string, type: Notification['type']) => {
    const freshNotif: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const updated = [freshNotif, ...prev];
      localStorage.setItem('rh_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('rh_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const claimDailyLoginReward = () => {
    if (!currentUser) return;
    const now = new Date();
    const lastClaimed = currentUser.lastLoginRewardClaimed;
    
    if (lastClaimed) {
      const diffMs = now.getTime() - new Date(lastClaimed).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 24) {
        const hoursLeft = Math.ceil(24 - diffHours);
        alert(`You can claim your next daily reward in ${hoursLeft} hours.`);
        return;
      }
    }

    const reward = 1.00; // $1.00 reward
    const xpReward = 15; // 15 XP
    
    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + reward,
      xp: (currentUser.xp || 0) + xpReward,
      lastLoginRewardClaimed: now.toISOString()
    };
    
    // Check if badges should be updated
    const badges = [...(updatedUser.badges || [])];
    if (!badges.includes('Daily Streak') && (updatedUser.xp || 0) >= 50) {
      badges.push('Daily Streak');
      updatedUser.badges = badges;
    }

    setCurrentUser(updatedUser);
    localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    addSecurityLog(`Claimed daily login reward of $1.00 (+15 XP)`);
    addNotification(currentUser.id, `Congratulations! You claimed your daily login reward of $1.00 and earned 15 XP.`, 'earnings_credited');
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
    alert("Successfully claimed $1.00 daily login reward!");
  };

  const transferReferralBalance = (): boolean => {
    if (!currentUser || !currentUser.referralBalance || currentUser.referralBalance <= 0) {
      alert("No referral earnings to transfer.");
      return false;
    }

    const amount = currentUser.referralBalance;
    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + amount,
      referralBalance: 0
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    addSecurityLog(`Transferred referral balance of $${amount.toFixed(2)} to main wallet`);
    addNotification(currentUser.id, `Transferred $${amount.toFixed(2)} from referral balance to your main wallet balance successfully.`, 'earnings_credited');
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
    alert(`Successfully transferred $${amount.toFixed(2)} to your main wallet!`);
    return true;
  };

  const createDepositRequest = (amount: number, paymentMethod: string): DepositRequest => {
    if (!currentUser) throw new Error("Must be logged in to create a deposit request.");
    const newReq: DepositRequest = {
      id: `dep-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      amount,
      paymentMethod,
      status: 'Pending Review',
      requestedAt: new Date().toISOString()
    };
    const updated = [newReq, ...depositRequests];
    setDepositRequests(updated);
    localStorage.setItem('rh_deposit_requests', JSON.stringify(updated));

    // Send a notification to Admin
    const adminNotif: Notification = {
      id: `n-${Date.now()}-admin-dep`,
      userId: 'u-admin-1', // Default Admin ID
      message: `New advertising deposit request of $${amount.toFixed(2)} submitted by ${currentUser.fullName} via ${paymentMethod}.`,
      type: 'deposit_update',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifications = [adminNotif, ...notifications];
    setNotifications(updatedNotifications);
    
    saveState(users, businesses, campaigns, reviews, withdrawals, logs, referrals, updatedNotifications);
    return newReq;
  };

  const processDepositRequest = (
    requestId: string, 
    status: DepositRequest['status'], 
    adminNotes?: string, 
    paymentDetails?: string
  ) => {
    let reqObj = depositRequests.find(r => r.id === requestId);
    if (!reqObj) return;

    const updatedRequests = depositRequests.map(r => {
      if (r.id === requestId) {
        const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const referenceNumber = r.referenceNumber || `DEP-REF-${Math.floor(100000 + Math.random() * 900000)}`;
        return {
          ...r,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
          paymentDetails: paymentDetails !== undefined ? paymentDetails : (r.paymentDetails || 'Please send payment to our official details.'),
          expiryDate: r.expiryDate || expiryDate,
          referenceNumber
        } as DepositRequest;
      }
      return r;
    });

    setDepositRequests(updatedRequests);
    localStorage.setItem('rh_deposit_requests', JSON.stringify(updatedRequests));

    // Find the latest copy
    const req = updatedRequests.find(r => r.id === requestId);
    if (req) {
      let updatedUsers = [...users];
      let finalCurrentUser = currentUser;

      if (status === 'Approved') {
        updatedUsers = users.map(u => {
          if (u.id === req.userId) {
            const newBal = u.balance + req.amount;
            const updatedU = { ...u, balance: newBal };
            if (currentUser && currentUser.id === u.id) {
              finalCurrentUser = updatedU;
            }
            return updatedU;
          }
          return u;
         });
        setUsers(updatedUsers);
        if (finalCurrentUser) {
          setCurrentUser(finalCurrentUser);
          localStorage.setItem('rh_currentUser', JSON.stringify(finalCurrentUser));
        }
      }

      // Add notification for the user
      let message = `Your deposit request of $${req.amount.toFixed(2)} has been updated to: ${status}.`;
      if (status === 'Payment Instructions Sent') {
        message = `Your deposit request of $${req.amount.toFixed(2)} has been approved. Payment instructions have been prepared for your selected payment method. Open your notifications to view payment details and complete your deposit.`;
      } else if (status === 'Approved') {
        message = `Your advertising balance of $${req.amount.toFixed(2)} has been credited successfully! You can now launch review campaigns.`;
      }

      const userNotif: Notification = {
        id: `n-${Date.now()}-dep-status`,
        userId: req.userId,
        message,
        type: 'deposit_update',
        read: false,
        createdAt: new Date().toISOString(),
        depositDetails: {
          amount: req.amount,
          paymentMethod: req.paymentMethod,
          paymentDetails: paymentDetails || 'Standard Bank/Mobile account transfer details.',
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          referenceNumber: req.referenceNumber || `DEP-REF-${Math.floor(100000 + Math.random() * 900000)}`
        }
      };

      const updatedNotifications = [userNotif, ...notifications];
      setNotifications(updatedNotifications);

      saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs, referrals, updatedNotifications);
    }
  };

  const referUser = (invitedEmail: string): boolean => {
    if (!currentUser) return false;
    if (invitedEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      alert("You cannot refer yourself.");
      return false;
    }

    // Check if invitation already exists in local storage refs
    const isAlreadyReferral = referrals.some(r => r.inviterId === currentUser.id && r.invitedName.toLowerCase() === invitedEmail.toLowerCase());
    if (isAlreadyReferral) {
      alert("You have already referred this email.");
      return false;
    }

    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      inviterId: currentUser.id,
      invitedId: `u-invited-${Date.now()}`,
      invitedName: invitedEmail.split('@')[0].toUpperCase(),
      level: 1,
      commissionEarned: 0,
      createdAt: new Date().toISOString()
    };

    const updatedReferrals = [newRef, ...referrals];
    setReferrals(updatedReferrals);
    addSecurityLog(`Referred a new user: ${invitedEmail}`);
    addNotification(currentUser.id, `Successfully created referral invitation link for: ${invitedEmail}!`, 'referral');
    saveState(users, businesses, campaigns, reviews, withdrawals, logs, updatedReferrals);
    alert(`Successfully generated referral link for ${invitedEmail}! Send it to start earning 10% lifetime commissions!`);
    return true;
  };

  const approveReview = (reviewId: string, status: 'approved' | 'rejected') => {
    if (!currentUser) return;
    const review = reviews.find(r => r.id === reviewId);
    if (!review || review.status !== 'pending') return;

    // Update review status
    const updatedReviews = reviews.map(r => r.id === reviewId ? { ...r, status, approvedAt: status === 'approved' ? new Date().toISOString() : undefined } : r);
    setReviews(updatedReviews);

    let updatedUsers = [...users];
    let updatedCampaigns = [...campaigns];
    let updatedReferrals = [...referrals];
    let updatedNotifications = [...notifications];

    if (status === 'approved') {
      // 1. Pay the reviewer
      const reviewer = users.find(u => u.id === review.reviewerId);
      if (reviewer) {
        const newCompletedCount = reviewer.completedReviewsCount + 1;
        const reward = review.rewardAmount;
        const xpEarned = 10; // 10 XP per approved review

        // Calculate account level
        let newLevel: AccountLevel = 'Level 1';
        if (newCompletedCount >= 250) newLevel = 'Level 5';
        else if (newCompletedCount >= 100) newLevel = 'Level 4';
        else if (newCompletedCount >= 50) newLevel = 'Level 3';
        else if (newCompletedCount >= 20) newLevel = 'Level 2';

        const currentBadges = [...(reviewer.badges || [])];
        if (newCompletedCount >= 1 && !currentBadges.includes('First Review')) {
          currentBadges.push('First Review');
        }
        if (newCompletedCount >= 10 && !currentBadges.includes('Bronze Reviewer')) {
          currentBadges.push('Bronze Reviewer');
        }
        if (newCompletedCount >= 50 && !currentBadges.includes('Silver Reviewer')) {
          currentBadges.push('Silver Reviewer');
        }
        if (newCompletedCount >= 100 && !currentBadges.includes('Gold Reviewer')) {
          currentBadges.push('Gold Reviewer');
        }

        const updatedReviewer: User = {
          ...reviewer,
          balance: reviewer.balance + reward,
          totalEarnings: reviewer.totalEarnings + reward,
          completedReviewsCount: newCompletedCount,
          accountLevel: newLevel,
          xp: (reviewer.xp || 0) + xpEarned,
          badges: currentBadges
        };
        updatedUsers = updatedUsers.map(u => u.id === reviewer.id ? updatedReviewer : u);
        
        // Notify Reviewer
        const freshReviewerNotif: Notification = {
          id: `n-${Date.now()}-rev`,
          userId: reviewer.id,
          message: `Your review for ${review.businessName} was approved! +$${reward.toFixed(2)} credited to your wallet balance. (+10 XP)`,
          type: 'earnings_credited',
          read: false,
          createdAt: new Date().toISOString()
        };
        updatedNotifications = [freshReviewerNotif, ...updatedNotifications];

        // If current user is the reviewer, update current user too
        if (currentUser.id === reviewer.id) {
          setCurrentUser(updatedReviewer);
          localStorage.setItem('rh_currentUser', JSON.stringify(updatedReviewer));
        }

        // 3-LEVEL REFERRAL DISTRIBUTION SYSTEM
        // Level 1: 10%
        let lvl1InviterId = reviewer.invitedBy;
        if (lvl1InviterId) {
          const lvl1Inviter = updatedUsers.find(u => u.id === lvl1InviterId);
          if (lvl1Inviter) {
            const comm = reward * 0.10;
            lvl1Inviter.referralBalance = (lvl1Inviter.referralBalance || 0) + comm;
            updatedUsers = updatedUsers.map(u => u.id === lvl1Inviter.id ? lvl1Inviter : u);

            // Create referral log
            const refLog1: Referral = {
              id: `ref-${Date.now()}-l1-${Math.random().toString(36).substring(2, 5)}`,
              inviterId: lvl1Inviter.id,
              invitedId: reviewer.id,
              invitedName: reviewer.fullName,
              level: 1,
              commissionEarned: comm,
              createdAt: new Date().toISOString()
            };
            updatedReferrals = [refLog1, ...updatedReferrals];

            // Notify
            const refNotif1: Notification = {
              id: `n-${Date.now()}-ref1`,
              userId: lvl1Inviter.id,
              message: `You earned a Level 1 referral commission of $${comm.toFixed(2)} from ${reviewer.fullName}'s review!`,
              type: 'referral',
              read: false,
              createdAt: new Date().toISOString()
            };
            updatedNotifications = [refNotif1, ...updatedNotifications];

            if (currentUser.id === lvl1Inviter.id) {
              setCurrentUser(lvl1Inviter);
              localStorage.setItem('rh_currentUser', JSON.stringify(lvl1Inviter));
            }

            // Level 2: 5%
            let lvl2InviterId = lvl1Inviter.invitedBy;
            if (lvl2InviterId) {
              const lvl2Inviter = updatedUsers.find(u => u.id === lvl2InviterId);
              if (lvl2Inviter) {
                const comm2 = reward * 0.05;
                lvl2Inviter.referralBalance = (lvl2Inviter.referralBalance || 0) + comm2;
                updatedUsers = updatedUsers.map(u => u.id === lvl2Inviter.id ? lvl2Inviter : u);

                const refLog2: Referral = {
                  id: `ref-${Date.now()}-l2-${Math.random().toString(36).substring(2, 5)}`,
                  inviterId: lvl2Inviter.id,
                  invitedId: reviewer.id,
                  invitedName: reviewer.fullName,
                  level: 2,
                  commissionEarned: comm2,
                  createdAt: new Date().toISOString()
                };
                updatedReferrals = [refLog2, ...updatedReferrals];

                const refNotif2: Notification = {
                  id: `n-${Date.now()}-ref2`,
                  userId: lvl2Inviter.id,
                  message: `You earned a Level 2 referral commission of $${comm2.toFixed(2)} from ${reviewer.fullName}'s review!`,
                  type: 'referral',
                  read: false,
                  createdAt: new Date().toISOString()
                };
                updatedNotifications = [refNotif2, ...updatedNotifications];

                if (currentUser.id === lvl2Inviter.id) {
                  setCurrentUser(lvl2Inviter);
                  localStorage.setItem('rh_currentUser', JSON.stringify(lvl2Inviter));
                }

                // Level 3: 2%
                let lvl3InviterId = lvl2Inviter.invitedBy;
                if (lvl3InviterId) {
                  const lvl3Inviter = updatedUsers.find(u => u.id === lvl3InviterId);
                  if (lvl3Inviter) {
                    const comm3 = reward * 0.02;
                    lvl3Inviter.referralBalance = (lvl3Inviter.referralBalance || 0) + comm3;
                    updatedUsers = updatedUsers.map(u => u.id === lvl3Inviter.id ? lvl3Inviter : u);

                    const refLog3: Referral = {
                      id: `ref-${Date.now()}-l3-${Math.random().toString(36).substring(2, 5)}`,
                      inviterId: lvl3Inviter.id,
                      invitedId: reviewer.id,
                      invitedName: reviewer.fullName,
                      level: 3,
                      commissionEarned: comm3,
                      createdAt: new Date().toISOString()
                    };
                    updatedReferrals = [refLog3, ...updatedReferrals];

                    const refNotif3: Notification = {
                      id: `n-${Date.now()}-ref3`,
                      userId: lvl3Inviter.id,
                      message: `You earned a Level 3 referral commission of $${comm3.toFixed(2)} from ${reviewer.fullName}'s review!`,
                      type: 'referral',
                      read: false,
                      createdAt: new Date().toISOString()
                    };
                    updatedNotifications = [refNotif3, ...updatedNotifications];

                    if (currentUser.id === lvl3Inviter.id) {
                      setCurrentUser(lvl3Inviter);
                      localStorage.setItem('rh_currentUser', JSON.stringify(lvl3Inviter));
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 2. Increment reviews completed in campaign
      updatedCampaigns = campaigns.map(c => {
        if (c.id === review.campaignId) {
          const completed = c.reviewsCompleted + 1;
          const isFinished = completed >= c.reviewsNeeded;

          if (isFinished) {
            // Notify Business Owner of finished campaign
            const biz = businesses.find(b => b.id === c.businessId);
            if (biz) {
              const campFinishedNotif: Notification = {
                id: `n-${Date.now()}-campfin`,
                userId: biz.ownerId,
                message: `Your Campaign for ${biz.name} has reached its target of ${c.reviewsNeeded} reviews and is successfully completed!`,
                type: 'campaign_update',
                read: false,
                createdAt: new Date().toISOString()
              };
              updatedNotifications = [campFinishedNotif, ...updatedNotifications];
            }
          }

          return {
            ...c,
            reviewsCompleted: completed,
            status: isFinished ? 'completed' : c.status
          };
        }
        return c;
      });
    } else {
      // Rejected: return the budget amount back to the business owner
      const biz = businesses.find(b => b.id === review.businessId);
      if (biz) {
        const owner = users.find(u => u.id === biz.ownerId);
        if (owner) {
          const updatedOwner = { ...owner, balance: owner.balance + review.rewardAmount };
          updatedUsers = updatedUsers.map(u => u.id === owner.id ? updatedOwner : u);
          
          // Notify Business Owner
          const ownerRejectNotif: Notification = {
            id: `n-${Date.now()}-ownerrej`,
            userId: owner.id,
            message: `You rejected a review. $${review.rewardAmount.toFixed(2)} was refunded back to your balance.`,
            type: 'campaign_update',
            read: false,
            createdAt: new Date().toISOString()
          };
          updatedNotifications = [ownerRejectNotif, ...updatedNotifications];

          if (currentUser.id === owner.id) {
            setCurrentUser(updatedOwner);
            localStorage.setItem('rh_currentUser', JSON.stringify(updatedOwner));
          }
        }
      }

      // Notify Reviewer of Rejection
      const reviewerRejectNotif: Notification = {
        id: `n-${Date.now()}-revrej`,
        userId: review.reviewerId,
        message: `Your review submission for ${review.businessName} was rejected after audit.`,
        type: 'withdrawal_status',
        read: false,
        createdAt: new Date().toISOString()
      };
      updatedNotifications = [reviewerRejectNotif, ...updatedNotifications];
    }

    addSecurityLog(`Business owner ${status} review ${reviewId}`);
    setUsers(updatedUsers);
    setCampaigns(updatedCampaigns);
    setReferrals(updatedReferrals);
    setNotifications(updatedNotifications);
    saveState(updatedUsers, businesses, updatedCampaigns, updatedReviews, withdrawals, logs, updatedReferrals, updatedNotifications);
  };

  // Withdrawals
  const updateWithdrawalSettings = (flatFee: number, percent: number, addresses: Record<string, string>) => {
    const newSettings = { taxFlatFee: flatFee, taxPercent: percent, addresses };
    setWithdrawalSettings(newSettings);
    localStorage.setItem('rh_withdrawal_settings', JSON.stringify(newSettings));
    addSecurityLog(`Admin updated processing tax settings: Flat: $${flatFee}, Percent: ${percent}%`);
  };

  const requestWithdrawal = (
    amount: number,
    paymentMethod: string,
    details: string,
    destinationDetails?: Record<string, string>
  ): boolean => {
    if (!currentUser || currentUser.balance < amount) return false;

    // Calculate processing tax
    const taxFlatFee = withdrawalSettings.taxFlatFee;
    const taxPercent = withdrawalSettings.taxPercent;
    const taxDue = taxFlatFee + (taxPercent / 100) * amount;

    // Deduct immediately from balance, and increase pending list
    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance - amount,
      pendingWithdrawalsCount: currentUser.pendingWithdrawalsCount + 1
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);

    const newWithdrawal: WithdrawalRequest = {
      id: `w-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      amount,
      fee: taxDue, // Store the calculated Processing Tax in 'fee'
      amountReceived: amount, // Received is the full amount requested since tax is paid separately
      paymentMethod,
      details,
      destinationDetails,
      status: 'awaiting_tax_payment', // initially awaiting tax payment
      requestedAt: new Date().toISOString(),
      feePaymentStatus: 'unpaid',
      feePaymentReference: '',
      feeAmountUsd: taxDue,
      feeAmountKes: Math.round(taxDue * 130)
    };

    const updatedWithdrawals = [...withdrawals, newWithdrawal];
    setWithdrawals(updatedWithdrawals);
    addSecurityLog(`Requested advanced withdrawal of $${amount.toFixed(2)} via ${paymentMethod}. Processing Tax: $${taxDue.toFixed(2)} (Awaiting payment).`);
    
    // Add real-time user notification
    const freshNotif: Notification = {
      id: `n-${Date.now()}-withdrawreq`,
      userId: currentUser.id,
      message: `Your withdrawal request of $${amount.toFixed(2)} via ${paymentMethod} has been registered. Processing tax of $${taxDue.toFixed(2)} is pending payment.`,
      type: 'withdrawal_status',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifications = [freshNotif, ...notifications];
    setNotifications(updatedNotifications);

    saveState(updatedUsers, businesses, campaigns, reviews, updatedWithdrawals, logs, referrals, updatedNotifications);
    return true;
  };

  const declareTaxPayment = (id: string, paymentMethod: string, referenceCode: string, amountPaid: number) => {
    const updatedWithdrawals = withdrawals.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: 'pending' as const, // move to pending/verification after they submit the reference code
          feePaymentStatus: 'verifying' as const,
          feePaymentReference: referenceCode,
          taxPaidMethod: paymentMethod,
          taxPaidAmount: amountPaid
        };
      }
      return w;
    });
    setWithdrawals(updatedWithdrawals);
    addSecurityLog(`User declared tax payment for withdrawal ${id}. Method: ${paymentMethod}, Ref: ${referenceCode}`);

    // Notify user
    const req = withdrawals.find(w => w.id === id);
    if (req) {
      const freshNotif: Notification = {
        id: `n-${Date.now()}-taxdec`,
        userId: req.userId,
        message: `Your tax payment of $${amountPaid.toFixed(2)} via ${paymentMethod} is being verified (Ref: ${referenceCode}).`,
        type: 'withdrawal_status',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications([freshNotif, ...notifications]);
    }

    saveState(users, businesses, campaigns, reviews, updatedWithdrawals, logs, referrals, notifications);
  };

  const updateWithdrawalFeePayment = (
    id: string,
    feePaymentStatus: 'unpaid' | 'verifying' | 'verified' | 'failed',
    reference?: string
  ) => {
    const updatedWithdrawals = withdrawals.map(w => {
      if (w.id === id) {
        return {
          ...w,
          feePaymentStatus,
          feePaymentReference: reference !== undefined ? reference : w.feePaymentReference
        };
      }
      return w;
    });
    setWithdrawals(updatedWithdrawals);

    if (feePaymentStatus === 'verified') {
      addSecurityLog(`Withdrawal processing fee verified for request ${id}`);
    } else if (feePaymentStatus === 'verifying') {
      addSecurityLog(`Withdrawal fee verification requested for request ${id} with reference: ${reference || 'N/A'}`);
    }

    saveState(users, businesses, campaigns, reviews, updatedWithdrawals, logs, referrals, notifications);
  };

  const cancelWithdrawal = (id: string, reason: string = 'Processing fee payment could not be verified.') => {
    const req = withdrawals.find(w => w.id === id);
    if (!req) return;

    const updatedWithdrawals = withdrawals.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: 'cancelled' as const,
          feePaymentStatus: 'failed' as const,
          details: w.details ? `${w.details} (Cancelled: ${reason})` : `Cancelled: ${reason}`
        };
      }
      return w;
    });
    setWithdrawals(updatedWithdrawals);

    let updatedUsers = [...users];
    let updatedNotifications = [...notifications];

    const requester = users.find(u => u.id === req.userId);
    if (requester) {
      const finalBalance = requester.balance + req.amount;
      const pendingDec = Math.max(0, requester.pendingWithdrawalsCount - 1);

      const updatedRequester: User = {
        ...requester,
        balance: finalBalance,
        pendingWithdrawalsCount: pendingDec
      };

      updatedUsers = updatedUsers.map(u => u.id === requester.id ? updatedRequester : u);

      const statusNotif: Notification = {
        id: `n-${Date.now()}-withdrawcancel`,
        userId: requester.id,
        message: `Your withdrawal of $${req.amount.toFixed(2)} has been cancelled. Required Processing & Compliance Fee could not be verified. Funds returned to wallet.`,
        type: 'withdrawal_status',
        read: false,
        createdAt: new Date().toISOString()
      };
      updatedNotifications = [statusNotif, ...updatedNotifications];

      if (currentUser && currentUser.id === requester.id) {
        setCurrentUser(updatedRequester);
        localStorage.setItem('rh_currentUser', JSON.stringify(updatedRequester));
      }
    }

    addSecurityLog(`Withdrawal request ${id} cancelled. Reason: ${reason}`);
    setUsers(updatedUsers);
    setNotifications(updatedNotifications);
    saveState(updatedUsers, businesses, campaigns, reviews, updatedWithdrawals, logs, referrals, updatedNotifications);
  };

  const approveWithdrawal = (id: string, status: 'pending' | 'awaiting_tax_payment' | 'tax_received' | 'processing' | 'paid' | 'rejected') => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const req = withdrawals.find(w => w.id === id);
    if (!req) return;

    const updatedWithdrawals = withdrawals.map(w => {
      if (w.id === id) {
        const feePaymentStatus = 
          status === 'tax_received' || status === 'processing' || status === 'paid' 
            ? ('verified' as const) 
            : status === 'rejected' 
            ? ('failed' as const) 
            : w.feePaymentStatus;

        return { 
          ...w, 
          status,
          feePaymentStatus
        };
      }
      return w;
    });
    setWithdrawals(updatedWithdrawals);

    let updatedUsers = [...users];
    let updatedNotifications = [...notifications];
    
    // Find the user who requested
    const requester = users.find(u => u.id === req.userId);
    if (requester) {
      let finalBalance = requester.balance;
      let pendingDec = requester.pendingWithdrawalsCount;

      if (status === 'rejected') {
        // Refund back to their balance
        finalBalance += req.amount;
        pendingDec = Math.max(0, requester.pendingWithdrawalsCount - 1);
      } else if (status === 'paid') {
        pendingDec = Math.max(0, requester.pendingWithdrawalsCount - 1);
      }
      
      const updatedRequester: User = {
        ...requester,
        balance: finalBalance,
        pendingWithdrawalsCount: pendingDec
      };
      
      updatedUsers = updatedUsers.map(u => u.id === requester.id ? updatedRequester : u);

      // Create status update notification
      const statusLabels: Record<string, string> = {
        'awaiting_tax_payment': 'requires your processing tax payment before processing',
        'pending': 'is awaiting admin verification of your tax payment',
        'tax_received': 'has verified tax payment and is ready for payout',
        'processing': 'is now being processed by our payments team',
        'paid': 'has been paid out completely to your account details',
        'rejected': 'was rejected, and your funds have been refunded to your wallet balance'
      };
      
      const statusNotif: Notification = {
        id: `n-${Date.now()}-withdrawstat`,
        userId: requester.id,
        message: `Your withdrawal of $${req.amount.toFixed(2)} ${statusLabels[status] || 'has updated status'}.`,
        type: 'withdrawal_status',
        read: false,
        createdAt: new Date().toISOString()
      };
      updatedNotifications = [statusNotif, ...updatedNotifications];

      if (currentUser.id === requester.id) {
        setCurrentUser(updatedRequester);
        localStorage.setItem('rh_currentUser', JSON.stringify(updatedRequester));
      }
    }

    addSecurityLog(`Admin changed withdrawal status to: ${status} for ${req.userName} ($${req.amount.toFixed(2)})`);
    setUsers(updatedUsers);
    setNotifications(updatedNotifications);
    saveState(updatedUsers, businesses, campaigns, reviews, updatedWithdrawals, logs, referrals, updatedNotifications);
  };

  // Administrative Control Actions
  const updateCampaignPackage = (id: string, reviewsCount: number, costPerReview: number) => {
    const updatedPackages = campaignPackages.map(pkg => pkg.id === id ? { ...pkg, reviewsCount, costPerReview } : pkg);
    setCampaignPackages(updatedPackages);
    localStorage.setItem('rh_campaign_packages', JSON.stringify(updatedPackages));
    addSecurityLog(`Admin updated campaign package ${id}: ${reviewsCount} reviews @ $${costPerReview}/review`);
  };

  const suspendUser = (userId: string, suspend: boolean) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, suspended: suspend } : u);
    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId && suspend) {
      setCurrentUser(null);
      localStorage.removeItem('rh_currentUser');
    }
    
    addSecurityLog(`Admin changed user ${userId} suspension state to: ${suspend}`);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
  };

  const restrictUser = (userId: string, restricted: boolean, notes?: string) => {
    const timestamp = new Date().toISOString();
    const action = restricted ? 'Restricted from receiving jobs' : 'Restriction removed';
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const history = u.restrictionHistory || [];
        const newHistoryItem = { timestamp, action, notes };
        return {
          ...u,
          restricted,
          restrictionNotes: notes || '',
          restrictionHistory: [newHistoryItem, ...history]
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId) {
      const history = currentUser.restrictionHistory || [];
      const newHistoryItem = { timestamp, action, notes };
      const updatedCurr = {
        ...currentUser,
        restricted,
        restrictionNotes: notes || '',
        restrictionHistory: [newHistoryItem, ...history]
      };
      setCurrentUser(updatedCurr);
      localStorage.setItem('rh_currentUser', JSON.stringify(updatedCurr));
    }
    
    addSecurityLog(`Admin updated user ${userId} restriction state to: ${restricted}. Notes: ${notes || 'None'}`);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
  };

  const editUserBalance = (userId: string, newBalance: number) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, balance: newBalance } : u);
    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId) {
      const updatedCurr = { ...currentUser, balance: newBalance };
      setCurrentUser(updatedCurr);
      localStorage.setItem('rh_currentUser', JSON.stringify(updatedCurr));
    }
    
    addSecurityLog(`Admin adjusted user ${userId} balance manually to $${newBalance.toFixed(2)}`);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
  };

  const changeUserLevel = (userId: string, level: AccountLevel) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, accountLevel: level } : u);
    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId) {
      const updatedCurr = { ...currentUser, accountLevel: level };
      setCurrentUser(updatedCurr);
      localStorage.setItem('rh_currentUser', JSON.stringify(updatedCurr));
    }
    
    addSecurityLog(`Admin adjusted user ${userId} account level to: ${level}`);
    saveState(updatedUsers, businesses, campaigns, reviews, withdrawals, logs);
  };

  const updateCampaignStatus = (campaignId: string, status: 'active' | 'paused' | 'completed') => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    let updatedUsers = [...users];
    
    // If campaign is closed/completed manually by admin, refund remaining budget to business owner
    if (status === 'completed' && campaign.status !== 'completed') {
      const remainingReviews = campaign.reviewsNeeded - campaign.reviewsCompleted;
      if (remainingReviews > 0) {
        const refundAmount = remainingReviews * campaign.rewardPerReview;
        const biz = businesses.find(b => b.id === campaign.businessId);
        if (biz) {
          const owner = users.find(u => u.id === biz.ownerId);
          if (owner) {
            const updatedOwner = { ...owner, balance: owner.balance + refundAmount };
            updatedUsers = updatedUsers.map(u => u.id === owner.id ? updatedOwner : u);
            
            if (currentUser && currentUser.id === owner.id) {
              setCurrentUser(updatedOwner);
              localStorage.setItem('rh_currentUser', JSON.stringify(updatedOwner));
            }
            addSecurityLog(`Refunded remaining campaign budget $${refundAmount.toFixed(2)} to business owner ${owner.fullName}`);
          }
        }
      }
    }
    
    const updatedCampaigns = campaigns.map(c => c.id === campaignId ? { ...c, status } : c);
    setCampaigns(updatedCampaigns);
    addSecurityLog(`Admin changed campaign ${campaignId} status to: ${status}`);
    saveState(updatedUsers, businesses, updatedCampaigns, reviews, withdrawals, logs);
  };

  const flagReview = (reviewId: string, isSuspicious: boolean) => {
    const updatedReviews = reviews.map(r => r.id === reviewId ? { ...r, isSuspicious } : r);
    setReviews(updatedReviews);
    addSecurityLog(`Admin flagged review ${reviewId} as suspicious: ${isSuspicious}`);
    saveState(users, businesses, campaigns, updatedReviews, withdrawals, logs);
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      reviewerActiveTab,
      setReviewerActiveTab,
      users,
      businesses,
      campaigns,
      reviews,
      withdrawals,
      logs,
      theme,
      campaignPackages,
      referrals,
      notifications,
      toggleTheme,
      login,
      logout,
      register,
      updateUserSecurity,
      addBusiness,
      approveBusiness,
      createCampaign,
      submitReview,
      approveReview,
      requestWithdrawal,
      approveWithdrawal,
      updateWithdrawalFeePayment,
      cancelWithdrawal,
      addSecurityLog,
      resetPasswordFlow,
      setUsers,
      withdrawalSettings,
      updateWithdrawalSettings,
      declareTaxPayment,
      updateCampaignPackage,
      suspendUser,
      restrictUser,
      editUserBalance,
      changeUserLevel,
      updateCampaignStatus,
      flagReview,
      claimDailyLoginReward,
      transferReferralBalance,
      referUser,
      addNotification,
      markNotificationAsRead,
      depositRequests,
      createDepositRequest,
      processDepositRequest
    }}>
      <div className="text-slate-950 bg-slate-50 min-h-screen">
        {children}
      </div>
    </StoreContext.Provider>
  );
};
