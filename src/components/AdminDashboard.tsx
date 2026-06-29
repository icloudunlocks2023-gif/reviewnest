import React, { useState, useEffect } from 'react';
import { useStore } from '../state/StoreContext';
import { User, Business, WithdrawalRequest, AccountLevel } from '../types';
import { 
  Users, 
  Building2, 
  Megaphone, 
  Check, 
  X, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Key, 
  UserCheck, 
  Award, 
  Settings, 
  AlertTriangle, 
  Play, 
  Pause, 
  Plus,
  Trash2,
  Lock,
  Unlock,
  Coins,
  ShieldX,
  Eye,
  Star
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    businesses,
    campaigns,
    reviews,
    withdrawals,
    logs,
    approveBusiness,
    approveWithdrawal,
    setUsers,
    campaignPackages,
    updateCampaignPackage,
    suspendUser,
    restrictUser,
    editUserBalance,
    changeUserLevel,
    updateCampaignStatus,
    flagReview,
    createCampaign,
    approveReview,
    withdrawalSettings,
    updateWithdrawalSettings,
    depositRequests,
    processDepositRequest
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'campaigns' | 'reviews' | 'packages' | 'tax_finance' | 'restrictions'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [restrictionSearch, setRestrictionSearch] = useState('');
  const [selectedUserForRestriction, setSelectedUserForRestriction] = useState<User | null>(null);
  const [restrictionNotes, setRestrictionNotes] = useState('');

  // Tax and finance state
  const [taxFlatFee, setTaxFlatFee] = useState<string>('1.30');
  const [taxPercent, setTaxPercent] = useState<string>('2');
  const [taxAddresses, setTaxAddresses] = useState<Record<string, string>>({});
  const [financeSuccess, setFinanceSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (withdrawalSettings) {
      setTaxFlatFee(withdrawalSettings.taxFlatFee.toString());
      setTaxPercent(withdrawalSettings.taxPercent.toString());
      setTaxAddresses(withdrawalSettings.addresses || {});
    }
  }, [withdrawalSettings]);

  // Manual Job Creation states
  const [adminSelectedBizId, setAdminSelectedBizId] = useState('');
  const [adminReviewsNeeded, setAdminReviewsNeeded] = useState(10);
  const [adminRewardAmount, setAdminRewardAmount] = useState(12);
  const [adminDuration, setAdminDuration] = useState(30);
  const [adminCampaignDesc, setAdminCampaignDesc] = useState('');
  const [adminCampSuccess, setAdminCampSuccess] = useState(false);
  const [adminCampError, setAdminCampError] = useState('');

  // Platform Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.completedReviewsCount > 0 || u.verified).length;
  const totalReviews = reviews.length;
  const totalEarningsPaid = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((acc, w) => acc + w.amount, 0);

  // Total Revenue: 15% platform commission on all campaigns funded
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.totalBudget * 0.15), 0);
  const totalEscrowPlatform = campaigns.reduce((acc, c) => acc + c.totalBudget, 0);

  // Pending actions lists
  const pendingBusinesses = businesses.filter(b => b.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status !== 'paid' && w.status !== 'rejected');

  // Filtered users for user management table
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.country.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtered reviews
  const filteredReviews = reviews.filter(r => 
    r.businessName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.reviewerName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.feedback.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  const handleEditBalance = (userId: string, currentBalance: number) => {
    const val = prompt(`Enter new balance for user ($):`, currentBalance.toFixed(2));
    if (val !== null) {
      const amt = parseFloat(val);
      if (!isNaN(amt) && amt >= 0) {
        editUserBalance(userId, amt);
      } else {
        alert("Please enter a valid positive number.");
      }
    }
  };

  const handleRotateLevel = (user: User) => {
    const levels: AccountLevel[] = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
    const currIdx = levels.indexOf(user.accountLevel);
    const nextIdx = (currIdx + 1) % levels.length;
    changeUserLevel(user.id, levels[nextIdx]);
  };

  const handleAdminCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCampError('');
    setAdminCampSuccess(false);

    if (!adminSelectedBizId) {
      setAdminCampError('Please select a business first.');
      return;
    }

    const needed = parseInt(adminReviewsNeeded.toString());
    const reward = parseFloat(adminRewardAmount.toString());
    const duration = parseInt(adminDuration.toString());

    if (isNaN(needed) || needed <= 0) {
      setAdminCampError('Please enter valid reviews needed.');
      return;
    }

    if (isNaN(reward) || reward <= 0) {
      setAdminCampError('Please enter a valid reward amount.');
      return;
    }

    const ok = createCampaign(adminSelectedBizId, needed, reward, adminCampaignDesc, duration);
    if (ok) {
      setAdminCampSuccess(true);
      setAdminCampaignDesc('');
      setAdminSelectedBizId('');
      setTimeout(() => setAdminCampSuccess(false), 3000);
    } else {
      setAdminCampError('Failed to create campaign manually.');
    }
  };

  const handleEditPackage = (pkgId: string, currentCount: number, currentCost: number) => {
    const countVal = prompt(`Enter reviews count for this package:`, currentCount.toString());
    const costVal = prompt(`Enter cost per review ($) for this package:`, currentCost.toString());
    if (countVal !== null && costVal !== null) {
      const count = parseInt(countVal);
      const cost = parseFloat(costVal);
      if (!isNaN(count) && count > 0 && !isNaN(cost) && cost > 0) {
        updateCampaignPackage(pkgId, count, cost);
      } else {
        alert("Please enter valid positive values.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-500 animate-pulse" />
            Platform Control Room
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global network overview, user state administration, campaign status controls, and financial operations.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-100 dark:border-rose-900 font-mono">
          SECURE CONNECTION: MASTER_ADMIN_v2.0
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Users */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Users
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalUsers}
          </span>
          <div className="mt-2 text-[10px] text-indigo-500 font-mono font-bold">
            {activeUsers} active accounts
          </div>
        </div>

        {/* Total Reviews */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Reviews
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {totalReviews}
          </span>
          <div className="mt-2 text-[10px] text-emerald-500 font-mono font-bold">
            {reviews.filter(r => r.status === 'pending').length} pending approval
          </div>
        </div>

        {/* Total Earnings Paid */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Earnings Paid
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalEarningsPaid.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-blue-500 font-mono font-bold">
            {pendingWithdrawals.length} withdrawals pending
          </div>
        </div>

        {/* Total Escrow */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Coins className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Campaign Escrow
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalEscrowPlatform.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-purple-500 font-mono font-bold">
            Total allocated budgets
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 rounded-2xl border border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Total Revenue
          </span>
          <span className="block text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalRevenue.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-amber-500 font-mono font-bold">
            15% service fee included
          </div>
        </div>
      </div>

      {/* Admin Tab Controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          📊 Dashboard Overview
        </button>
        <button
          id="tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          👥 User Registry ({users.length})
        </button>
        <button
          id="tab-campaigns"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          🏢 Campaign Creator & Jobs
        </button>
        <button
          id="tab-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          ✍️ Reviews Auditing ({reviews.length})
        </button>
        <button
          id="tab-packages"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          📦 Packages Settings
        </button>
        <button
          id="tab-tax-finance"
          onClick={() => setActiveTab('tax_finance')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'tax_finance'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          💰 Tax & Finance Settings
        </button>
        <button
          id="tab-restrictions"
          onClick={() => setActiveTab('restrictions')}
          className={`px-4 py-2 text-xs font-bold transition-all rounded-t-xl cursor-pointer ${
            activeTab === 'restrictions'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          🚫 Job Restrictions
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Business Approval Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Company Submission Audit Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Newly registered businesses awaiting clearance to fund campaigns.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold font-mono">
                  {pendingBusinesses.length} pending
                </span>
              </div>

              {pendingBusinesses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  All business registries are clear and active.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBusinesses.map((biz) => (
                    <div key={biz.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{biz.name}</h4>
                          <span className="text-[10px] text-indigo-500 font-medium hover:underline block">{biz.website}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-500 rounded text-[9px] font-bold uppercase">Awaiting Action</span>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 italic font-mono leading-relaxed">
                        "{biz.description}"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-400">Sector: <strong>{biz.category}</strong></span>
                        <div className="flex gap-2">
                          <button
                            id={`btn-reject-biz-${biz.id}`}
                            onClick={() => approveBusiness(biz.id, 'rejected')}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                          <button
                            id={`btn-approve-biz-${biz.id}`}
                            onClick={() => approveBusiness(biz.id, 'approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve & Activate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawal Request Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Fulfillment Payout Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reviewers requesting direct payout clearance on verified earnings.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold font-mono">
                  {pendingWithdrawals.length} pending
                </span>
              </div>

              {pendingWithdrawals.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  All withdrawal logs are audited and paid out.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.userName}</h4>
                          <span className="text-[10px] text-slate-400">{req.userEmail}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400 font-medium">Requested payout:</span>
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">${req.amount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl space-y-1">
                        <p className="text-[10px] text-slate-400">Payment Account / Coordinates:</p>
                        <p className="font-mono text-slate-800 dark:text-slate-200 font-bold select-all">{req.details}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
                        <div className="space-y-1">
                          <span className="block text-[10px] text-slate-400">Gateway: <strong className="uppercase">{req.paymentMethod.replace('_', ' ')}</strong></span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            req.status === 'processing'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : req.status === 'approved'
                              ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}>
                            Status: {req.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <button
                            id={`btn-reject-withdraw-${req.id}`}
                            onClick={() => approveWithdrawal(req.id, 'rejected')}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            Decline
                          </button>

                          {req.status === 'pending' && (
                            <button
                              id={`btn-processing-withdraw-${req.id}`}
                              onClick={() => approveWithdrawal(req.id, 'processing')}
                              className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Activity className="w-3 h-3" />
                              Set Processing
                            </button>
                          )}

                          {(req.status === 'pending' || req.status === 'processing') && (
                            <button
                              id={`btn-approve-withdraw-${req.id}`}
                              onClick={() => approveWithdrawal(req.id, 'approved')}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                          )}

                          {req.status === 'approved' && (
                            <button
                              id={`btn-paid-withdraw-${req.id}`}
                              onClick={() => approveWithdrawal(req.id, 'paid')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Paid & Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Operations Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Security Ledger & Audit logs (Zero-Trust)
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/30">
              {logs.map((log) => (
                <div key={log.id} className="flex justify-between items-start gap-4 text-[10px] font-mono p-2 border-b border-slate-100/40 dark:border-slate-900 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-slate-700 dark:text-slate-300 ml-2 font-bold">{log.action}</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    <span>UID: {log.userId.substring(0, 8)}</span>
                    <span className="block text-[8px]">IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Registry Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Platform Registered Users Registry
              </h3>
              <p className="text-xs text-slate-500">
                Audit secure email verifications, assign level multiplier tiers, adjust balances, or suspend malicious activity.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="user-search"
                type="text"
                placeholder="Search user, email, country..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-1">Full Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Active Role</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Wallet Balance</th>
                  <th className="pb-3">Account Level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Administrative Override Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-600 dark:text-slate-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/30 ${user.suspended ? 'bg-red-500/5 opacity-70' : ''}`}>
                    <td className="py-3 pl-1 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {user.fullName}
                      {user.suspended && (
                        <span className="p-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                          <ShieldX className="w-3 h-3" /> SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">
                      {user.email}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize bg-slate-50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">{user.country}</td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      <button
                        id={`btn-adjust-bal-${user.id}`}
                        onClick={() => handleEditBalance(user.id, user.balance)}
                        className="flex items-center gap-1 hover:text-indigo-500 cursor-pointer"
                        title="Click to adjust balance"
                      >
                        ${user.balance.toFixed(2)}
                        <Coins className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500" />
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        id={`btn-tier-user-${user.id}`}
                        onClick={() => handleRotateLevel(user)}
                        className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-extrabold uppercase rounded text-[9px] hover:bg-indigo-500 hover:text-white transition-all cursor-pointer"
                        title="Click to change level"
                      >
                        {user.accountLevel} ⚡
                      </button>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        user.verified
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/25 dark:border-emerald-800/40 dark:text-emerald-400'
                          : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/25 dark:border-rose-800/40 dark:text-rose-400'
                      }`}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        id={`btn-suspend-${user.id}`}
                        onClick={() => suspendUser(user.id, !user.suspended)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          user.suspended
                            ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20'
                            : 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20'
                        }`}
                      >
                        {user.suspended ? 'Reactivate' : 'Suspend Account'}
                      </button>

                      <button
                        id={`btn-toggle-role-${user.id}`}
                        onClick={() => {
                          const nextRole: Record<string, 'reviewer' | 'business_owner' | 'admin'> = {
                            'reviewer': 'business_owner',
                            'business_owner': 'admin',
                            'admin': 'reviewer'
                          };
                          const updatedUser = { ...user, role: nextRole[user.role] };
                          const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
                          setUsers(updatedUsers);
                          localStorage.setItem('rh_users', JSON.stringify(updatedUsers));
                        }}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-all font-bold cursor-pointer"
                      >
                        Swap Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns & Jobs Tab */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Manual Campaign Creation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Launch Manual Job / Campaign
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Create a custom review job override directly. If the business owner has enough balance, funds are allocated from them.
            </p>

            {adminCampSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Job active in marketplace!</span>
              </div>
            )}

            {adminCampError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{adminCampError}</span>
              </div>
            )}

            <form onSubmit={handleAdminCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Target Company / Business
                </label>
                <select
                  required
                  value={adminSelectedBizId}
                  onChange={(e) => setAdminSelectedBizId(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="">-- Choose Business --</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name} [{b.status}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Reviews Limit
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adminReviewsNeeded}
                    onChange={(e) => setAdminReviewsNeeded(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Reward Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adminRewardAmount}
                    onChange={(e) => setAdminRewardAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Campaign Duration
                </label>
                <select
                  value={adminDuration}
                  onChange={(e) => setAdminDuration(parseInt(e.target.value) || 30)}
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
                  Manual Job Instructions
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Focus on assessing overall responsiveness and load speeds..."
                  value={adminCampaignDesc}
                  onChange={(e) => setAdminCampaignDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Activate Manual Campaign
              </button>
            </form>
          </div>

          {/* Existing Campaigns Manager */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">
              Active & Closed Campaigns Management
            </h3>

            {campaigns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No campaigns found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {campaigns.map((camp) => {
                  const percent = Math.min(100, Math.round((camp.reviewsCompleted / camp.reviewsNeeded) * 100));
                  return (
                    <div key={camp.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {camp.businessName}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal mt-0.5">
                              ID: {camp.id} | Launched {new Date(camp.createdAt).toLocaleDateString()}
                            </span>
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          camp.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : camp.status === 'paused'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {camp.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        "{camp.description}"
                      </p>

                      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/80 rounded-xl text-center">
                        <div>
                          <span className="block text-[9px] text-slate-400">Escrow Paid</span>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">${camp.totalBudget.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400">Payer Rate</span>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">${camp.rewardPerReview.toFixed(2)}/rev</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400">Target Count</span>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">{camp.reviewsNeeded} Reviews</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Target Progress: {camp.reviewsCompleted} / {camp.reviewsNeeded} completed</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <span>Duration Limit: <strong>{camp.durationDays || 30} days</strong></span>
                        <div className="flex gap-2">
                          {camp.status === 'active' ? (
                            <button
                              id={`btn-pause-camp-${camp.id}`}
                              onClick={() => updateCampaignStatus(camp.id, 'paused')}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Pause className="w-3 h-3" /> Pause
                            </button>
                          ) : camp.status === 'paused' ? (
                            <button
                              id={`btn-resume-camp-${camp.id}`}
                              onClick={() => updateCampaignStatus(camp.id, 'active')}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" /> Activate
                            </button>
                          ) : null}

                          {camp.status !== 'completed' && (
                            <button
                              id={`btn-close-camp-${camp.id}`}
                              onClick={() => {
                                if (confirm("Close campaign? Remaining escrow funds will be refunded immediately.")) {
                                  updateCampaignStatus(camp.id, 'completed');
                                }
                              }}
                              className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Terminate & Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Auditing Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Platform Incoming Feedback & Reviews Registry
              </h3>
              <p className="text-xs text-slate-500">
                Audit complete submitted reviews. Flag suspicious AI-generated gibberish or spam, or override approve/reject actions.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="review-search"
                type="text"
                placeholder="Search business, reviewer, content..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
              />
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No submitted reviews found matching your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <div key={rev.id} className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                  rev.isSuspicious 
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-500/5' 
                    : rev.status === 'approved'
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-500/5'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
                }`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {rev.businessName}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">
                          By reviewer: <strong>{rev.reviewerName}</strong> ({rev.reviewerEmail})
                        </span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 justify-end">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Reward: <strong>${rev.rewardAmount.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850/60 rounded-xl space-y-1.5">
                    <div>
                      <span className="text-[9px] text-indigo-500 uppercase font-black block">Public Review text</span>
                      <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed italic">
                        "{rev.feedback}"
                      </p>
                    </div>
                    {rev.constructiveFeedback && (
                      <div>
                        <span className="text-[9px] text-amber-500 uppercase font-black block">Constructive private notes</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          "{rev.constructiveFeedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rev.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                          : rev.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      }`}>
                        {rev.status}
                      </span>

                      {rev.isSuspicious && (
                        <span className="px-1.5 py-0.5 bg-rose-500 text-white font-extrabold rounded text-[8px] flex items-center gap-0.5 uppercase tracking-wide">
                          <AlertTriangle className="w-2.5 h-2.5" /> Flagged Suspicious
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        id={`btn-flag-suspicious-${rev.id}`}
                        onClick={() => flagReview(rev.id, !rev.isSuspicious)}
                        className={`px-2 py-1 rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer ${
                          rev.isSuspicious
                            ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white'
                            : 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {rev.isSuspicious ? 'Clear Safe' : 'Flag Suspicious'}
                      </button>

                      {rev.status === 'pending' && (
                        <>
                          <button
                            id={`btn-reject-rev-${rev.id}`}
                            onClick={() => approveReview(rev.id, 'rejected')}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                          <button
                            id={`btn-approve-rev-${rev.id}`}
                            onClick={() => approveReview(rev.id, 'approved')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all text-[9px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Package Settings Tab */}
      {activeTab === 'packages' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Business Campaign Packages Configurator
            </h3>
            <p className="text-xs text-slate-500">
              Set default package pricing and target quantities. Business Owners can select these templates when purchasing campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {campaignPackages.map((pkg) => (
              <div key={pkg.id} className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl text-center space-y-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-indigo-500/10 text-indigo-500 font-display">
                    {pkg.name} Tier
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
                    {pkg.reviewsCount}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Target Reviews</p>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-0.5">
                  <p className="text-[10px] text-slate-400">Escrow Pricing Rate</p>
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    ${pkg.costPerReview.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">/review</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-850/80 flex flex-col gap-2">
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Total Package Cost:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-300">${(pkg.reviewsCount * pkg.costPerReview).toFixed(2)}</strong>
                  </div>
                  <button
                    id={`btn-edit-pkg-${pkg.id}`}
                    onClick={() => handleEditPackage(pkg.id, pkg.reviewsCount, pkg.costPerReview)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" /> Adjust Template Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax and Finance Settings Tab */}
      {activeTab === 'tax_finance' && (
        <div className="space-y-8 animate-fade-in text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Tax Parameters Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Tax & Processing Formula Settings
                </h3>
                <p className="text-[11px] text-slate-400">
                  Update parameters governing the pre-payout statutory processing charges.
                </p>
              </div>

              {financeSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold font-mono">
                  ✓ Configuration Updated successfully in platform state!
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Flat Clearing Charge (USD)
                  </label>
                  <input
                    id="admin-tax-flat"
                    type="number"
                    step="0.01"
                    value={taxFlatFee}
                    onChange={(e) => setTaxFlatFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono text-slate-800 dark:text-slate-100"
                  />
                  <span className="block text-[9px] text-slate-400 mt-1">Default is $1.30</span>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Percentage Clearance Tax (%)
                  </label>
                  <input
                    id="admin-tax-percent"
                    type="number"
                    step="0.1"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-mono text-slate-800 dark:text-slate-100"
                  />
                  <span className="block text-[9px] text-slate-400 mt-1">Default is 2%</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const flat = parseFloat(taxFlatFee);
                    const pct = parseFloat(taxPercent);
                    if (!isNaN(flat) && !isNaN(pct)) {
                      updateWithdrawalSettings(flat, pct, taxAddresses);
                      setFinanceSuccess(true);
                      setTimeout(() => setFinanceSuccess(false), 3000);
                    } else {
                      alert('Please enter valid numerical values.');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Tax Parameters
                </button>
              </div>
            </div>

            {/* 2. Configure Tax Deposit Addresses */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  Tax Settlement Deposit Addresses
                </h3>
                <p className="text-[11px] text-slate-400">
                  Update coordinates where reviewers must deposit tax clearances.
                </p>
              </div>

              <div className="space-y-3">
                {['USDT TRC20', 'Bitcoin', 'Ethereum', 'M-Pesa'].map((chan) => (
                  <div key={chan} className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      {chan} Address / Till
                    </label>
                    <input
                      type="text"
                      placeholder={chan === 'M-Pesa' ? 'e.g. Till: 541789' : 'e.g. Wallet String'}
                      value={taxAddresses[chan] || ''}
                      onChange={(e) => setTaxAddresses({ ...taxAddresses, [chan]: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const flat = parseFloat(taxFlatFee);
                    const pct = parseFloat(taxPercent);
                    updateWithdrawalSettings(flat, pct, taxAddresses);
                    setFinanceSuccess(true);
                    setTimeout(() => setFinanceSuccess(false), 3000);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save Deposit Coordinates
                </button>
              </div>
            </div>

          </div>

          {/* Business Owner Advertising Deposit Requests Auditing Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-pink-500" />
                Advertising Escrow Deposit Requests
              </h3>
              <p className="text-[11px] text-slate-400">
                Verify crypto and invoicing deposit payments submitted by business owners to top-up their campaign accounts.
              </p>
            </div>

            {depositRequests.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500">No deposit requests recorded in system state.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Request ID</th>
                      <th className="pb-2">User / Business Owner</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2">Details</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {depositRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-400">{req.id}</td>
                        <td className="py-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{req.userName}</span>
                          <span className="text-[9px] text-slate-400 block">{req.userEmail}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-600 dark:text-slate-300">
                            {req.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                          ${req.amount.toFixed(2)}
                        </td>
                        <td className="py-3 max-w-[150px] truncate text-slate-500" title={req.paymentDetails}>
                          {req.paymentDetails || 'N/A'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {req.status === 'Pending Review' || req.status === 'Awaiting Payment' || req.status === 'Under Verification' ? (
                            <div className="inline-flex gap-1 justify-end">
                              <button
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason:", "Invalid reference number.");
                                  if (reason !== null) {
                                    processDepositRequest(req.id, 'Rejected', reason);
                                  }
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer transition-all"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const refNum = prompt("Enter Transaction reference number / notes:", "Oracle validated payment received.");
                                  if (refNum !== null) {
                                    processDepositRequest(req.id, 'Approved', 'Cleared by system administrator', refNum);
                                  }
                                }}
                                className="p-1 text-emerald-600 hover:bg-emerald-600/10 rounded cursor-pointer transition-all"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-400">Archived</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Global Withdrawal Request & Clearance Ledger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Comprehensive Escrow & Tax Clearance Ledger
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Audit trail of all requested reviewer payouts, submitted tax clearance declarations, and routing states.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(withdrawals, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `ReviewNest_Withdrawals_Report_${new Date().toISOString().slice(0,10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Export Ledger Report (JSON)
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No payout logs recorded on this node.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-150 dark:border-slate-850">
                      <th className="p-3">User / Email</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Processing Tax</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Clearance Ref / Receipt</th>
                      <th className="p-3 text-right">Ledger Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {withdrawals.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="p-3 font-sans">
                          <strong className="text-slate-800 dark:text-slate-200 block text-xs">{req.userName}</strong>
                          <span className="text-[10px] text-slate-400 block">{req.userEmail}</span>
                        </td>
                        <td className="p-3 uppercase font-bold text-slate-600 dark:text-slate-400">{req.paymentMethod}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-white">${req.amount.toFixed(2)}</td>
                        <td className="p-3 text-rose-500 font-bold">${req.fee.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold border ${
                            req.status === 'paid'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                              : req.status === 'awaiting_tax_payment'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
                              : req.status === 'pending'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              : req.status === 'tax_received'
                              ? 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                              : req.status === 'processing'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                              : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold font-mono">
                          {req.feePaymentStatus === 'verified' || req.status === 'tax_received' || req.status === 'processing' || req.status === 'paid' ? (
                            <span className="text-[#4EB443] flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {(req as any).taxPaidMethod || 'DECLARED'} : {(req as any).taxReference || 'MANUAL'}
                            </span>
                          ) : (req as any).taxReference ? (
                            <div className="space-y-1">
                              <span className="block text-[10px] text-amber-500 font-bold">Awaiting Verification</span>
                              <span className="block text-[8px] text-slate-400 font-mono">{(req as any).taxPaidMethod}: {(req as any).taxReference}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-light italic">None submitted</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            
                            {/* Actions based on state */}
                            {req.status === 'awaiting_tax_payment' && (
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(req.id, 'tax_received')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Mark Tax Received
                              </button>
                            )}

                            {req.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(req.id, 'tax_received')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Verify & Accept Tax
                              </button>
                            )}

                            {(req.status === 'tax_received' || req.status === 'pending') && (
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(req.id, 'processing')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Begin Processing
                              </button>
                            )}

                            {req.status === 'processing' && (
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(req.id, 'paid')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[9px] transition-all cursor-pointer animate-pulse"
                              >
                                Mark Paid & Settled
                              </button>
                            )}

                            {req.status !== 'paid' && req.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => approveWithdrawal(req.id, 'rejected')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'restrictions' && (
        <div id="restrictions-tab-content" className="space-y-6 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  Reviewer Job Restrictions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Restrict specific reviewers from receiving review jobs, view histories, or remove active restrictions.
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={restrictionSearch}
                  onChange={(e) => setRestrictionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Restricted / Unrestricted Summary banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Total Reviewers</span>
                <strong className="text-base font-extrabold text-slate-850 dark:text-slate-100">
                  {users.filter(u => u.role === 'reviewer').length}
                </strong>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-rose-400">Restricted Users</span>
                <strong className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {users.filter(u => u.role === 'reviewer' && u.restricted).length}
                </strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-emerald-400">Active (Unrestricted)</span>
                <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {users.filter(u => u.role === 'reviewer' && !u.restricted).length}
                </strong>
              </div>
            </div>

            {/* Reviewers List */}
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4">User Info</th>
                    <th className="p-4">Region & level</th>
                    <th className="p-4">Earnings</th>
                    <th className="p-4">Restriction status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {users
                    .filter(u => u.role === 'reviewer')
                    .filter(u => {
                      if (!restrictionSearch) return true;
                      const s = restrictionSearch.toLowerCase();
                      return u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
                    })
                    .map(u => {
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                                {u.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{u.fullName}</h4>
                                <span className="text-[10px] text-slate-400 block">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{u.country || 'Global'}</span>
                            <span className="block text-[10px] text-slate-400">{u.accountLevel}</span>
                          </td>
                          <td className="p-4 font-mono">
                            <span className="font-bold text-slate-800 dark:text-slate-200">${u.balance.toFixed(2)}</span>
                            <span className="block text-[10px] text-slate-400">Total: ${u.totalEarnings.toFixed(2)}</span>
                          </td>
                          <td className="p-4">
                            {u.restricted ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  <ShieldAlert className="w-3 h-3" /> Restricted
                                </span>
                                {u.restrictionNotes && (
                                  <p className="text-[10px] text-rose-400 max-w-xs line-clamp-1 italic">
                                    "{u.restrictionNotes}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Active / Free
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* History toggle or expand button */}
                              {u.restrictionHistory && u.restrictionHistory.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(
                                      `Restriction History for ${u.fullName}:\n\n` +
                                      u.restrictionHistory!.map((h, i) => 
                                        `[${i+1}] ${new Date(h.timestamp).toLocaleString()}\nAction: ${h.action}\nNotes: ${h.notes || 'None'}`
                                      ).join('\n\n')
                                    );
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                  title="View history logs"
                                >
                                  Logs ({u.restrictionHistory.length})
                                </button>
                              )}

                              {u.restricted ? (
                                <button
                                  type="button"
                                  onClick={() => restrictUser(u.id, false, "Admin removed restriction.")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Unlock className="w-3.5 h-3.5" /> Lift Limit
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForRestriction(u);
                                    setRestrictionNotes('');
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Lock className="w-3.5 h-3.5" /> Restrict
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for adding restriction notes */}
          {selectedUserForRestriction && (
            <div id="restriction-notes-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl text-left">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Restrict Reviewer: {selectedUserForRestriction.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    This user will immediately be blocked from completing audits. Their slots remaining will display as 0 and jobs will be greyed out.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">
                    Internal Restriction Notes (Visible only to Admins)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Suspicious automated behavior detected, restricted pending verification."
                    value={restrictionNotes}
                    onChange={(e) => setRestrictionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 text-[10px] font-bold uppercase">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForRestriction(null);
                      setRestrictionNotes('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      restrictUser(selectedUserForRestriction.id, true, restrictionNotes);
                      setSelectedUserForRestriction(null);
                      setRestrictionNotes('');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
                  >
                    Restrict Immediately
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
