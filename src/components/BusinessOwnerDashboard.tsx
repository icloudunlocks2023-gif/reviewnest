import React, { useState } from 'react';
import { useStore } from '../state/StoreContext';
import { Business, Campaign, DepositRequest } from '../types';
import { 
  Building2, Megaphone, Plus, Wallet, TrendingUp, BarChart3, 
  FileText, Check, X, ShieldCheck, CreditCard, Star, AlertCircle, 
  Sparkles, ShieldAlert, CheckCircle2, Coins, RefreshCw, Zap, 
  Shield, ArrowUpRight, Copy, Loader2, AlertTriangle, Calendar, 
  MessageSquare 
} from 'lucide-react';
import { motion } from 'motion/react';

export const BusinessOwnerDashboard: React.FC = () => {
  const {
    currentUser,
    businesses,
    campaigns,
    reviews,
    addBusiness,
    createCampaign,
    approveReview,
    setUsers,
    users,
    campaignPackages,
    depositRequests,
    createDepositRequest,
    processDepositRequest
  } = useStore();

  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Hotels & Resorts');
  const [bizWebsite, setBizWebsite] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  const [bizLogo, setBizLogo] = useState('');
  const [bizSuccess, setBizSuccess] = useState(false);
  const [bizError, setBizError] = useState('');

  // Campaign states
  const [selectedBizId, setSelectedBizId] = useState('');
  const [reviewsNeeded, setReviewsNeeded] = useState(5);
  const [rewardAmount, setRewardAmount] = useState(10);
  const [campaignDesc, setCampaignDesc] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('custom');
  const [campaignDuration, setCampaignDuration] = useState(30);
  const [campSuccess, setCampSuccess] = useState(false);
  const [campError, setCampError] = useState('');

  // Demo Deposit states
  const [depositAmount, setDepositAmount] = useState('250.00');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Advanced Deposit Portal States
  const [activeDepTab, setActiveDepTab] = useState<'crypto' | 'invoice'>('crypto');
  const [selectedCoin, setSelectedCoin] = useState('USDT (TRC20)');
  const [selectedInvoiceMethod, setSelectedInvoiceMethod] = useState('Bank Transfer');
  const [cryptoAmount, setCryptoAmount] = useState('300.00');
  const [invoiceAmount, setInvoiceAmount] = useState('300.00');
  const [invoiceMemo, setInvoiceMemo] = useState('');
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  // Blockchain Modal verification simulation
  const [isVerifyingCrypto, setIsVerifyingCrypto] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [cryptoVerificationSuccess, setCryptoVerificationSuccess] = useState(false);

  const walletAddresses: Record<string, string> = {
    'USDT (TRC20)': 'TX5b79AC76d7fb1b0a88befb751b74f6d8976f',
    'USDT (ERC20)': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    'USDC (Polygon)': '0x8920e5E14C5417B809C34085f14B7413d395Ef82',
    'BTC (Native)': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ETH (ERC20)': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  };

  if (!currentUser) return null;

  // Filter businesses owned by the current business owner
  const myBusinesses = businesses.filter(b => b.ownerId === currentUser.id);
  const approvedBusinesses = myBusinesses.filter(b => b.status === 'approved');

  // Filter campaigns belonging to any of their businesses
  const myCampaigns = campaigns.filter(c => 
    myBusinesses.some(b => b.id === c.businessId)
  );

  // Filter reviews submitted to any of their campaigns
  const incomingReviews = reviews.filter(r => 
    myBusinesses.some(b => b.id === r.businessId)
  );

  // Metrics calculations
  const totalCampaignsSpent = myCampaigns.reduce((acc, c) => acc + (c.reviewsCompleted * c.rewardPerReview), 0);
  const approvedReviews = incomingReviews.filter(r => r.status === 'approved');
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : 'N/A';

  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    if (pkgId === 'custom') {
      return;
    }
    const pkg = campaignPackages.find(p => p.id === pkgId);
    if (pkg) {
      setReviewsNeeded(pkg.reviewsCount);
      setRewardAmount(pkg.costPerReview);
    }
  };

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setBizError('');
    setBizSuccess(false);

    if (!bizName || !bizWebsite || !bizDesc) {
      setBizError('Please provide a name, website URL, and descriptive overview.');
      return;
    }

    addBusiness(bizName, bizCategory, bizWebsite, bizDesc, bizLogo);
    setBizSuccess(true);
    setBizName('');
    setBizWebsite('');
    setBizDesc('');
    setBizLogo('');
    setTimeout(() => setBizSuccess(false), 3000);
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setCampError('');
    setCampSuccess(false);

    if (!selectedBizId) {
      setCampError('Please select one of your approved businesses.');
      return;
    }

    const needed = parseInt(reviewsNeeded.toString());
    const reward = parseFloat(rewardAmount.toString());
    const duration = parseInt(campaignDuration.toString());

    if (isNaN(needed) || needed <= 0) {
      setCampError('Please enter a valid count of reviews.');
      return;
    }

    if (isNaN(reward) || reward <= 0) {
      setCampError('Please enter a valid reward payout amount.');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      setCampError('Please enter a valid campaign duration.');
      return;
    }

    const cost = needed * reward;
    if (currentUser.balance < cost) {
      setCampError(`Insufficient campaign budget. You need $${cost.toFixed(2)} but only have $${currentUser.balance.toFixed(2)}. Top up below!`);
      return;
    }

    const ok = createCampaign(selectedBizId, needed, reward, campaignDesc, duration);
    if (ok) {
      setCampSuccess(true);
      setCampaignDesc('');
      setSelectedBizId('');
      setSelectedPackageId('custom');
      setTimeout(() => setCampSuccess(false), 3000);
    } else {
      setCampError('Failed to allocate campaign budget.');
    }
  };

  const handleDemoDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Direct state increase
    const updatedUser = { ...currentUser, balance: currentUser.balance + amount };
    // update context store using direct set state since we might need quick binding
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));
    // Hack to trigger immediate state refresh
    currentUser.balance = updatedUser.balance;

    setDepositSuccess(true);
    setTimeout(() => setDepositSuccess(false), 2000);
  };

  const handleVerifyCryptoDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cryptoAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsVerifyingCrypto(true);
    setVerificationStep(1);
    setCryptoVerificationSuccess(false);
    setVerificationLogs(["Initializing connection with ReviewNest payment gateway oracle..."]);

    setTimeout(() => {
      setVerificationStep(2);
      setVerificationLogs(prev => [...prev, "Connected! Scanning blockchain mempools for payment..."]);
      setTimeout(() => {
        setVerificationStep(3);
        setVerificationLogs(prev => [...prev, "Payment transaction detected: hash tx_0xbc3e...7a11! Verifying block confirmations..."]);
        setTimeout(() => {
          setVerificationStep(4);
          setVerificationLogs(prev => [...prev, "Oracle validated payment. Resolving wallet ledger balances..."]);
          setTimeout(() => {
            setVerificationStep(5);
            setVerificationLogs(prev => [...prev, `Success! Credited +$${amt.toFixed(2)} to your ad campaign escrow.`]);
            setCryptoVerificationSuccess(true);
            
            // Perform actual deposit in system
            const req = createDepositRequest(amt, `Crypto (${selectedCoin})`);
            processDepositRequest(req.id, 'Approved', 'Automatic blockchain Oracle clearance', 'TxHash: tx_0xbc3e...7a11');
            
            // Direct credit balance
            const updatedUser = { ...currentUser, balance: currentUser.balance + amt };
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            localStorage.setItem('rh_currentUser', JSON.stringify(updatedUser));
            currentUser.balance = updatedUser.balance;
            
          }, 1000);
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleRequestInvoiceDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invoiceAmount);
    if (isNaN(amt) || amt <= 0) return;

    // Submit invoice deposit request
    createDepositRequest(amt, `${selectedInvoiceMethod} (Reference: ${invoiceMemo || 'Standard invoice'})`);
    
    setInvoiceSuccess(true);
    setInvoiceMemo('');
    setTimeout(() => setInvoiceSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Greetings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Business Owner Console
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit your business containers, fund review campaigns, and read valuable customer critiques.
          </p>
        </div>

        {/* Demo balance quick add */}
        <div className="p-1 bg-indigo-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-center gap-3">
          <div className="px-3">
            <span className="block text-[9px] text-slate-400 uppercase font-mono font-bold">Campaign Deposit</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">${currentUser.balance.toFixed(2)}</span>
          </div>
          <form onSubmit={handleDemoDeposit} className="flex gap-1.5 pr-1">
            <input
              id="deposit-amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-16 px-1.5 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
            />
            <button
              id="btn-add-deposit"
              type="submit"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Demo Escrow
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Escrow Disbursed
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalCampaignsSpent.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-indigo-500 font-mono font-bold">
            Released to active reviewers
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Submitted Businesses
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {myBusinesses.length}
          </span>
          <div className="mt-2 text-[10px] text-emerald-500 font-mono font-bold">
            {approvedBusinesses.length} active on marketplace
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Megaphone className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Active Campaigns
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {myCampaigns.filter(c => c.status === 'active').length}
          </span>
          <div className="mt-2 text-[10px] text-blue-500 font-mono font-bold">
            {myCampaigns.filter(c => c.status === 'completed').length} completed
          </div>
        </div>

        <div className="p-5 bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 rounded-2xl border border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Average Satisfaction Rating
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {averageRating}
          </span>
          <div className="mt-2 text-[10px] text-amber-600 font-mono font-bold">
            {approvedReviews.length} total verified ratings
          </div>
        </div>
      </div>

      {/* Campaign Funding & Wallet Portal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-500 animate-pulse" />
              Ad Campaign Funding & Wallet Portal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top up your business deposit balance to activate review packages. To secure high-quality customer critiques, a minimum balance of $300.00 is recommended.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            <Wallet className="w-4 h-4 text-indigo-500" />
            Escrow Balance: ${currentUser.balance.toFixed(2)}
          </div>
        </div>

        {currentUser.balance < 300 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-bold block text-sm">Escrow Wallet Clearance Top-Up Required</span>
              Your current deposit balance of <strong className="font-mono text-slate-950 dark:text-white">${currentUser.balance.toFixed(2)}</strong> is below the recommended $300.00 threshold to fund active marketplace campaigns. Top up instantly below.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Actions */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tab Selection */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveDepTab('crypto')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDepTab === 'crypto'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Cryptocurrency Deposit
              </button>
              <button
                type="button"
                onClick={() => setActiveDepTab('invoice')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDepTab === 'invoice'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Bank Transfer & PayPal Invoice
              </button>
            </div>

            {/* TAB CONTENT: CRYPTO */}
            {activeDepTab === 'crypto' && (
              <form onSubmit={handleVerifyCryptoDeposit} className="space-y-4 animate-fade-in text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Step 1: Select Crypto Token</span>
                    <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Automatic Settlement Verification Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.keys(walletAddresses).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setSelectedCoin(coin)}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCoin === coin
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {coin.split(' ')[0]}
                        <span className="block text-[8px] opacity-75 font-normal">{coin.includes('(') ? coin.split(' ')[1] : ''}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 items-center">
                    <div className="sm:col-span-2 space-y-2">
                      <span className="block text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Step 2: Send payment to address</span>
                      <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="font-mono text-[10px] truncate flex-1 text-slate-800 dark:text-slate-200">
                          {walletAddresses[selectedCoin]}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(walletAddresses[selectedCoin]);
                            setCopiedAddress(true);
                            setTimeout(() => setCopiedAddress(false), 2000);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                        >
                          {copiedAddress ? (
                            <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      </div>
                      <span className="block text-[10px] text-slate-400 leading-relaxed">
                        Important: Transfer exact amount. Network fees are fully absorbed. Payments settle after 1 blockchain confirmations.
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <div className="p-2.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center p-2">
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-60">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`rounded-sm ${(i % 3 === 0 || i % 5 === 0) ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-400">Scan QR Code</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Top-Up Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold font-mono text-slate-400">$</span>
                      <input
                        type="number"
                        id="crypto-topup-amount"
                        min="50"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-current" />
                    Verify Crypto Deposit
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: INVOICE */}
            {activeDepTab === 'invoice' && (
              <form onSubmit={handleRequestInvoiceDeposit} className="space-y-4 animate-fade-in text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Step 1: Choose Invoicing Method</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['Bank Transfer', 'PayPal Invoice', 'M-Pesa Till'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedInvoiceMethod(method)}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedInvoiceMethod === method
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {selectedInvoiceMethod === 'Bank Transfer' && (
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-sans text-xs text-slate-500 leading-relaxed space-y-2">
                      <p className="font-bold text-slate-850 dark:text-slate-300">Bank Wire Request Protocol:</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        To fund via Bank Transfer, please submit your desired deposit amount and sender bank wire details below.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Our administrative department will review your details and send you custom, secure bank clearing details (IBAN/SWIFT) directly via <strong>notifications or email</strong>.
                      </p>
                    </div>
                  )}

                  {selectedInvoiceMethod === 'PayPal Invoice' && (
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-sans text-xs text-slate-500 leading-relaxed space-y-2">
                      <p className="font-bold text-slate-850 dark:text-slate-300">PayPal Deposit Request Protocol:</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        To fund via PayPal, please submit your desired deposit amount along with your registered PayPal email address below.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Our billing department will issue and deliver a secure PayPal Invoice or payment link directly to your <strong>email or notification center</strong>.
                      </p>
                    </div>
                  )}

                  {selectedInvoiceMethod === 'M-Pesa Till' && (
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-500 leading-relaxed space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-300">Buy Goods and Services Till Payment:</p>
                      <p>Lipa na M-PESA Till Number: <strong className="text-emerald-600 dark:text-emerald-400">541789</strong></p>
                      <p>Business Name: <strong className="text-slate-950 dark:text-white">ReviewNest Escrow Services</strong></p>
                    </div>
                  )}
                </div>

                {invoiceSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold font-mono flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-4 h-4" />
                    {selectedInvoiceMethod === 'M-Pesa Till' ? (
                      <span>✓ Deposit request submitted! Admin will audit the M-Pesa reference within 1 hour.</span>
                    ) : (
                      <span>✓ Request submitted! An administrator will review your details and send payment details via notifications or email shortly.</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Top-Up Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold font-mono text-slate-400">$</span>
                      <input
                        type="number"
                        id="invoice-topup-amount"
                        min="50"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        {selectedInvoiceMethod === 'Bank Transfer' 
                          ? 'Your Bank Name, Account Name & Sender Details'
                          : selectedInvoiceMethod === 'PayPal Invoice'
                          ? 'Your PayPal Email / Billing Address'
                          : 'Memo / Transaction Hash / Ref ID'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={selectedInvoiceMethod === 'Bank Transfer'
                          ? 'e.g., Chase Bank, John Doe, wire details request'
                          : selectedInvoiceMethod === 'PayPal Invoice'
                          ? 'e.g., payer@example.com, John Doe'
                          : 'Enter Bank wire ID, PayPal transaction code, or M-Pesa Code'}
                        value={invoiceMemo}
                        onChange={(e) => setInvoiceMemo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      Request Approval
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Audit Ledger / Deposit Progress History */}
          <div className="lg:col-span-4 border-l border-slate-100 dark:border-slate-850 lg:pl-6 space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Durable Audit Ledger
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Real-time tracking of pending and settled advertising balances.
              </p>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {depositRequests.filter(req => req.userId === currentUser.id).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-6">No deposit history logs in session state.</p>
              ) : (
                depositRequests
                  .filter(req => req.userId === currentUser.id)
                  .map((req) => (
                    <div key={req.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-[10px] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-slate-400">{req.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase capitalize ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{req.paymentMethod.length > 20 ? req.paymentMethod.slice(0, 20) + '...' : req.paymentMethod}</span>
                        <span className="font-mono">${req.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-[8px] text-slate-400 flex justify-between items-center">
                        <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                        {req.adminNotes && <span className="text-[8px] text-indigo-500 italic truncate max-w-[100px]">{req.adminNotes}</span>}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Quick Tips */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-300 block mb-0.5">💡 Campaign Funding Rule:</span>
              Once your escrow escrow is cleared, go to the "Purchase Campaign" form in the right panel to secure review slots. Approving reviewers releases rewards directly to their wallets.
            </div>
          </div>

        </div>
      </div>

      {/* Cryptographic Payment verification Handshake animation modal */}
      {isVerifyingCrypto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 text-xs relative overflow-hidden">
            
            {/* Cyberpunk ambient lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500" />

            <div className="py-2">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-4 relative">
                {cryptoVerificationSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin absolute" />
                    <Coins className="w-4 h-4 text-slate-400 animate-pulse" />
                  </>
                )}
              </div>
              <h3 className="text-base font-bold font-display text-white">
                ReviewNest Payment Consensus Engine
              </h3>
              <p className="text-slate-400 text-[10px] mt-1">
                Verifying smart contract cryptographic ledger handshakes on the blockchain.
              </p>
            </div>

            {/* Live Terminal Log */}
            <div className="p-4 bg-slate-950 text-slate-400 font-mono text-[9px] rounded-xl text-left space-y-2 h-44 overflow-y-auto border border-slate-850">
              {verificationLogs.map((log, index) => (
                <div key={index} className="flex gap-1.5 items-start">
                  <span className="text-indigo-500 select-none">&gt;</span>
                  <p className={index === verificationLogs.length - 1 ? 'text-indigo-400 font-bold' : ''}>
                    {log}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress indicators */}
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-800 pt-3">
              <span>Status: <strong className={cryptoVerificationSuccess ? "text-emerald-500" : "text-amber-500"}>{cryptoVerificationSuccess ? "SETTLED" : "VERIFYING..."}</strong></span>
              <span>Sequence: {verificationStep}/5</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!cryptoVerificationSuccess}
                onClick={() => {
                  setIsVerifyingCrypto(false);
                  setVerificationStep(0);
                  setVerificationLogs([]);
                }}
                className={`w-full py-2.5 rounded-xl font-bold font-display transition-all ${
                  cryptoVerificationSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md shadow-emerald-900/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {cryptoVerificationSuccess ? "Proceed to Console Workspace" : "Listening for Network Broadcasts..."}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Submit Business & Setup Campaigns */}
        <div className="space-y-8">
          
          {/* Submit New Business */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Register New Business
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Register your website and operations. New submissions require quick platform-wide admin clearance.
            </p>

            {bizSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Business registered! Awaiting admin activation.</span>
              </div>
            )}

            {bizError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{bizError}</span>
              </div>
            )}

            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <input
                  id="biz-name"
                  type="text"
                  required
                  placeholder="Sip & Byte Cafe"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Sector Category
                  </label>
                  <select
                    id="biz-category"
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="Hotels & Resorts">Hotels & Resorts</option>
                    <option value="Forex Brokers">Forex Brokers</option>
                    <option value="Prop Firms">Prop Firms</option>
                    <option value="AI Tools">AI Tools</option>
                    <option value="VPN Services">VPN Services</option>
                    <option value="Hosting Providers">Hosting Providers</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="E-commerce Platforms">E-commerce Platforms</option>
                    <option value="Education Platforms">Education Platforms</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Travel Companies">Travel Companies</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Website URL
                  </label>
                  <input
                    id="biz-website"
                    type="url"
                    required
                    placeholder="https://sipandbyte.cafe"
                    value={bizWebsite}
                    onChange={(e) => setBizWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Business Description / Overview
                </label>
                <textarea
                  id="biz-description"
                  required
                  rows={3}
                  placeholder="Artisanal coffee and gigabit internet, premium coder-friendly coworking setups..."
                  value={bizDesc}
                  onChange={(e) => setBizDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Logo / Cover Image URL (Optional)
                </label>
                <input
                  id="biz-logo"
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={bizLogo}
                  onChange={(e) => setBizLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                />
              </div>

              <button
                id="btn-biz-submit"
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit and Audit
              </button>
            </form>
          </div>

          {/* Setup / Purchase Review Campaign */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              Purchase Campaign
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Allocate your deposit balance to secure high-quality reviews for any of your approved businesses.
            </p>

            {campSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Campaign activated successfully! Escrow locked.</span>
              </div>
            )}

            {campError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{campError}</span>
              </div>
            )}

            {approvedBusinesses.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active, approved businesses found.</p>
                <p className="text-[10px] text-slate-400 mt-1">Wait for Admin to clear your registered businesses or use the Admin panel to approve them instantly!</p>
              </div>
            ) : (
              <form onSubmit={handleLaunchCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Select Business
                  </label>
                  <select
                    id="campaign-biz-select"
                    required
                    value={selectedBizId}
                    onChange={(e) => setSelectedBizId(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="">-- Choose Approved Business --</option>
                    {approvedBusinesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Campaign Tier / Package
                  </label>
                  <select
                    id="campaign-package-select"
                    value={selectedPackageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="custom">Custom Campaign (Enter Manual Specs)</option>
                    {campaignPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} Package ({pkg.reviewsCount} Reviews @ ${pkg.costPerReview.toFixed(2)}/rev)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Reviews Wanted
                    </label>
                    <input
                      id="campaign-needed"
                      type="number"
                      required
                      min={1}
                      disabled={selectedPackageId !== 'custom'}
                      value={reviewsNeeded}
                      onChange={(e) => setReviewsNeeded(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-bold disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Reward / Review ($)
                    </label>
                    <input
                      id="campaign-reward"
                      type="number"
                      required
                      min={1}
                      disabled={selectedPackageId !== 'custom'}
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-bold disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Campaign Duration
                  </label>
                  <select
                    id="campaign-duration-select"
                    value={campaignDuration}
                    onChange={(e) => setCampaignDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value={7}>7 Days Quick-Boost</option>
                    <option value={15}>15 Days Standard-Boost</option>
                    <option value={30}>30 Days Monthly Growth</option>
                    <option value={60}>60 Days Extensive Audit</option>
                    <option value={90}>90 Days Enterprise Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Campaign Scope / Instructions
                  </label>
                  <textarea
                    id="campaign-desc"
                    required
                    rows={2}
                    placeholder="Focus on analyzing our customer service response and overall checkout layout..."
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Campaign Allocation Cost:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">${(reviewsNeeded * rewardAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Your Escrow Deposit:</span>
                    <span className={`font-bold font-mono ${currentUser.balance >= (reviewsNeeded * rewardAmount) ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${currentUser.balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-campaign-submit"
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Instantly Fund Campaign
                </button>
              </form>
            )}
          </div>

        </div>

        {/* RIGHT COLUMNS: Analytics and Incoming Review Jobs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Rating & Feedback Analytics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Business Analytics
              </h3>
              <span className="text-[11px] font-bold text-slate-400 font-mono">LIVE FEED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 text-center">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reviews Received</span>
                <span className="block text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">{approvedReviews.length}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 text-center">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rating</span>
                <span className="block text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono flex items-center justify-center gap-1">
                  {averageRating}
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 text-center">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campaign Progress</span>
                <span className="block text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {myCampaigns.reduce((acc, c) => acc + c.reviewsCompleted, 0)} / {myCampaigns.reduce((acc, c) => acc + c.reviewsNeeded, 0)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = approvedReviews.filter(r => Math.round(r.rating) === star).length;
                  const pct = approvedReviews.length > 0 ? Math.round((count / approvedReviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-bold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 justify-end">
                        {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right font-bold text-slate-900 dark:text-white font-mono">{pct}%</span>
                      <span className="w-8 text-right text-slate-400 dark:text-slate-500 font-mono font-medium">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Campaigns Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">
              My Active & Completed Campaigns
            </h3>

            {myCampaigns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No campaigns launched yet. Fund your first campaign on the left panel!</p>
            ) : (
              <div className="space-y-4">
                {myCampaigns.map((camp) => {
                  const percent = Math.min(100, Math.round((camp.reviewsCompleted / camp.reviewsNeeded) * 100));
                  return (
                    <div key={camp.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{camp.businessName}</h4>
                          <span className="text-[10px] text-slate-400">Launched {new Date(camp.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          camp.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {camp.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        "{camp.description}"
                      </p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Target: {camp.reviewsCompleted} / {camp.reviewsNeeded} verified reviews</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <span>Reward per Review: <strong className="font-mono text-indigo-500">${camp.rewardPerReview.toFixed(2)}</strong></span>
                        <span>Total Budget Locked: <strong className="font-mono text-slate-900 dark:text-white">${camp.totalBudget.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming Customer Reviews Approval Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Escrow Review Approvals
                </h3>
                <p className="text-xs text-slate-500">
                  Audit incoming submissions. Approving releases escrowed funds to the reviewer. Rejecting returns funds back to your deposit balance.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold font-mono">
                {incomingReviews.filter(r => r.status === 'pending').length} pending
              </span>
            </div>

            {incomingReviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No user reviews submitted yet for any of your businesses.</p>
            ) : (
              <div className="space-y-5">
                {incomingReviews.map((rev) => (
                  <div
                    key={rev.id}
                    id={`review-approval-card-${rev.id}`}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 space-y-3"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          Target: {rev.businessName} (by {rev.reviewerName})
                        </span>
                        <span className="block text-[10px] text-slate-400">Submitted on {new Date(rev.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                      <div className="text-xs">
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Public Review Text:</span>
                        <p className="text-slate-700 dark:text-slate-300 italic">"{rev.content}"</p>
                      </div>
                      <div className="text-xs pt-1.5 border-t border-slate-50 dark:border-slate-800">
                        <span className="block text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider">Private Custom Feedback to Owner:</span>
                        <p className="text-indigo-600 dark:text-indigo-400 italic">"{rev.feedback}"</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">
                        Escrow Payout: <strong className="font-mono text-slate-900 dark:text-white">${rev.rewardAmount.toFixed(2)}</strong>
                      </span>
                      
                      {rev.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            id={`btn-reject-review-${rev.id}`}
                            onClick={() => approveReview(rev.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                          <button
                            id={`btn-approve-review-${rev.id}`}
                            onClick={() => approveReview(rev.id, 'approved')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve & Pay
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold capitalize ${
                          rev.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40 text-rose-600 dark:text-rose-400'
                        }`}>
                          {rev.status === 'approved' ? 'Success Released' : 'Audited and Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List of Registered Businesses Status Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">
              My Registered Businesses Listing Status
            </h3>

            {myBusinesses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No businesses registered yet.</p>
            ) : (
              <div className="space-y-3">
                {myBusinesses.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl border border-slate-50 dark:border-slate-950 bg-slate-50/50 dark:bg-slate-950/10 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{b.name}</h4>
                      <p className="text-[10px] text-slate-400">{b.category} • {b.website}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border capitalize ${
                      b.status === 'approved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-850 dark:text-emerald-400'
                        : b.status === 'rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-850 dark:text-rose-400'
                        : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-850 dark:text-amber-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
