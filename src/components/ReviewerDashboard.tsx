import React, { useState, useEffect } from 'react';
import { useStore } from '../state/StoreContext';
import { Campaign, ReviewJob, AccountLevel } from '../types';
import { 
  Star, DollarSign, Clock, ArrowUpRight, CheckCircle2, AlertCircle, 
  Building2, Send, CreditCard, ChevronRight, MessageSquareCode, Award, 
  ShieldAlert, Lock, Filter, ExternalLink, ShieldCheck, Timer, Sparkles, 
  ThumbsUp, Check, Play, RefreshCw, Wallet, User, Copy, ArrowLeft, Info, Landmark,
  QrCode, Coins, FileText, Smartphone
} from 'lucide-react';
import { PayoutPortal } from './PayoutPortal';

export const ReviewerDashboard: React.FC = () => {
  const {
    currentUser,
    campaigns,
    reviews,
    withdrawals,
    submitReview,
    requestWithdrawal,
    updateWithdrawalFeePayment,
    theme,
    referrals: storeReferrals,
    claimDailyLoginReward,
    transferReferralBalance,
    referUser,
    withdrawalSettings,
    declareTaxPayment,
    reviewerActiveTab: activeTab,
    setReviewerActiveTab: setActiveTab
  } = useStore();

  // Active Workspace Tab state
  // Synchronized via StoreContext to allow quick header balance links

  // Campaign & selection states
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [privateFeedback, setPrivateFeedback] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(60);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Page refreshing state for restricted notices
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Referral form states
  const [referEmail, setReferEmail] = useState('');

  // Withdrawal form states
  const [withdrawStep, setWithdrawStep] = useState<number>(1);
  const [selectedMethod, setSelectedMethod] = useState<string>('M-Pesa');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [destData, setDestData] = useState<Record<string, string>>({});
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Tax Payment states
  const [taxMethod, setTaxMethod] = useState<string>('USDT TRC20');
  const [taxReference, setTaxReference] = useState<string>('');
  const [taxError, setTaxError] = useState<string>('');
  const [taxSuccess, setTaxSuccess] = useState<boolean>(false);

  // Fee Verification states
  const [feeMpesaRef, setFeeMpesaRef] = useState<Record<string, string>>({}); // keyed by withdrawalId
  const [feeVerifyLoading, setFeeVerifyLoading] = useState<Record<string, boolean>>({}); // keyed by withdrawalId
  const [feeVerifyAttempts, setFeeVerifyAttempts] = useState<Record<string, number>>({}); // keyed by withdrawalId
  const [feeVerifyStatus, setFeeVerifyStatus] = useState<Record<string, 'unpaid' | 'paid_unverified' | 'verifying' | 'verified' | 'failed'>>({}); // keyed by withdrawalId
  const [feeVerifyError, setFeeVerifyError] = useState<Record<string, string>>({}); // keyed by withdrawalId

  const handleFeePaymentDeclaration = (withdrawalId: string) => {
    setFeeVerifyStatus(prev => ({ ...prev, [withdrawalId]: 'paid_unverified' }));
  };

  const handleFeeVerification = (withdrawalId: string) => {
    const referenceCode = (feeMpesaRef[withdrawalId] || '').trim();
    setFeeVerifyLoading(prev => ({ ...prev, [withdrawalId]: true }));
    setFeeVerifyError(prev => ({ ...prev, [withdrawalId]: '' }));
    setFeeVerifyStatus(prev => ({ ...prev, [withdrawalId]: 'verifying' }));

    // Simulate network checking delay (loading/checking animation)
    setTimeout(() => {
      setFeeVerifyLoading(prev => ({ ...prev, [withdrawalId]: false }));
      
      const currentAttempts = feeVerifyAttempts[withdrawalId] || 0;
      const nextAttempts = currentAttempts + 1;
      setFeeVerifyAttempts(prev => ({ ...prev, [withdrawalId]: nextAttempts }));

      if (nextAttempts === 1) {
        // First attempt: Payment Not Yet Received
        setFeeVerifyStatus(prev => ({ ...prev, [withdrawalId]: 'failed' }));
        setFeeVerifyError(prev => ({ 
          ...prev, 
          [withdrawalId]: 'Payment Not Yet Received — Please wait a few minutes and try again, or contact support with your transaction code.' 
        }));
        updateWithdrawalFeePayment(withdrawalId, 'failed', referenceCode);
      } else {
        // Subsequent attempts: Payment Verified Successfully
        setFeeVerifyStatus(prev => ({ ...prev, [withdrawalId]: 'verified' }));
        updateWithdrawalFeePayment(withdrawalId, 'verified', referenceCode);
      }
    }, 2500); // 2.5 seconds checking animation
  };

  // Level requirements & validation helper
  const getRequiredLevel = (reward: number): AccountLevel => {
    if (reward >= 25) return 'Level 5';
    if (reward >= 20) return 'Level 4';
    if (reward >= 18) return 'Level 3';
    if (reward >= 12) return 'Level 2';
    return 'Level 1';
  };

  const getLevelRank = (level: AccountLevel): number => {
    const levelRank: Record<AccountLevel, number> = {
      'Level 1': 1,
      'Level 2': 2,
      'Level 3': 3,
      'Level 4': 4,
      'Level 5': 5
    };
    return levelRank[level] || 1;
  };

  const canAccessJob = (reward: number, userLevel: AccountLevel): boolean => {
    const userRank = getLevelRank(userLevel);
    const reqLevel = getRequiredLevel(reward);
    const reqRank = getLevelRank(reqLevel);
    return userRank >= reqRank;
  };

  // Categories list as specified
  const categories = [
    'All',
    'Hotels & Resorts',
    'Forex Brokers',
    'Prop Firms',
    'AI Tools',
    'VPN Services',
    'Hosting Providers',
    'Financial Services',
    'E-commerce Platforms',
    'Education Platforms',
    'Software & SaaS',
    'Travel Companies',
    'Food & Beverage',
    'Health & Wellness'
  ];

  // Reset timer on campaign change
  useEffect(() => {
    if (!selectedCampaign) return;
    setTimeLeft(60);
  }, [selectedCampaign]);

  // Live countdown ticker
  useEffect(() => {
    if (!selectedCampaign || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCampaign, timeLeft]);

  if (!currentUser) return null;

  // Filter campaigns that are active
  const activeCampaigns = campaigns.filter(c => c.status === 'active' && c.reviewsCompleted < c.reviewsNeeded);

  // Filter by category
  const filteredCampaigns = selectedCategory === 'All' 
    ? activeCampaigns 
    : activeCampaigns.filter(c => c.category === selectedCategory);

  // Filter reviews written by the logged-in reviewer
  const myReviews = reviews.filter(r => r.reviewerId === currentUser.id);

  // Filter withdrawals by current user
  const myWithdrawals = withdrawals.filter(w => w.userId === currentUser.id);

  // Spam & Repeated characters checker
  const validateGibberishAndSpam = (text: string): string | null => {
    // Check if empty or too brief (already handled, but safety check)
    if (!text || text.trim().length < 10) return null;

    // 1. Check for single character repeated more than 4 times (e.g. "aaaaa" or "!!!!")
    const repeatedCharPattern = /(.)\1{4,}/;
    if (repeatedCharPattern.test(text)) {
      return "Rule 6 Violation: Excessive repeating character sequence detected (e.g. 'aaaaa'). Please write natural reviews.";
    }

    // 2. Check for keyboard smash or massive word with no vowels (e.g. "asdfghjkl" or "qwertyuiop")
    const longWordWithNoVowels = /\b[bcdfghjklmnpqrstvwxyz]{8,}\b/i;
    if (longWordWithNoVowels.test(text)) {
      return "Rule 6 Violation: Potential keyboard smash or gibberish detected. Please write genuine review text.";
    }

    // 3. Check for repeated words consecutively (e.g. "good good good good good")
    const repeatedWords = /\b(\w+)\b(?:\s+\1\b){3,}/i;
    if (repeatedWords.test(text)) {
      return "Rule 6 Violation: Repeated word pattern detected. Please provide authentic feedback.";
    }

    return null;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!selectedCampaign) return;

    // Rule 1 Verification: Spend 60 seconds
    if (timeLeft > 0) {
      setReviewError(`Rule 1 Violation: You must spend at least 60 seconds analyzing the target business details before submitting. Please read the documentation page for another ${timeLeft} seconds.`);
      return;
    }

    // Rule 2 Verification: Star rating 1 to 5
    if (rating < 1 || rating > 5) {
      setReviewError("Rule 2 Violation: Please provide a star rating from 1 to 5.");
      return;
    }

    // Rule 3 Verification: Write meaningful feedback (100–1000 characters)
    const reviewLen = reviewContent.trim().length;
    if (reviewLen < 100) {
      setReviewError(`Rule 3 Violation: Your review content is too brief (${reviewLen} characters). Minimum limit is 100 characters.`);
      return;
    }
    if (reviewLen > 1000) {
      setReviewError(`Rule 3 Violation: Your review content is too long (${reviewLen} characters). Maximum limit is 1000 characters.`);
      return;
    }

    // Rule 4 Verification: Duplicate / Copy check
    const normalizedContent = reviewContent.trim().toLowerCase();
    const isCopy = reviews.some(r => r.content.trim().toLowerCase() === normalizedContent);
    if (isCopy) {
      setReviewError("Rule 4 Violation: Copy-paste detected! This review has been copied from a previous submission. Please write original feedback.");
      return;
    }

    // Rule 6 Verification: Spam / Gibberish
    const spamError = validateGibberishAndSpam(reviewContent);
    if (spamError) {
      setReviewError(spamError);
      return;
    }

    // Rule 7 Verification: Only complete specific job once
    const alreadyReviewed = myReviews.some(r => r.campaignId === selectedCampaign.id);
    if (alreadyReviewed) {
      setReviewError("Rule 7 Violation: You have already completed a review for this campaign.");
      return;
    }

    // All rules cleared! Submit review
    submitReview(selectedCampaign.id, rating, reviewContent, privateFeedback || 'No private feedback provided.');
    setReviewSuccess(true);
    
    setTimeout(() => {
      setSelectedCampaign(null);
      setReviewSuccess(false);
      setReviewContent('');
      setPrivateFeedback('');
      setRating(5);
    }, 2000);
  };

  const validateDestinationDetails = (): string => {
    if (['Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod)) {
      const addr = (destData.walletAddress || '').trim();
      if (!addr) return 'Wallet address is required.';
      if (selectedMethod === 'Bitcoin') {
        if (!addr.startsWith('1') && !addr.startsWith('3') && !addr.startsWith('bc1')) {
          return 'Invalid Bitcoin address format. Must start with 1, 3, or bc1.';
        }
        if (addr.length < 26) return 'Bitcoin address is too short.';
      } else if (selectedMethod === 'USDT TRC20') {
        if (!addr.startsWith('T')) {
          return 'Invalid TRC20 address. TRC20 USDT addresses must start with T.';
        }
        if (addr.length < 34) return 'TRC20 address is too short.';
      } else if (['USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod)) {
        if (!addr.startsWith('0x')) {
          return 'Invalid Ethereum/EVM address. Must start with 0x.';
        }
        if (addr.length !== 42) return 'Invalid address length. EVM addresses must be 42 characters.';
      }
    } else if (selectedMethod === 'M-Pesa') {
      if (!(destData.fullName || '').trim()) return 'Full registered name is required.';
      const phone = (destData.phone || '').trim();
      if (!phone) return 'M-Pesa mobile number is required.';
      if (phone.length < 9) return 'Please enter a valid mobile number.';
    } else if (selectedMethod === 'Bank Transfer') {
      if (!(destData.accountName || '').trim()) return 'Account name is required.';
      if (!(destData.bankName || '').trim()) return 'Bank name is required.';
      if (!(destData.accountNumber || '').trim()) return 'Account number is required.';
      if (!(destData.swiftCode || '').trim()) return 'SWIFT / BIC code is required.';
    } else if (['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod)) {
      const email = (destData.email || '').trim();
      if (!email) return 'Recipient Email address is required.';
      if (!email.includes('@')) return 'Please enter a valid email address.';
    } else if (selectedMethod === 'Payoneer') {
      if (!(destData.payoneerId || '').trim()) return 'Payoneer Email or Account ID is required.';
    } else if (['Western Union', 'MoneyGram'].includes(selectedMethod)) {
      if (!(destData.fullName || '').trim()) return 'Recipient full name is required.';
      if (!(destData.country || '').trim()) return 'Recipient country is required.';
      if (!(destData.phone || '').trim()) return 'Recipient phone number is required.';
    } else if (['Visa', 'Mastercard'].includes(selectedMethod)) {
      if (!(destData.cardholderName || '').trim()) return 'Cardholder name is required.';
      const cardNum = (destData.cardNumber || '').trim().replace(/\s/g, '');
      if (!cardNum || cardNum.length < 15) return 'Please enter a valid card number.';
      if (!(destData.expiryDate || '').trim()) return 'Expiry date MM/YY is required.';
    } else if (selectedMethod === 'Binance Pay') {
      if (!(destData.binanceId || '').trim()) return 'Binance Pay ID or email is required.';
    } else if (selectedMethod === 'Perfect Money') {
      if (!(destData.pmAccount || '').trim()) return 'Perfect Money account is required.';
    } else if (selectedMethod === 'AdvCash') {
      if (!(destData.advAccount || '').trim()) return 'AdvCash email or wallet number is required.';
    }
    return '';
  };

  const handleWithdrawalNext = () => {
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (withdrawStep === 1) {
      setWithdrawStep(2);
      return;
    }

    if (withdrawStep === 2) {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawError('Please enter a valid positive withdrawal amount.');
        return;
      }

      if (amount > currentUser.balance) {
        setWithdrawError(`Insufficient balance. You can withdraw up to $${currentUser.balance.toFixed(2)}.`);
        return;
      }

      // Check standard method minimum limit of $500
      const isStandard = !['M-Pesa', 'Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod);
      if (isStandard && amount < 500) {
        setWithdrawError('This payment method requires a minimum withdrawal of $500.');
        return;
      }

      if (amount < 10) {
        setWithdrawError('The minimum withdrawal limit is $10.00.');
        return;
      }

      setWithdrawStep(3);
      return;
    }

    if (withdrawStep === 3) {
      const validationErr = validateDestinationDetails();
      if (validationErr) {
        setWithdrawError(validationErr);
        return;
      }

      let detailsString = '';
      if (selectedMethod === 'M-Pesa') {
        detailsString = `Name: ${destData.fullName}, Phone: ${destData.phone}`;
      } else if (['Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod)) {
        detailsString = `Wallet Address: ${destData.walletAddress}`;
      } else if (selectedMethod === 'Bank Transfer') {
        detailsString = `Bank: ${destData.bankName}, Account Name: ${destData.accountName}, A/C: ${destData.accountNumber}, SWIFT: ${destData.swiftCode}`;
      } else if (['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod)) {
        detailsString = `Email: ${destData.email}`;
      } else if (selectedMethod === 'Payoneer') {
        detailsString = `Payoneer ID: ${destData.payoneerId}`;
      } else if (['Western Union', 'MoneyGram'].includes(selectedMethod)) {
        detailsString = `Name: ${destData.fullName}, Country: ${destData.country}, Phone: ${destData.phone}`;
      } else if (['Visa', 'Mastercard'].includes(selectedMethod)) {
        detailsString = `Card: ${destData.cardholderName}, Number: **** **** **** ${destData.cardNumber?.slice(-4) || 'xxxx'}, Expiry: ${destData.expiryDate}`;
      } else if (selectedMethod === 'Binance Pay') {
        detailsString = `Binance Pay ID/Email: ${destData.binanceId}`;
      } else if (selectedMethod === 'Perfect Money') {
        detailsString = `Perfect Money Account: ${destData.pmAccount}`;
      } else if (selectedMethod === 'AdvCash') {
        detailsString = `AdvCash: ${destData.advAccount}`;
      }

      const amountVal = parseFloat(withdrawAmount);
      const ok = requestWithdrawal(amountVal, selectedMethod, detailsString, destData);
      if (ok) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setDestData({});
        setWithdrawStep(1);
        
        // Auto-select the newly created request so they are directly shown the Step 4 payment details
        setTimeout(() => {
          const fresh = [...withdrawals].sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
          const latest = fresh.find(w => w.userId === currentUser.id);
          if (latest) {
            setSelectedWithdrawalId(latest.id);
          }
        }, 100);
      } else {
        setWithdrawError('An error occurred during transaction routing.');
      }
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleWithdrawalNext();
  };

  const getLevelBadge = (level: AccountLevel) => {
    switch (level) {
      case 'Level 5':
        return 'bg-gradient-to-r from-red-500 to-amber-500 text-white font-extrabold';
      case 'Level 4':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold';
      case 'Level 3':
        return 'bg-indigo-500 text-white font-bold';
      case 'Level 2':
        return 'bg-emerald-500 text-white font-semibold';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getEstimatedTime = (reward: number): string => {
    if (reward >= 25) return '10 mins';
    if (reward >= 18) return '7 mins';
    return '5 mins';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Greeting Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Reviewer Workspace
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse campaigns, audit digital websites under strictly enforced SLAs, and claim on-chain payouts.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm`}>
          <Award className="w-5 h-5 text-indigo-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rank Tier:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${getLevelBadge(currentUser.accountLevel)}`}>
            {currentUser.accountLevel}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            ({currentUser.completedReviewsCount} completed)
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Current Balance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Withdrawable Balance
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${currentUser.balance.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-indigo-500 font-mono font-bold">
            Escrow Guarded Wallet
          </div>
        </div>

        {/* KPI 2: Total Earnings */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Lifetime Earnings
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${currentUser.totalEarnings.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-emerald-500 font-mono font-bold">
            Verified proof-of-work
          </div>
        </div>

        {/* KPI 3: Completed Reviews */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Completed Audits
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {currentUser.completedReviewsCount}
          </span>
          <div className="mt-2 text-[10px] text-blue-500 font-mono font-bold">
            All levels verified
          </div>
        </div>

        {/* KPI 4: Pending Withdrawals */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Pending Transits
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {currentUser.pendingWithdrawalsCount}
          </span>
          <div className="mt-2 text-[10px] text-amber-500 font-mono font-bold">
            {myWithdrawals.filter(w => w.status === 'pending').length} active pipeline
          </div>
        </div>

        {/* KPI 5: Level Benefits Info */}
        <div className="p-5 bg-gradient-to-tr from-indigo-950/20 to-violet-950/20 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-2xl border border-indigo-500/20 shadow-sm relative overflow-hidden col-span-2 lg:col-span-1">
          <span className="block text-xs font-semibold text-indigo-400 dark:text-indigo-300 uppercase tracking-wide">
            Level Progress Guide
          </span>
          <span className="block text-sm font-black text-slate-900 dark:text-white mt-2 font-mono">
            {currentUser.completedReviewsCount < 20 ? 'Level 2 at 20 reviews' :
             currentUser.completedReviewsCount < 50 ? 'Level 3 at 50 reviews' :
             currentUser.completedReviewsCount < 100 ? 'Level 4 at 100 reviews' :
             currentUser.completedReviewsCount < 250 ? 'Level 5 at 250 reviews' :
             'Max Level Unlocked ⚡'}
          </span>
          <div className="mt-2 text-[10px] text-indigo-400 dark:text-indigo-300 font-mono font-bold">
            Higher levels unlock premium payouts
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-1 pb-px overflow-x-auto">
        <button
          id="tab-audit-jobs"
          onClick={() => setActiveTab('audit_jobs')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'audit_jobs'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-slate-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Available Jobs
        </button>
        <button
          id="tab-payout-portal"
          onClick={() => setActiveTab('payout_portal')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'payout_portal'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-slate-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Earnings Withdrawal
        </button>
        <button
          id="tab-referrals"
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'referrals'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-slate-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Referral Network
        </button>
        <button
          id="tab-achievements"
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-slate-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Rewards & Badges
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-8">
        
        {/* TAB 1: Available Jobs & History */}
        {activeTab === 'audit_jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left 2 cols: Jobs list and History */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Available Jobs list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                {currentUser?.restricted ? (
                  /* Restricted Reviewers View */
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Restriction Active</h3>
                        <p className="text-[11px] text-slate-500">The administrator has temporarily paused review quotas for your account.</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                        <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          No Review Jobs Currently Available
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          There are currently no review opportunities assigned to your account. Please refresh this page later as new review campaigns are added regularly. If review campaigns become available for your account, they will appear automatically.
                        </p>
                        <p className="text-[10px] text-indigo-500 font-bold font-mono pt-1 animate-pulse">
                          ℹ️ Internal Notice: Keep refreshing the page.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isRefreshing}
                          onClick={() => {
                            setIsRefreshing(true);
                            setTimeout(() => {
                              setIsRefreshing(false);
                            }, 1500);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                          {isRefreshing ? 'Refreshing Job Feed...' : 'Refresh Jobs'}
                        </button>
                      </div>
                    </div>

                    {/* Locked Campaign Mockups */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                        Unavailable Campaigns (0 slots remaining)
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'Sip & Byte Cafe', cat: 'Food & Beverage', desc: 'Constructive feedback regarding remote-working layout, coffee selection, and overall work ambiance.' },
                          { name: 'Apex Fitness Center', cat: 'Health & Wellness', desc: 'Locker room standards, class bookings interface, and trainer interaction review.' }
                        ].map((mock, index) => (
                          <div 
                            key={index} 
                            className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/60 rounded-xl relative opacity-60 grayscale flex flex-col justify-between"
                          >
                            <span className="absolute top-3 right-3 text-right">
                              <span className="block text-[8px] uppercase font-bold text-slate-400">Reward</span>
                              <span className="text-xs font-black text-slate-400 font-mono">$0.00</span>
                            </span>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center font-bold text-slate-400 text-xs">
                                  {mock.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">{mock.name}</h5>
                                  <span className="text-[8px] px-1 py-0.2 bg-slate-150 dark:bg-slate-800 text-slate-400 rounded font-semibold">{mock.cat}</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{mock.desc}</p>
                              <div className="pt-2 border-t border-slate-200/30 text-[9px] text-slate-400 space-y-1">
                                <div className="flex justify-between font-mono">
                                  <span>Quota Status:</span>
                                  <span className="text-rose-500 font-bold uppercase tracking-wide">0 Slots Remaining</span>
                                </div>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              disabled 
                              className="mt-3 w-full py-1.5 bg-slate-150 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200/40 cursor-not-allowed"
                            >
                              0 Slots Remaining
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Active View */
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          Available Quality Review Jobs
                        </h3>
                        <p className="text-xs text-slate-500">
                          Select an audit assignment. Escrow deposits ensure high-paying star reviews are paid instantly upon owner approval.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold font-mono">
                        {activeCampaigns.length} total active
                      </span>
                    </div>

                    {/* Category Filter Horizontal Scrollbar */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          id={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200/60 dark:border-slate-850'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Jobs Grid */}
                    {filteredCampaigns.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-850 rounded-2xl">
                        <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No active review opportunities for category: <strong>{selectedCategory}</strong>.</p>
                        <p className="text-xs text-slate-400 mt-1">Check back later or register a business under this sector!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCampaigns.map((camp) => {
                          const reviewed = myReviews.some(r => r.campaignId === camp.id);
                          const reqLevel = getRequiredLevel(camp.rewardPerReview);
                          const isAccessible = canAccessJob(camp.rewardPerReview, currentUser.accountLevel);
                          const estTime = getEstimatedTime(camp.rewardPerReview);

                          return (
                            <div
                              key={camp.id}
                              id={`campaign-card-${camp.id}`}
                              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 relative ${
                                reviewed 
                                  ? 'bg-slate-50/60 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 opacity-60'
                                  : !isAccessible
                                  ? 'bg-slate-50/30 dark:bg-slate-950/10 border-slate-200/60 dark:border-slate-850/60'
                                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md'
                              }`}
                            >
                              {/* Reward Payout Tag */}
                              <div className="absolute top-4 right-4 text-right">
                                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Reward Payout</span>
                                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                                  ${camp.rewardPerReview.toFixed(2)}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex-shrink-0 flex items-center justify-center text-indigo-500 overflow-hidden font-display font-black border border-indigo-500/20">
                                    {camp.businessName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                      {camp.businessName}
                                    </h4>
                                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400 rounded font-semibold tracking-wide">
                                      {camp.category}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                  {camp.description}
                                </p>

                                <div className="pt-2 space-y-1.5 border-t border-slate-100/50 dark:border-slate-850/50 text-[10px] text-slate-400 dark:text-slate-500">
                                  <div className="flex justify-between">
                                    <span>Estimated Duration:</span>
                                    <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">{estTime}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Secure Domain:</span>
                                    <span className="font-semibold text-indigo-500 hover:underline flex items-center gap-0.5">
                                      {camp.businessName.toLowerCase().replace(/\s+/g, '')}.com
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Campaign Quota Left:</span>
                                    <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">
                                      {camp.reviewsNeeded - camp.reviewsCompleted} slots of {camp.reviewsNeeded} remaining
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100/70 dark:border-slate-850/80 flex items-center justify-between">
                                {reviewed ? (
                                  <span className="w-full text-center py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Review Completed
                                  </span>
                                ) : !isAccessible ? (
                                  <div className="w-full flex items-center justify-between bg-slate-100 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-850/60">
                                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                                      <Lock className="w-3 h-3 text-slate-400" />
                                      Locked for level-up.
                                    </span>
                                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold uppercase tracking-wider">
                                      Requires {reqLevel}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    id={`btn-apply-campaign-${camp.id}`}
                                    onClick={() => setSelectedCampaign(camp)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <Play className="w-3 h-3 fill-current text-white" />
                                    Start Review
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* History Ledger list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  My Audit History Ledger
                </h3>

                {myReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    You haven't submitted any audits yet. Complete active review campaigns above to fill your on-chain ledger history.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                          <th className="pb-3 pl-1">Business Name</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Reward</th>
                          <th className="pb-3">Rating</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-600 dark:text-slate-300">
                        {myReviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                            <td className="py-3.5 pl-1 font-bold text-slate-900 dark:text-white">
                              {rev.businessName}
                            </td>
                            <td className="py-3.5 text-slate-400">
                              {new Date(rev.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                              ${rev.rewardAmount.toFixed(2)}
                            </td>
                            <td className="py-3.5">
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                                  : rev.status === 'rejected'
                                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/40 text-rose-600 dark:text-rose-400'
                                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {rev.status === 'approved' ? 'Approved & Paid' : rev.status === 'rejected' ? 'Rejected' : 'Awaiting Audit'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right panel: Quick check-in shortcut */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 mb-3 text-indigo-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>XP Profile Stats</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">XP Level Milestone</span>
                    <div className="flex justify-between text-[10px] font-mono mb-1 font-bold">
                      <span>{currentUser.xp || 0} XP earned</span>
                      <span>Target: {(getLevelRank(currentUser.accountLevel) * 100)} XP</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((currentUser.xp || 0) / (getLevelRank(currentUser.accountLevel) * 100)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Referral Balance</span>
                      <span className="font-bold text-slate-100 font-mono">${(currentUser.referralBalance || 0).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('referrals')}
                      className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                    >
                      View Network
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Payout & Wallet with Redesigned Payout Portal */}
        {activeTab === 'payout_portal' && (
          <PayoutPortal />
        )}
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left side: Advanced Payout Request Wizard */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-500" />
                      Secure Financial Withdrawal Hub
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Initiate premium on-chain and fiat clearing of your earned escrow balances.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-mono">Available Balance</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">${currentUser.balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
                  {[
                    { step: 1, label: '1. Gateway Method' },
                    { step: 2, label: '2. Amount Limit' },
                    { step: 3, label: '3. Coordinates' }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`py-2 px-1 rounded-xl font-bold border transition-all ${
                        withdrawStep === s.step
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : withdrawStep > s.step
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>

                {/* Success & Error boxes */}
                {withdrawSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2.5 mb-6">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Withdrawal Requested Successfully!</p>
                      <p className="font-light">The routing system has registered your request. Please select your request in the history ledger on the right to complete the Processing Tax Payment and monitor clearing progress.</p>
                    </div>
                  </div>
                )}

                {withdrawError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mb-6">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {/* Wizard Steps */}
                <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                  
                  {/* STEP 1: SELECT GATEWAY METHOD */}
                  {withdrawStep === 1 && (
                    <div className="space-y-6">
                      
                      {/* Instant Methods */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">⚡ Instant Withdrawal Methods</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                            Available for all withdrawal amounts
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            'M-Pesa',
                            'Bitcoin',
                            'USDT TRC20',
                            'USDT BEP20',
                            'USDT ERC20',
                            'Ethereum'
                          ].map((method) => (
                            <button
                              key={method}
                              id={`method-card-${method.toLowerCase().replace(/\s/g, '-')}`}
                              type="button"
                              onClick={() => setSelectedMethod(method)}
                              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                selectedMethod === method
                                  ? 'bg-indigo-500/5 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <div className="font-bold text-xs flex justify-between items-center">
                                <span>{method}</span>
                                {selectedMethod === method && <Check className="w-3 h-3" />}
                              </div>
                              <span className="block text-[9px] text-slate-400 mt-1 font-mono">Instant Dispatch</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Standard Methods */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🏦 Standard Withdrawal Methods</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                            Minimum withdrawal: $500
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            'Bank Transfer',
                            'PayPal',
                            'Skrill',
                            'Neteller',
                            'Wise',
                            'Payoneer',
                            'Western Union',
                            'MoneyGram',
                            'Visa',
                            'Mastercard',
                            'Binance Pay',
                            'Perfect Money',
                            'AdvCash'
                          ].map((method) => (
                            <button
                              key={method}
                              id={`method-card-${method.toLowerCase().replace(/\s/g, '-')}`}
                              type="button"
                              onClick={() => setSelectedMethod(method)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                selectedMethod === method
                                  ? 'bg-indigo-500/5 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <div className="font-bold text-[11px] flex justify-between items-center">
                                <span className="truncate">{method}</span>
                                {selectedMethod === method && <Check className="w-3 h-3" />}
                              </div>
                              <span className="block text-[8px] text-slate-400 mt-1 font-mono">Min: $500.00</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 2: ENTER AMOUNT */}
                  {withdrawStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Withdrawal Amount (USD) via <strong className="text-slate-700 dark:text-slate-300">{selectedMethod}</strong>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-mono font-bold text-sm">
                            $
                          </span>
                          <input
                            id="withdraw-amount"
                            type="number"
                            step="0.01"
                            placeholder="500.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-semibold font-mono"
                          />
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-2 font-mono">
                          Available for clearing: ${currentUser.balance.toFixed(2)}
                        </span>
                      </div>

                      {/* Quick select amount buttons */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Quick Presets</span>
                        <div className="grid grid-cols-4 gap-2">
                          {[100, 500, 1000, 5000].map((preset) => {
                            const isStandard = !['M-Pesa', 'Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod);
                            const isDisabled = isStandard && preset < 500;
                            return (
                              <button
                                key={preset}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setWithdrawAmount(preset.toString())}
                                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                                  isDisabled
                                    ? 'opacity-40 bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 hover:border-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer'
                                }`}
                              >
                                ${preset.toLocaleString()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Smart summary card */}
                      {parseFloat(withdrawAmount) > 0 && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/65 border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Estimated Financial Summary</span>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                            <div className="p-2 border border-slate-200/50 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                              <span className="block text-[8px] text-slate-400 font-sans">Withdrawal Request</span>
                              <span className="font-bold text-slate-900 dark:text-white">${parseFloat(withdrawAmount).toFixed(2)}</span>
                            </div>
                            <div className="p-2 border border-slate-200/50 dark:border-slate-800 rounded-lg text-rose-500 bg-white dark:bg-slate-900">
                              <span className="block text-[8px] text-slate-400 font-sans">Processing Tax</span>
                              <span className="font-bold">${(withdrawalSettings.taxFlatFee + (withdrawalSettings.taxPercent / 100) * parseFloat(withdrawAmount)).toFixed(2)}</span>
                            </div>
                            <div className="p-2 border border-slate-200/50 dark:border-slate-800 rounded-lg text-emerald-500 bg-emerald-500/5 bg-white dark:bg-slate-900">
                              <span className="block text-[8px] text-slate-400 font-sans">Net Payout Received</span>
                              <span className="font-bold">${parseFloat(withdrawAmount).toFixed(2)}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans text-center mt-1">
                            Note: The processing tax is paid separately to release the escrow payout in full.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: PAYMENT DESTINATION */}
                  {withdrawStep === 3 && (
                    <div className="space-y-4">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Enter Payout Coordinates for {selectedMethod}
                      </span>

                      {/* CRYPTO FORM */}
                      {['Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod) && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              On-Chain Wallet Address
                            </label>
                            <input
                              type="text"
                              placeholder={
                                selectedMethod === 'Bitcoin'
                                  ? 'e.g. bc1qxy2kg3khsfyr7z2q67z40g0ecgh2t8gff2p9f8'
                                  : selectedMethod === 'USDT TRC20'
                                  ? 'e.g. TX8c7G9zKJD89JSHyH92KJs929JS829S9d'
                                  : 'e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
                              }
                              value={destData.walletAddress || ''}
                              onChange={(e) => setDestData({ ...destData, walletAddress: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                            />
                            <span className="block text-[9px] text-slate-400/90 mt-1">
                              {selectedMethod === 'USDT TRC20'
                                ? '⚠️ Must be a TRON (TRC20) network address. Depositing to other chains results in coin loss.'
                                : '⚠️ Verify that the address matches the correct network rules.'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* M-PESA FORM */}
                      {selectedMethod === 'M-Pesa' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Safaricom Registered Full Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sarah Jenkins Atieno"
                              value={destData.fullName || ''}
                              onChange={(e) => setDestData({ ...destData, fullName: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Mobile Number (International Format)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. +254 712 345678"
                              value={destData.phone || ''}
                              onChange={(e) => setDestData({ ...destData, phone: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {/* BANK TRANSFER FORM */}
                      {selectedMethod === 'Bank Transfer' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Account Beneficiary Name
                              </label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                value={destData.accountName || ''}
                                onChange={(e) => setDestData({ ...destData, accountName: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Bank Name / Provider
                              </label>
                              <input
                                type="text"
                                placeholder="Barclays Bank PLC"
                                value={destData.bankName || ''}
                                onChange={(e) => setDestData({ ...destData, bankName: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Account Number / IBAN
                              </label>
                              <input
                                type="text"
                                placeholder="GB98 BARC 2020 1234 5678"
                                value={destData.accountNumber || ''}
                                onChange={(e) => setDestData({ ...destData, accountNumber: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                SWIFT / BIC Code
                              </label>
                              <input
                                type="text"
                                placeholder="BARCGB22XXX"
                                value={destData.swiftCode || ''}
                                onChange={(e) => setDestData({ ...destData, swiftCode: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* E-WALLETS (PayPal, Skrill, Neteller, Wise) */}
                      {['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod) && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Registered Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="recipient@domain.com"
                            value={destData.email || ''}
                            onChange={(e) => setDestData({ ...destData, email: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                          />
                        </div>
                      )}

                      {/* PAYONEER */}
                      {selectedMethod === 'Payoneer' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Payoneer Email or Customer ID
                          </label>
                          <input
                            type="text"
                            placeholder="payoneer-id-or-email@domain.com"
                            value={destData.payoneerId || ''}
                            onChange={(e) => setDestData({ ...destData, payoneerId: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                          />
                        </div>
                      )}

                      {/* CARD WITHDRAWALS (Visa, Mastercard) */}
                      {['Visa', 'Mastercard'].includes(selectedMethod) && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Cardholder Full Name
                            </label>
                            <input
                              type="text"
                              placeholder="John Smith"
                              value={destData.cardholderName || ''}
                              onChange={(e) => setDestData({ ...destData, cardholderName: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Card Number (16-Digit)
                              </label>
                              <input
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={destData.cardNumber || ''}
                                onChange={(e) => setDestData({ ...destData, cardNumber: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Expiry Date (MM/YY)
                              </label>
                              <input
                                type="text"
                                placeholder="12/28"
                                value={destData.expiryDate || ''}
                                onChange={(e) => setDestData({ ...destData, expiryDate: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* REMITTANCE (Western Union, MoneyGram) */}
                      {['Western Union', 'MoneyGram'].includes(selectedMethod) && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Recipient Legal Full Name
                              </label>
                              <input
                                type="text"
                                placeholder="Alice Smith"
                                value={destData.fullName || ''}
                                onChange={(e) => setDestData({ ...destData, fullName: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Recipient Country / City
                              </label>
                              <input
                                type="text"
                                placeholder="United Kingdom"
                                value={destData.country || ''}
                                onChange={(e) => setDestData({ ...destData, country: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Recipient Mobile Phone
                            </label>
                            <input
                              type="text"
                              placeholder="+44 7123 456789"
                              value={destData.phone || ''}
                              onChange={(e) => setDestData({ ...destData, phone: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* BINANCE PAY */}
                      {selectedMethod === 'Binance Pay' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Binance Pay ID or Registered Email
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 289417839 or register@binance.com"
                            value={destData.binanceId || ''}
                            onChange={(e) => setDestData({ ...destData, binanceId: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                          />
                        </div>
                      )}

                      {/* PERFECT MONEY */}
                      {selectedMethod === 'Perfect Money' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Perfect Money Account ID (starts with U/E/B)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. U12345678"
                            value={destData.pmAccount || ''}
                            onChange={(e) => setDestData({ ...destData, pmAccount: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                          />
                        </div>
                      )}

                      {/* ADVCASH */}
                      {selectedMethod === 'AdvCash' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            AdvCash Registered Email or Wallet ID
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. advcash@domain.com or U 1234 5678 1234"
                            value={destData.advAccount || ''}
                            onChange={(e) => setDestData({ ...destData, advAccount: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono"
                          />
                        </div>
                      )}

                    </div>
                  )}

                  {/* ACTION CONTROLS */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    {withdrawStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawError('');
                          setWithdrawStep(withdrawStep - 1);
                        }}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      id="btn-withdraw-submit"
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {withdrawStep === 3 ? (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Withdrawal Request
                        </>
                      ) : (
                        <>
                          Next Step
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* LIVE PROCESSING STATUS STREAM */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  Live Platform Settlement Feed
                </h4>
                <div className="space-y-3">
                  {[
                    { text: 'Sarah Jenkins requested $120.00 withdrawal via Bitcoin (BTC)', time: 'Just now' },
                    { text: 'Tax Payment Detected for request #w-172819 (Flat: $1.30, Var: $10.00)', time: '3 mins ago' },
                    { text: 'Auditing Desk verified $11.30 processing tax for John Mwangi', time: '14 mins ago' },
                    { text: 'Payout of $500.00 successfully cleared to Barclays Account #****2020', time: '41 mins ago' }
                  ].map((log, i) => (
                    <div key={i} className="flex justify-between text-[11px] font-mono p-2 rounded-lg bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-900">
                      <span className="text-slate-600 dark:text-slate-400 truncate pr-4">{log.text}</span>
                      <span className="text-slate-400/80 text-[10px] flex-shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: Past Payout Ledger and Live status inspection */}
            <div className="space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-indigo-500" />
                  Financial History Ledger
                </h3>

                {withdrawals.filter(w => w.userId === currentUser.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No historical withdrawal data found.</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals
                      .filter(w => w.userId === currentUser.id)
                      .map((w) => {
                        const isExpanded = selectedWithdrawalId === w.id;
                        return (
                          <div
                            key={w.id}
                            className={`rounded-xl border transition-all overflow-hidden ${
                              isExpanded
                                ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-md'
                                : 'border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-300'
                            }`}
                          >
                            
                            {/* Summary header clickable */}
                            <button
                              type="button"
                              onClick={() => setSelectedWithdrawalId(isExpanded ? null : w.id)}
                              className="w-full p-4 flex justify-between items-center text-left cursor-pointer"
                            >
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                                  {w.paymentMethod.replace('_', ' ').toUpperCase()} • ${w.amount.toFixed(2)}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                  {new Date(w.requestedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full font-extrabold border ${
                                  w.status === 'paid'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    : w.status === 'awaiting_tax_payment'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
                                    : w.status === 'pending'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                    : w.status === 'processing'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    : w.status === 'rejected'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    : w.status === 'cancelled'
                                    ? 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                                }`}>
                                  {w.status.replace('_', ' ')}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                            </button>

                            {/* Expanded Details Panel */}
                            {isExpanded && (
                              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 text-xs text-left">
                                
                                {/* 1. Animated Progress Tracker */}
                                <div className="space-y-3">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Live Settlement Progress</span>
                                  <div className="flex justify-between items-center relative py-1.5">
                                    {/* Line connector */}
                                    <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
                                    
                                    {[
                                      { label: 'Created', statuses: ['awaiting_tax_payment', 'pending', 'tax_received', 'processing', 'paid'] },
                                      { label: 'Tax Pending', statuses: ['awaiting_tax_payment'] },
                                      { label: 'Tax Verified', statuses: ['pending', 'tax_received'] },
                                      { label: 'Processing', statuses: ['processing'] },
                                      { label: 'Paid Out', statuses: ['paid'] }
                                    ].map((stage, sIdx) => {
                                      // Determine if stage is completed, active, or pending
                                      const reqStatus = w.status;
                                      const allStatuses = ['awaiting_tax_payment', 'pending', 'tax_received', 'processing', 'paid', 'rejected'];
                                      const currentIdx = allStatuses.indexOf(reqStatus);
                                      
                                      let isDone = false;
                                      let isActive = false;

                                      if (reqStatus === 'rejected') {
                                        // Special case
                                      } else {
                                        if (sIdx === 0) isDone = true;
                                        if (sIdx === 1 && reqStatus === 'awaiting_tax_payment') isActive = true;
                                        if (sIdx === 1 && currentIdx > 0) isDone = true;
                                        if (sIdx === 2 && reqStatus === 'pending') isActive = true;
                                        if (sIdx === 2 && reqStatus === 'tax_received') isActive = true;
                                        if (sIdx === 2 && currentIdx > 2) isDone = true;
                                        if (sIdx === 3 && reqStatus === 'processing') isActive = true;
                                        if (sIdx === 3 && currentIdx > 3) isDone = true;
                                        if (sIdx === 4 && reqStatus === 'paid') isDone = true;
                                      }

                                      return (
                                        <div key={sIdx} className="flex flex-col items-center text-center z-10 space-y-1">
                                          <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                                            isDone
                                              ? 'bg-emerald-500 border-emerald-500 text-white'
                                              : isActive
                                              ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse'
                                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                          }`}>
                                            {isDone ? '✓' : sIdx + 1}
                                          </div>
                                          <span className="text-[8px] font-mono block text-slate-400 mt-1 max-w-[50px] leading-tight">
                                            {stage.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* 2. Smart Summary Card */}
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 space-y-2 font-mono">
                                  <div className="flex justify-between pb-1.5 border-b border-slate-100 dark:border-slate-900 text-[11px]">
                                    <span className="text-slate-400 font-sans">Withdrawal Request:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white">${w.amount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between pb-1.5 border-b border-slate-100 dark:border-slate-900 text-[11px]">
                                    <span className="text-slate-400 font-sans">Processing Tax (2% + $1.30):</span>
                                    <span className="font-extrabold text-rose-500">${w.fee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between pb-1.5 border-b border-slate-100 dark:border-slate-900 text-[11px]">
                                    <span className="text-slate-400 font-sans">Clearing Gateway:</span>
                                    <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase">{w.paymentMethod}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px] leading-tight">
                                    <span className="text-slate-400 font-sans flex-shrink-0">Destination:</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 break-all text-right max-w-[150px]">{w.details}</span>
                                  </div>
                                </div>

                                {/* 3. Crypto Withdrawal Notice */}
                                {['Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(w.paymentMethod) && (
                                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex items-start gap-2">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                    <span className="text-[10px] leading-relaxed">
                                      <strong>Crypto Withdrawal Notice:</strong> Requests enter ledger dispatch processing ONLY once the processing tax has been verified on-chain.
                                    </span>
                                  </div>
                                )}

                                {/* 4. Processing Tax Payment Screen */}
                                {w.status === 'awaiting_tax_payment' && (
                                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-4">
                                    <div className="flex items-start gap-2">
                                      <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Pre-Payout Processing Tax</h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                                          Please clear the statutory clearing charge to dispatch your escrow withdrawal.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Amount Due Details */}
                                    <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-indigo-100/40 dark:border-indigo-900/40 flex justify-between items-center text-center">
                                      <div className="flex-1 border-r border-slate-100 dark:border-slate-900">
                                        <span className="text-[8px] uppercase text-slate-400 block font-mono">Tax Amount (USD)</span>
                                        <span className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400">${w.fee.toFixed(2)}</span>
                                      </div>
                                      <div className="flex-1">
                                        <span className="text-[8px] uppercase text-slate-400 block font-mono font-bold text-[#4EB443]">M-Pesa Equivalent</span>
                                        <span className="text-sm font-extrabold font-mono text-[#4EB443]">{Math.round(w.fee * 130)} KES</span>
                                      </div>
                                    </div>

                                    {/* Choose Payment Method */}
                                    <div className="space-y-2">
                                      <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">1. Select Tax Payment Channel</span>
                                      <div className="grid grid-cols-3 gap-2">
                                        {['USDT TRC20', 'Bitcoin', 'Ethereum', 'M-Pesa'].map((chan) => (
                                          <button
                                            key={chan}
                                            type="button"
                                            onClick={() => setTaxMethod(chan)}
                                            className={`py-1.5 rounded-lg border text-[9px] font-bold text-center cursor-pointer transition-all ${
                                              taxMethod === chan
                                                ? 'bg-indigo-500/5 border-indigo-500 text-indigo-500'
                                                : 'bg-white dark:bg-slate-950 border-slate-200 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                                            }`}
                                          >
                                            {chan}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Active Deposit Coordinates and CSS QR Code */}
                                    <div className="space-y-2">
                                      <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">2. Send Payment to Details</span>
                                      
                                      <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-900 flex gap-4 items-center">
                                        
                                        {/* CSS stylized QR Code / M-Pesa with highly noticeable fee note */}
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                          {taxMethod !== 'M-Pesa' ? (
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap p-1 gap-1">
                                              {[...Array(9)].map((_, idx) => (
                                                <div
                                                  key={idx}
                                                  className={`w-4 h-4 rounded-xs ${
                                                    idx % 2 === 0 || idx === 0 || idx === 8
                                                      ? 'bg-slate-800 dark:bg-slate-200'
                                                      : 'bg-transparent'
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="w-16 h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center p-1 text-emerald-500">
                                              <Smartphone className="w-6 h-6 animate-pulse" />
                                              <span className="text-[7px] font-bold uppercase tracking-wider leading-none">M-Pesa</span>
                                            </div>
                                          )}
                                          <div className="text-[7px] text-center font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded leading-none max-w-[72px]">
                                            Fee ${w.fee.toFixed(2)} to withdraw ${w.amount.toFixed(2)}
                                          </div>
                                        </div>

                                        {/* Address Text and Copy Button */}
                                        <div className="flex-grow space-y-1 overflow-hidden">
                                          <span className="text-[8px] uppercase text-slate-400 font-mono tracking-wider">
                                            {taxMethod} Network Address
                                          </span>
                                          <p className="font-mono text-[9px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                                            {withdrawalSettings.addresses[taxMethod] || 'bc1qxy2kg3khsfyr7z2q67z40g0ecgh2t8gff2p9f8'}
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const addr = taxMethod === 'M-Pesa' ? '5417898' : (withdrawalSettings.addresses[taxMethod] || 'bc1qxy2kg3khsfyr7z2q67z40g0ecgh2t8gff2p9f8');
                                              navigator.clipboard.writeText(addr);
                                              alert(taxMethod === 'M-Pesa' ? 'Till Number copied!' : 'Address copied!');
                                            }}
                                            className="px-2 py-0.5 border border-slate-200 hover:border-slate-300 rounded text-[9px] font-bold text-slate-500 cursor-pointer transition-all flex items-center gap-1 inline-flex"
                                          >
                                            <Copy className="w-2.5 h-2.5" />
                                            {taxMethod === 'M-Pesa' ? 'Copy Till Number' : 'Copy Address'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Declare Reference Hash Form */}
                                    <div className="space-y-2 pt-2 border-t border-indigo-100/40 dark:border-indigo-900/40">
                                      <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">3. Processing Fee Confirmation</span>
                                      
                                      <div className="p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-light">
                                          Once you have completed the Processing & Compliance Fee payment, click the button below to switch to the active Payout Portal and automatically verify your transaction.
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveTab('payout_portal');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md shadow-pink-500/10 cursor-pointer transition-all text-center animate-pulse"
                                        >
                                          ✓ Verify payment in Payout Portal
                                        </button>
                                      </div>
                                    </div>

                                  </div>
                                )}

                                {/* 5. Live Processing Feed inside expanded panel */}
                                <div className="space-y-2">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Routing Event Logs</span>
                                  <div className="space-y-1.5 font-mono text-[9px] text-slate-500 leading-normal bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                                    <div className="flex justify-between">
                                      <span>● Request registered in gateway:</span>
                                      <span className="text-slate-400">SUCCESS</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>● Tax assessment completed:</span>
                                      <span className="text-indigo-500 font-bold">${w.fee.toFixed(2)} DUE</span>
                                    </div>
                                    {w.status !== 'awaiting_tax_payment' && (
                                      <div className="flex justify-between">
                                        <span>● Receipt reference declared ({(w as any).taxPaidMethod || 'USDT'}):</span>
                                        <span className="text-amber-500 font-semibold">VERIFYING</span>
                                      </div>
                                    )}
                                    {(w.status === 'tax_received' || w.status === 'processing' || w.status === 'paid') && (
                                      <div className="flex justify-between">
                                        <span>● Auditing desk verified ledger clearance:</span>
                                        <span className="text-emerald-500 font-bold">VERIFIED</span>
                                      </div>
                                    )}
                                    {(w.status === 'processing' || w.status === 'paid') && (
                                      <div className="flex justify-between">
                                        <span>● Transmitted to global clearing partners:</span>
                                        <span className="text-blue-500 font-semibold">PROCESSING</span>
                                      </div>
                                    )}
                                    {w.status === 'paid' && (
                                      <div className="flex justify-between">
                                        <span>● Settlement cleared & funds released:</span>
                                        <span className="text-emerald-500 font-extrabold">PAID OUT</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            )}

                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Referral Program */}
        {activeTab === 'referrals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left 2 columns: Refer and Transfer Balance */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Inviter invite system */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                  Multi-Level Affiliate Network
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Refer business owners and reviewers. Earn lifetime compound commissions across three network depths!
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!referEmail.trim()) return;
                    referUser(referEmail.trim());
                    setReferEmail('');
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Invite Friend Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="referral-email-input"
                        type="email"
                        required
                        placeholder="colleague.email@example.com"
                        value={referEmail}
                        onChange={(e) => setReferEmail(e.target.value)}
                        className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        Send Invitation
                      </button>
                    </div>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      This registers their account under your direct network branch (Level 1 tier).
                    </span>
                  </div>
                </form>

                {/* Referral Link displays */}
                <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Your Unique Affiliate Tracking Code</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                      {currentUser.fullName.toUpperCase().replace(/\s+/g, '')}-{currentUser.id.substring(0, 5)}
                    </span>
                    <span className="text-[10px] text-indigo-500 font-bold uppercase">Active Tracker</span>
                  </div>
                </div>
              </div>

              {/* Commission Balance & Transfer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  Separate Affiliate Commissions Ledger
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Referral balances accumulate here safely. You can immediately transfer this into your main withdrawable balance instantly.
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl gap-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Affiliate Vault Balance</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">${(currentUser.referralBalance || 0).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      if ((currentUser.referralBalance || 0) <= 0) {
                        alert("Your referral balance is zero!");
                        return;
                      }
                      transferReferralBalance();
                    }}
                    disabled={(currentUser.referralBalance || 0) <= 0}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (currentUser.referralBalance || 0) > 0
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Transfer to Main Wallet
                  </button>
                </div>

                {/* Multi level tier structure diagram */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Compound Commission Rates</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                      <span className="block text-[10px] font-semibold text-slate-400">Level 1 Direct</span>
                      <span className="text-lg font-black text-indigo-500 font-mono">10%</span>
                      <span className="block text-[9px] text-slate-400 mt-1">Directly invited friends</span>
                    </div>
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                      <span className="block text-[10px] font-semibold text-slate-400">Level 2 Indirect</span>
                      <span className="text-lg font-black text-violet-500 font-mono">5%</span>
                      <span className="block text-[9px] text-slate-400 mt-1">Invited by Level 1s</span>
                    </div>
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                      <span className="block text-[10px] font-semibold text-slate-400">Level 3 Depth</span>
                      <span className="text-lg font-black text-emerald-500 font-mono">2%</span>
                      <span className="block text-[9px] text-slate-400 mt-1">Invited by Level 2s</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right 1 column: Referral Network List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">
                Active Referrals Ledger
              </h3>
              
              {(!storeReferrals || storeReferrals.filter(r => r.referrerId === currentUser.id).length === 0) ? (
                <div className="p-6 text-center text-slate-400">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-[11px] font-medium">No registered affiliate members yet.</p>
                  <p className="text-[9px] text-slate-400/80 mt-1">Invite friends above to start tracking real-time commission chains.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storeReferrals.filter(r => r.referrerId === currentUser.id).map(r => (
                    <div 
                      key={r.id} 
                      className="p-3 rounded-xl border border-slate-50 dark:border-slate-950 bg-slate-50/50 dark:bg-slate-950/20 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{r.referredEmail}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Tier level: {r.level === 1 ? 'Direct L1 (10%)' : r.level === 2 ? 'L2 Depth (5%)' : 'L3 Depth (2%)'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-500 font-mono block">+${r.commissionEarned.toFixed(2)}</span>
                        <span className="text-[8px] text-slate-400 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: Daily Check-in & Badges achievements */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left 2 columns: Check-in and Milestones */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Advanced Level Milestone Guide */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Reviewer Professional Level Roadmap
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">L1</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-950 dark:text-white">Level 1: Entry Practitioner</span>
                      <p className="text-[10px] text-slate-400">Default level. Accrues standard review payouts under $12.00.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-indigo-100 dark:border-indigo-950/30 bg-indigo-50/10 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">L2</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-950 dark:text-white">Level 2: Verified Analyst</span>
                      <p className="text-[10px] text-slate-400">Requires 20 completed reviews. Unlocks premium payouts up to $18.00.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">L3</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-950 dark:text-white">Level 3: Expert Auditor</span>
                      <p className="text-[10px] text-slate-400">Requires 50 completed reviews. Unlocks high-tier payouts up to $20.00.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">L4</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-950 dark:text-white">Level 4: Master Contributor</span>
                      <p className="text-[10px] text-slate-400">Requires 100 completed reviews. Unlocks campaign payouts up to $25.00.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs">L5</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-950 dark:text-white">Level 5: Sovereign Elder Auditor</span>
                      <p className="text-[10px] text-slate-400">Requires 250 completed reviews. Unlocks maximum premium campaign listings above $25.00.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 column: Unlocked Badges */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">
                Unlocked Achievement Badges
              </h3>

              <div className="space-y-4">
                {[
                  {
                    id: 'first_review',
                    title: 'First Audit Done',
                    desc: 'Successfully submitted your first quality audit review.',
                    icon: '🚀',
                    unlocked: currentUser.completedReviewsCount >= 1
                  },
                  {
                    id: 'bronze_reviewer',
                    title: 'Bronze Tier Analyst',
                    desc: 'Completed at least 10 high-fidelity review jobs.',
                    icon: '🥉',
                    unlocked: currentUser.completedReviewsCount >= 10
                  },
                  {
                    id: 'silver_reviewer',
                    title: 'Silver Expert Auditor',
                    desc: 'Completed at least 50 quality review jobs.',
                    icon: '🥈',
                    unlocked: currentUser.completedReviewsCount >= 50
                  },
                  {
                    id: 'gold_reviewer',
                    title: 'Gold Sovereign Elder',
                    desc: 'Completed at least 100 maximum tier review jobs.',
                    icon: '🥇',
                    unlocked: currentUser.completedReviewsCount >= 100
                  },
                  {
                    id: 'daily_streak',
                    title: 'Proof-of-Presence Streak',
                    desc: 'Claimed a daily check-in reward.',
                    icon: '🔥',
                    unlocked: true // Check-in is always seedable or unlocked on claim
                  }
                ].map((b) => (
                  <div 
                    key={b.id} 
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      b.unlocked 
                        ? 'bg-gradient-to-r from-indigo-50/50 to-white dark:from-slate-950/40 dark:to-slate-900 border-indigo-500/20 text-slate-800 dark:text-slate-200' 
                        : 'bg-slate-50/40 dark:bg-slate-950/10 border-slate-100 dark:border-slate-850 opacity-40 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{b.unlocked ? b.icon : '🔒'}</span>
                    <div>
                      <span className="block text-xs font-bold">{b.title}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                      <span className="block text-[8px] font-mono mt-1 font-bold uppercase tracking-wider text-indigo-500">
                        {b.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* RATING ASSIGNMENT OVERLAY MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquareCode className="w-6 h-6 text-indigo-500" />
                  Perform Business Quality Audit
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Analyzing domain: <span className="font-bold text-indigo-500 font-mono">{selectedCampaign.businessName.toLowerCase().replace(/\s+/g, '')}.com</span>
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wide font-bold">Escrow payout</span>
                <span className="text-2xl font-black text-emerald-500 font-mono">${selectedCampaign.rewardPerReview.toFixed(2)}</span>
              </div>
            </div>

            {/* Campaign description / context info */}
            <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-slate-950/40 rounded-2xl border border-indigo-100/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block text-[10px]">
                Business Owner Directives & Scope:
              </span>
              <p className="italic leading-relaxed">
                "{selectedCampaign.description}"
              </p>
            </div>

            {/* Review Rules checklist */}
            <div className="mt-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Strict SLA Review Rules & Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${timeLeft <= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>
                    {timeLeft <= 0 ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <span>
                    Rule 1: Time on Page (60s min)
                    {timeLeft > 0 ? (
                      <span className="text-amber-500 font-mono font-bold ml-1">({timeLeft}s left)</span>
                    ) : (
                      <span className="text-emerald-500 font-bold ml-1">(Complete)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Rule 2: Star rating (1–5)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${reviewContent.trim().length >= 100 && reviewContent.trim().length <= 1000 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {reviewContent.trim().length >= 100 && reviewContent.trim().length <= 1000 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 block" />}
                  </div>
                  <span>Rule 3: Content length (100–1000 chars)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Rule 4: Zero copy-paste allowed</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Rule 5: Relevant to business niche</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Rule 6: Spam / Gibberish is rejected</span>
                </div>
              </div>

              {/* Demo Mode Cheat tool */}
              {timeLeft > 0 && (
                <button
                  type="button"
                  onClick={() => setTimeLeft(0)}
                  className="mt-2 py-1 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  ⚡ Demo Tool: Instant Fast Forward 60s
                </button>
              )}
            </div>

            {reviewSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-100 dark:border-emerald-900 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Quality Audit Recorded!</h4>
                <p className="text-xs text-slate-400">
                  Your verification audit was routed to David Chen's ledger for escrow settlement release.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 mt-5">
                {reviewError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Step 1: Assign Star Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        id={`star-btn-${star}`}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 rounded transition-all hover:scale-110 cursor-pointer"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Public Review */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Step 2: Write Public Customer Review (100 to 1000 characters)
                  </label>
                  <textarea
                    id="review-public-content"
                    required
                    rows={4}
                    placeholder="Provide a detailed, natural description of the target portal. Touch on design, performance, website accessibility, and practical utility..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>
                      Character Count: <strong className={reviewContent.trim().length >= 100 && reviewContent.trim().length <= 1000 ? 'text-emerald-500' : 'text-amber-500'}>{reviewContent.trim().length}</strong> / 100 - 1000 range.
                    </span>
                    {reviewContent.trim().length < 100 && (
                      <span className="text-amber-500 font-bold font-mono">Need {100 - reviewContent.trim().length} more characters</span>
                    )}
                  </div>
                </div>

                {/* Private owner feedback */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Step 3: Private Constructive Technical Advice to Owner (Min. 15 characters)
                  </label>
                  <textarea
                    id="review-private-feedback"
                    required
                    rows={2}
                    placeholder="Private technical tips for the developers, backend, UX defects, or billing layout..."
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Feedback character length: {privateFeedback.trim().length} (Min. 15 required).
                  </span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    id="btn-cancel-review"
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel Draft
                  </button>
                  <button
                    id="btn-submit-review"
                    type="submit"
                    disabled={timeLeft > 0 || reviewContent.trim().length < 100 || reviewContent.trim().length > 1000}
                    className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                      timeLeft > 0 || reviewContent.trim().length < 100 || reviewContent.trim().length > 1000
                        ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {timeLeft > 0 ? `Locked (Wait ${timeLeft}s)` : 'Submit Secured Audit'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
