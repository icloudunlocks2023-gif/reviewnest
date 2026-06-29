import React, { useState, useEffect } from 'react';
import { useStore } from '../state/StoreContext';
import { 
  DollarSign, Clock, ArrowUpRight, CheckCircle2, AlertCircle, 
  Send, CreditCard, ChevronRight, Award, 
  ShieldAlert, Lock, ShieldCheck, Timer, Sparkles, 
  Check, RefreshCw, Wallet, Copy, ArrowLeft, Info, Landmark,
  QrCode, Coins, Smartphone, FileText, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { WithdrawalRequest } from '../types';

export const PayoutPortal: React.FC = () => {
  const {
    currentUser,
    withdrawals,
    requestWithdrawal,
    withdrawalSettings,
    declareTaxPayment,
    cancelWithdrawal
  } = useStore();

  // Wizard state
  const [withdrawStep, setWithdrawStep] = useState<number>(1);
  const [selectedMethod, setSelectedMethod] = useState<string>('M-Pesa');
  const [isStandardDropdownOpen, setIsStandardDropdownOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [destData, setDestData] = useState<Record<string, string>>({});
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Automated verification & cancellation flow state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [verificationStatusText, setVerificationStatusText] = useState<string>('');
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);
  
  // Balance Counting Animation State
  const [displayedBalance, setDisplayedBalance] = useState<number>(currentUser ? currentUser.balance : 0);
  const [animatingFrom, setAnimatingFrom] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.balance > displayedBalance) {
        setAnimatingFrom(displayedBalance);
        
        const start = displayedBalance;
        const end = currentUser.balance;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        
        let animationFrameId: number;
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease-out quadratic
          const easeProgress = progress * (2 - progress);
          const currentVal = start + (end - start) * easeProgress;
          
          setDisplayedBalance(currentVal);
          
          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            setDisplayedBalance(end);
          }
        };
        
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
      } else {
        setDisplayedBalance(currentUser.balance);
      }
    }
  }, [currentUser?.balance]);

  // Fee state
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [taxMethod, setTaxMethod] = useState<string>('USDT TRC20');
  const [taxReference, setTaxReference] = useState<string>('');
  const [taxError, setTaxError] = useState<string>('');
  const [taxSuccess, setTaxSuccess] = useState<boolean>(false);

  // Auto-switch payment instruction method to match chosen withdrawal method
  useEffect(() => {
    if (selectedWithdrawalId) {
      const w = withdrawals.find(item => item.id === selectedWithdrawalId);
      if (w) {
        if (w.paymentMethod === 'M-Pesa') {
          setTaxMethod('M-Pesa');
        } else if (withdrawalSettings.addresses[w.paymentMethod]) {
          setTaxMethod(w.paymentMethod);
        }
      }
    }
  }, [selectedWithdrawalId, withdrawals, withdrawalSettings]);

  // List of all 19 payment methods
  const instantMethods = ['M-Pesa', 'Bitcoin', 'USDT TRC20', 'USDT BEP20', 'USDT ERC20', 'Ethereum'];
  const standardMethods = [
    'Bank Transfer', 'PayPal', 'Skrill', 'Neteller', 'Wise', 'Payoneer', 
    'Western Union', 'MoneyGram', 'Visa', 'Mastercard', 'Binance Pay', 
    'Perfect Money', 'AdvCash'
  ];

  const statusMessages = [
    "Connecting to payment gateway...",
    "Verifying payment information...",
    "Matching transaction details...",
    "Checking recipient address...",
    "Validating payment...",
    "Finalizing verification..."
  ];

  const handleStartAutoVerification = (withdrawalId: string) => {
    setIsVerifying(true);
    setVerificationStep(0);
    setVerificationStatusText(statusMessages[0]);
    setVerificationFailed(false);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < statusMessages.length) {
        setVerificationStep(currentStep);
        setVerificationStatusText(statusMessages[currentStep]);
      } else {
        clearInterval(interval);
        setVerificationFailed(true);
        cancelWithdrawal(withdrawalId);
      }
    }, 1000);
  };

  // Helper to get styling config for each method
  const getMethodConfig = (method: string) => {
    switch (method) {
      case 'M-Pesa':
        return { icon: Smartphone, color: 'emerald', label: 'Mobile Money' };
      case 'Bitcoin':
        return { icon: Coins, color: 'amber', label: 'BTC Network' };
      case 'USDT TRC20':
        return { icon: Wallet, color: 'teal', label: 'TRON TRC20' };
      case 'USDT BEP20':
        return { icon: Wallet, color: 'yellow', label: 'BNB Smart Chain' };
      case 'USDT ERC20':
        return { icon: Wallet, color: 'indigo', label: 'Ethereum ERC20' };
      case 'Ethereum':
        return { icon: Coins, color: 'purple', label: 'ETH Network' };
      case 'Bank Transfer':
        return { icon: Landmark, color: 'blue', label: 'SWIFT Transfer' };
      case 'Visa':
      case 'Mastercard':
        return { icon: CreditCard, color: 'slate', label: 'Card Payment' };
      default:
        return { icon: Send, color: 'sky', label: 'E-Wallet Transfer' };
    }
  };

  // Real-time Fee Calculation
  const amountVal = parseFloat(withdrawAmount) || 0;
  const flatFee = withdrawalSettings?.taxFlatFee ?? 1.30;
  const percentFee = withdrawalSettings?.taxPercent ?? 2;
  const calculatedFee = flatFee + (percentFee / 100) * amountVal;

  const isStandard = standardMethods.includes(selectedMethod);
  const isAmountTooLowForStandard = isStandard && (!amountVal || amountVal < 500);

  // Form Validation helper
  const validateDestinationDetails = (): string => {
    if (instantMethods.includes(selectedMethod)) {
      if (selectedMethod === 'M-Pesa') {
        if (!(destData.fullName || '').trim()) return 'Full registered name is required.';
        const phone = (destData.phone || '').trim();
        if (!phone) return 'M-Pesa mobile number is required.';
        if (phone.length < 9) return 'Please enter a valid mobile number.';
      } else {
        const addr = (destData.walletAddress || '').trim();
        if (!addr) return 'Wallet address is required.';
        if (selectedMethod === 'Bitcoin') {
          if (!addr.startsWith('1') && !addr.startsWith('3') && !addr.startsWith('bc1')) {
            return 'Invalid Bitcoin address. Must start with 1, 3, or bc1.';
          }
          if (addr.length < 26) return 'Bitcoin address is too short.';
        } else if (selectedMethod === 'USDT TRC20') {
          if (!addr.startsWith('T')) return 'Invalid TRC20 address. TRC20 addresses must start with T.';
          if (addr.length < 34) return 'TRC20 address is too short.';
        } else if (['USDT BEP20', 'USDT ERC20', 'Ethereum'].includes(selectedMethod)) {
          if (!addr.startsWith('0x')) return 'Invalid EVM address. Must start with 0x.';
          if (addr.length !== 42) return 'Invalid address. EVM addresses must be exactly 42 characters.';
        }
      }
    } else {
      if (selectedMethod === 'Bank Transfer') {
        if (!(destData.accountName || '').trim()) return 'Account name is required.';
        if (!(destData.bankName || '').trim()) return 'Bank name is required.';
        if (!(destData.accountNumber || '').trim()) return 'Account number is required.';
        if (!(destData.swiftCode || '').trim()) return 'SWIFT / BIC code is required.';
      } else if (['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod)) {
        const email = (destData.email || '').trim();
        if (!email) return 'Recipient Email address is required.';
        if (!email.includes('@')) return 'Please enter a valid email address.';
      } else if (selectedMethod === 'Payoneer') {
        if (!(destData.payoneerId || '').trim()) return 'Payoneer Email or Customer ID is required.';
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
        if (!(destData.pmAccount || '').trim()) return 'Perfect Money account ID is required.';
      } else if (selectedMethod === 'AdvCash') {
        if (!(destData.advAccount || '').trim()) return 'AdvCash account email or wallet number is required.';
      }
    }
    return '';
  };

  const handleNextStep = () => {
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (withdrawStep === 1) {
      setWithdrawStep(2);
      return;
    }

    if (withdrawStep === 2) {
      if (isNaN(amountVal) || amountVal <= 0) {
        setWithdrawError('Please enter a valid positive withdrawal amount.');
        return;
      }
      if (amountVal > currentUser.balance) {
        setWithdrawError(`Insufficient balance. You have $${currentUser.balance.toFixed(2)} withdrawable.`);
        return;
      }
      if (isStandard && amountVal < 500) {
        setWithdrawError('This payment method requires a minimum withdrawal of $500.');
        return;
      }
      if (amountVal < 10) {
        setWithdrawError('The absolute minimum withdrawal limit is $10.00.');
        return;
      }
      setWithdrawStep(3);
      return;
    }

    if (withdrawStep === 3) {
      const err = validateDestinationDetails();
      if (err) {
        setWithdrawError(err);
        return;
      }

      // Format details string for logging
      let detailsStr = '';
      if (selectedMethod === 'M-Pesa') {
        detailsStr = `Name: ${destData.fullName}, Phone: ${destData.phone}`;
      } else if (instantMethods.includes(selectedMethod)) {
        detailsStr = `Wallet Address: ${destData.walletAddress}`;
      } else if (selectedMethod === 'Bank Transfer') {
        detailsStr = `Bank: ${destData.bankName}, Account: ${destData.accountName} (A/C: ${destData.accountNumber}, SWIFT: ${destData.swiftCode})`;
      } else if (['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod)) {
        detailsStr = `Email: ${destData.email}`;
      } else if (selectedMethod === 'Payoneer') {
        detailsStr = `Payoneer ID: ${destData.payoneerId}`;
      } else if (['Western Union', 'MoneyGram'].includes(selectedMethod)) {
        detailsStr = `Recipient: ${destData.fullName}, Country: ${destData.country}, Phone: ${destData.phone}`;
      } else if (['Visa', 'Mastercard'].includes(selectedMethod)) {
        detailsStr = `Cardholder: ${destData.cardholderName}, Card: **** **** **** ${destData.cardNumber?.slice(-4) || 'xxxx'}, Expiry: ${destData.expiryDate}`;
      } else if (selectedMethod === 'Binance Pay') {
        detailsStr = `Binance Pay ID: ${destData.binanceId}`;
      } else if (selectedMethod === 'Perfect Money') {
        detailsStr = `Perfect Money A/C: ${destData.pmAccount}`;
      } else if (selectedMethod === 'AdvCash') {
        detailsStr = `AdvCash: ${destData.advAccount}`;
      }

      const ok = requestWithdrawal(amountVal, selectedMethod, detailsStr, destData);
      if (ok) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setDestData({});
        setWithdrawStep(1);

        // Auto-select newly created request in the ledger to show step 4 directly
        setTimeout(() => {
          const fresh = [...withdrawals].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
          const latest = fresh.find(w => w.userId === currentUser.id);
          if (latest) {
            setSelectedWithdrawalId(latest.id);
          }
        }, 120);
      } else {
        setWithdrawError('Transaction routing failed. Please verify your balance and try again.');
      }
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleTaxPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTaxError('');
    setTaxSuccess(false);

    if (!taxReference.trim()) {
      setTaxError('Please enter the receipt reference code or transaction hash.');
      return;
    }

    if (selectedWithdrawalId) {
      const w = withdrawals.find(item => item.id === selectedWithdrawalId);
      if (w) {
        declareTaxPayment(w.id, taxMethod, taxReference.trim(), w.fee);
        setTaxSuccess(true);
        setTaxReference('');
      }
    }
  };

  // Get selected request details if any
  const selectedWithdrawal = withdrawals.find(w => w.id === selectedWithdrawalId);

  // Render SVG QR code helper
  const renderQRCode = () => {
    return (
      <div className="p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm relative group">
        <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
          <rect x="5" y="5" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="11" y="11" width="10" height="10" rx="1" fill="currentColor" />
          <rect x="73" y="5" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="79" y="11" width="10" height="10" rx="1" fill="currentColor" />
          <rect x="5" y="73" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="11" y="79" width="10" height="10" rx="1" fill="currentColor" />
          <rect x="42" y="42" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M45,45 L55,45 L55,51 C55,54 52,55 50,55 C48,55 45,54 45,51 Z" fill="currentColor" />
          <rect x="36" y="12" width="6" height="6" fill="currentColor" />
          <rect x="50" y="8" width="10" height="6" fill="currentColor" />
          <rect x="36" y="24" width="10" height="6" fill="currentColor" />
          <rect x="54" y="20" width="6" height="10" fill="currentColor" />
          <rect x="73" y="36" width="6" height="6" fill="currentColor" />
          <rect x="85" y="42" width="10" height="6" fill="currentColor" />
          <rect x="78" y="54" width="6" height="10" fill="currentColor" />
          <rect x="12" y="36" width="10" height="6" fill="currentColor" />
          <rect x="20" y="48" width="6" height="10" fill="currentColor" />
          <rect x="36" y="73" width="10" height="6" fill="currentColor" />
          <rect x="54" y="78" width="6" height="10" fill="currentColor" />
          <rect x="42" y="88" width="16" height="6" fill="currentColor" />
          <rect x="73" y="73" width="6" height="6" fill="currentColor" />
          <rect x="88" y="78" width="6" height="10" fill="currentColor" />
          <rect x="78" y="88" width="10" height="6" fill="currentColor" />
        </svg>
      </div>
    );
  };

  // Status visual configurations
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Payment Verification', color: 'amber', icon: Timer };
      case 'awaiting_tax_payment':
        return { label: 'Awaiting Processing Fee', color: 'rose', icon: ShieldAlert, pulse: true };
      case 'tax_received':
        return { label: 'Compliance Review', color: 'purple', icon: ShieldCheck };
      case 'processing':
        return { label: 'Withdrawal Processing', color: 'indigo', icon: RefreshCw, spin: true };
      case 'paid':
        return { label: 'Completed', color: 'emerald', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'Rejected', color: 'slate', icon: AlertCircle };
      case 'cancelled':
        return { label: 'Cancelled', color: 'slate', icon: XCircle };
      default:
        return { label: 'Unknown', color: 'slate', icon: AlertCircle };
    }
  };

  return (
    <div id="payout_portal_dashboard" className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Left Columns: Payout Creator Wizard or Step 4 Payout Inspector */}
      <div className="xl:col-span-2 space-y-6">
        
        {selectedWithdrawalId && selectedWithdrawal ? (
          /* STEP 4: DEDICATED PROCESSING & COMPLIANCE FEE VIEW */
          <div id="step_4_compliance_panel" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <button 
                id="btn_back_to_wizard"
                onClick={() => {
                  setSelectedWithdrawalId(null);
                  setWithdrawStep(1);
                  setTaxSuccess(false);
                  setTaxError('');
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Request New Withdrawal</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  ID: {selectedWithdrawal.id}
                </span>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Created: {new Date(selectedWithdrawal.requestedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Main Action Banner */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                Complete Withdrawal Processing
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To ensure secure and reliable payouts, every withdrawal request goes through our payment verification and compliance process before funds are released.
                The Processing & Compliance Fee helps cover:
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium list-none pl-0">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Secure payment gateway processing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Fraud prevention and identity verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Payment routing and network costs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Withdrawal verification
                </li>
                <li className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Platform operational costs
                </li>
              </ul>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 italic">
                Once the fee has been verified, your withdrawal request is moved to the payment queue for final processing.
              </p>
            </div>

            {/* Fee Summary Container */}
            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Estimated Settlement breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/50 dark:divide-slate-800/80">
                <div className="pt-2 sm:pt-0">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Requested Amount</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono block mt-1">
                    ${selectedWithdrawal.amount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Processing & Compliance Fee</span>
                  <span className="text-lg font-bold text-indigo-500 dark:text-indigo-400 font-mono block mt-1">
                    ${selectedWithdrawal.fee.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Payout Gateway</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-2">
                    {selectedWithdrawal.paymentMethod}
                  </span>
                </div>
                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Verification State</span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {(() => {
                      const c = getStatusConfig(selectedWithdrawal.status);
                      const Icon = c.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-${c.color}-500/10 text-${c.color}-500 ${c.pulse ? 'animate-pulse' : ''}`}>
                          <Icon className={`w-3 h-3 ${c.spin ? 'animate-spin' : ''}`} />
                          {c.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions Section */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  Processing Fee Payment Instructions
                </h4>
                <span className="text-[11px] font-mono font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                  Required: ${selectedWithdrawal.fee.toFixed(2)} USD
                </span>
              </div>

              {/* Admin Configured Addresses Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {Object.keys(withdrawalSettings.addresses).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setTaxMethod(method);
                      setTaxSuccess(false);
                      setTaxError('');
                    }}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      taxMethod === method
                        ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Deposit Coordinates Box */}
              <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
                
                {/* QR Code / M-Pesa Image Container with highly noticeable notice */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  {taxMethod !== 'M-Pesa' ? (
                    renderQRCode()
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex flex-col items-center justify-center text-center p-3 text-indigo-500">
                      <Smartphone className="w-10 h-10 mb-2 animate-bounce" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Mobile Money</span>
                      <span className="text-[8px] opacity-80 mt-0.5">Safaricom Escrow</span>
                    </div>
                  )}
                  {selectedWithdrawal && (
                    <div className="w-40 text-center text-[10px] leading-tight bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold p-2.5 rounded-xl shadow-sm animate-pulse">
                      {taxMethod === 'M-Pesa' ? (
                        <>
                          To withdraw {Math.round(selectedWithdrawal.amount * 130).toLocaleString()} ksh, pay fee of {Math.round(selectedWithdrawal.fee * 130).toLocaleString()} ksh
                          <div className="text-[8px] opacity-75 mt-1 font-normal">
                            (${selectedWithdrawal.amount.toFixed(2)} USD / fee: ${selectedWithdrawal.fee.toFixed(2)} USD)
                          </div>
                        </>
                      ) : (
                        `To withdraw $${selectedWithdrawal.amount.toFixed(2)}, pay fee of $${selectedWithdrawal.fee.toFixed(2)}`
                      )}
                    </div>
                  )}
                </div>

                {/* Text deposit detail */}
                <div className="flex-grow space-y-3 w-full text-center md:text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">
                      Deposit {taxMethod} Address / Number
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 block break-all bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-3 py-2.5 rounded-xl mt-1 select-all">
                      {withdrawalSettings.addresses[taxMethod] || 'Not Configured by Admin'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                      Network: {taxMethod === 'Bitcoin' ? 'BTC Mainnet' : taxMethod === 'USDT TRC20' ? 'TRON TRC20' : taxMethod === 'M-Pesa' ? 'Safaricom B2C' : taxMethod === 'Ethereum' || taxMethod === 'USDT ERC20' ? 'Ethereum ERC20' : 'Binance Smart Chain BEP20'}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleCopy(taxMethod === 'M-Pesa' ? '5417898' : (withdrawalSettings.addresses[taxMethod] || ''))}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{taxMethod === 'M-Pesa' ? 'Copy Till Number' : 'Copy Address'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* M-Pesa Step-by-Step Instructions */}
              {taxMethod === 'M-Pesa' && (
                <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Smartphone className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                    <span>LIPA NA M-PESA COMPLIANCE PAYMENT GUIDE</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-sans pl-6.5 space-y-2">
                    <p className="leading-relaxed font-medium">
                      Please follow these precise steps to clear your processing fee of <strong className="text-emerald-600 dark:text-emerald-400">${selectedWithdrawal.fee.toFixed(2)} USD</strong>:
                    </p>
                    <ol className="list-decimal space-y-2 pl-4 leading-relaxed font-light">
                      <li>Open your SIM Toolkit, M-Pesa App, or dial <code className="font-mono font-bold bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">*334#</code>.</li>
                      <li>Select option <span className="font-semibold text-slate-800 dark:text-slate-100">Lipa na M-Pesa</span>, then choose <span className="font-semibold text-slate-800 dark:text-slate-100">Buy Goods and Services</span>.</li>
                      <li>Enter Till Number: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded select-all">5417898</strong>.</li>
                      <li>Enter Amount: <strong className="font-mono font-bold bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-100">{(selectedWithdrawal.fee * 130).toFixed(0)} KES</strong> <span className="text-[10px] text-slate-400 dark:text-slate-500">(calculated at a static standard rate of 1 USD = 130 KES)</span>.</li>
                      <li>Enter your M-Pesa PIN and verify that the business name is displayed as <strong className="font-semibold text-emerald-600 dark:text-emerald-400">ReviewNest Escrow Ltd</strong>.</li>
                      <li>Upon receiving the Safaricom confirmation SMS, copy the 10-character transaction receipt ID (e.g., <span className="font-mono font-bold bg-emerald-500/10 px-1 text-emerald-600 dark:text-emerald-400 rounded">SGF81628H9</span>) and enter it in the input form below to complete verification.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Reference Declarator Form / Automated Verification Flow */}
              {selectedWithdrawal.status === 'awaiting_tax_payment' ? (
                <div className="space-y-4 pt-2">
                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 dark:bg-indigo-950/5 dark:border-indigo-900/30 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
                      Processing Fee Confirmation
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-light">
                      Once you have completed the Processing & Compliance Fee payment using the correct payment method, click the button below to allow our system to verify your transaction automatically.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartAutoVerification(selectedWithdrawal.id)}
                      className="w-full max-w-sm bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-pink-500/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 animate-pulse"
                    >
                      <Check className="w-4 h-4" />
                      <span>✓ I've Paid the Processing Fee</span>
                    </button>
                    
                    {confirmCancelId === selectedWithdrawal.id ? (
                      <div className="flex flex-col items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl w-full max-w-sm animate-fade-in">
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-bold text-center">
                          Are you sure you want to cancel and return ${selectedWithdrawal.amount.toFixed(2)} to your balance?
                        </span>
                        <div className="flex gap-4 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              cancelWithdrawal(selectedWithdrawal.id);
                              setSelectedWithdrawalId(null);
                              setConfirmCancelId(null);
                            }}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black py-2 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                          >
                            Yes, Cancel & Refund
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(null)}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                          >
                            No, Keep Active
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmCancelId(selectedWithdrawal.id);
                        }}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer transition-colors"
                      >
                        Cancel Withdrawal & Refund Balance
                      </button>
                    )}
                  </div>
                </div>
              ) : selectedWithdrawal.status === 'cancelled' ? (
                <div className="p-5 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>Withdrawal Request Cancelled</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-sans pl-6 space-y-1">
                    <div>Status: <span className="font-bold text-slate-700 dark:text-slate-300">Cancelled</span></div>
                    <div>Reason: <span className="font-bold text-slate-700 dark:text-slate-300">Processing fee payment could not be verified.</span></div>
                    <p className="mt-2 text-slate-500 leading-relaxed">
                      The requested withdrawal amount has been returned to your available balance. You may submit a new withdrawal request at any time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Declared & Processing Fee Logged</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pl-6">
                    <div>Reference: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedWithdrawal.feePaymentReference || 'Auto Cleared'}</span></div>
                    <div>Method Used: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedWithdrawal.taxPaidMethod || 'USDT'}</span></div>
                    <div className="mt-1">Our accounting desk is verifying the payment receipt. Once verified, final settlement dispatch begins instantly.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Important Notice Box */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                <AlertCircle className="w-4.5 h-4.5" />
                <span>Important Security Notice</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-6">
                For security and verification purposes, the Processing & Compliance Fee must be paid using the same payment account or wallet that will receive the withdrawal.
              </p>
              <div className="pl-6 space-y-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <div>• If withdrawing to a crypto wallet address, the Processing & Compliance Fee should be paid from that same crypto wallet address that will receive payment.</div>
                <div>• If withdrawing to an M-Pesa account, the fee should be paid using that same registered M-Pesa number.</div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pl-6 italic">
                This helps verify account ownership and reduces the risk of unauthorized payout requests.
              </p>
            </div>

            {/* Withdrawal Progress Tracker Stepper */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                Live Settlement Routing Status
              </h4>

              {/* Progress Stepper Stages */}
              <div className="relative pt-2">
                {/* Horizontal Line backdrop for md screens */}
                <div className="absolute top-[25px] left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block z-0" />
                
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-2 relative z-10">
                  {(() => {
                    const status = selectedWithdrawal.status;
                    const stages = [
                      { id: 1, label: 'Request Created', active: true, done: true },
                      { id: 2, label: 'Awaiting Fee', active: status === 'awaiting_tax_payment', done: status !== 'awaiting_tax_payment' },
                      { id: 3, label: 'Payment Verification', active: status === 'pending', done: ['tax_received', 'processing', 'paid'].includes(status) },
                      { id: 4, label: 'Compliance Review', active: status === 'tax_received', done: ['processing', 'paid'].includes(status) },
                      { id: 5, label: 'Withdrawal Processing', active: status === 'processing', done: status === 'paid' },
                      { id: 6, label: 'Payment Sent', active: status === 'paid', done: status === 'paid' }
                    ];

                    return stages.map(s => {
                      const isActive = s.active;
                      const isDone = s.done;
                      return (
                        <div key={s.id} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2.5">
                          {/* Circle wrapper */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shrink-0 transition-all ${
                            isDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : isActive 
                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 animate-pulse' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}>
                            {isDone ? <Check className="w-5 h-5" /> : <span>{s.id}</span>}
                          </div>

                          <div className="text-left md:text-center">
                            <span className={`block text-[11px] font-bold ${isActive ? 'text-indigo-500' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                              {s.label}
                            </span>
                            <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {s.id === 1 && 'Registered'}
                              {s.id === 2 && (status === 'awaiting_tax_payment' ? 'Awaiting payment' : 'Cleared')}
                              {s.id === 3 && (status === 'pending' ? 'Verifying Ref' : isDone ? 'Cleared' : 'Pending')}
                              {s.id === 4 && (status === 'tax_received' ? 'Auditing logs' : isDone ? 'Cleared' : 'Pending')}
                              {s.id === 5 && (status === 'processing' ? 'Clearing network' : isDone ? 'Cleared' : 'Pending')}
                              {s.id === 6 && (status === 'paid' ? 'Dispatched' : 'Pending')}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* WIZARD (STEPS 1, 2, 3) */
          <div id="withdrawal_wizard_panel" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Steps Visual Tracker */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Payout Control Center
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Request secure, escrow-guaranteed withdrawals from your auditor balance.
                </p>
              </div>

              {/* Progress Badge */}
              <span className="text-[11px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full shrink-0">
                Step {withdrawStep} of 3
              </span>
            </div>

            {/* Steps Indicator Bar */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full transition-all ${withdrawStep >= 1 ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition-all ${withdrawStep >= 2 ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition-all ${withdrawStep >= 3 ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
            </div>

            {/* Error notifications */}
            {withdrawError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/10 text-rose-500 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 rounded-2xl text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Withdrawal request registered! Moving to Step 4.</span>
              </div>
            )}

            {/* STEP 1: SELECT WITHDRAWAL METHOD */}
            {withdrawStep === 1 && (
              <div id="wizard_step_1" className="space-y-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-indigo-500 block tracking-wider">
                    Step 1
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Select your preferred Payout Destination
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Please select your preferred option. Standard methods have minimum dispatch parameters.
                  </p>
                </div>

                {/* Instant Methods Categorization */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ⚡ Instant Withdrawal Methods (No Minimum Withdrawal)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {instantMethods.map(m => {
                      const config = getMethodConfig(m);
                      const Icon = config.icon;
                      const isSelected = selectedMethod === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMethod(m)}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-28 relative group ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                          <div className={`p-2 rounded-xl w-fit bg-${config.color}-500/10 text-${config.color}-500`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{m}</span>
                            <span className="block text-[8px] font-semibold text-emerald-500 mt-0.5 uppercase tracking-wide">
                              Available for all withdrawal amounts
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Standard Methods Categorization */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    🏦 Standard Withdrawal Methods (Minimum $500)
                  </span>

                  {/* Dropdown Menu Container */}
                  <div className="relative">
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsStandardDropdownOpen(!isStandardDropdownOpen)}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between bg-white dark:bg-slate-900/50 ${
                        isStandardDropdownOpen 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {standardMethods.includes(selectedMethod) ? (
                          <>
                            {/* Standard Method selected */}
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                              {React.createElement(getMethodConfig(selectedMethod).icon, { className: "w-5 h-5" })}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{selectedMethod}</span>
                              <span className="block text-[10px] font-semibold text-indigo-500 mt-0.5">
                                Selected Standard Method (Minimum $500)
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Instant Method or nothing selected */}
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                              <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-slate-400 dark:text-slate-500">Select standard payment method</span>
                              <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                                Minimum withdrawal: $500
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {standardMethods.includes(selectedMethod) && (
                          <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                            Selected
                          </span>
                        )}
                        {isStandardDropdownOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Dropdown Options Panel */}
                    {isStandardDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown on click outside */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsStandardDropdownOpen(false)} 
                        />
                        
                        <div className="absolute left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                          {standardMethods.map(m => {
                            const config = getMethodConfig(m);
                            const Icon = config.icon;
                            const isSelected = selectedMethod === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setSelectedMethod(m);
                                  setIsStandardDropdownOpen(false);
                                }}
                                className={`w-full p-3 flex items-center justify-between text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl ${
                                  isSelected 
                                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500' 
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl ${
                                    isSelected 
                                      ? 'bg-indigo-500/15 text-indigo-500' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="block text-xs font-bold">{m}</span>
                                    <span className="block text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold uppercase tracking-wide">
                                      Minimum withdrawal: $500
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="w-4.5 h-4.5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ENTER WITHDRAWAL AMOUNT */}
            {withdrawStep === 2 && (
              <div id="wizard_step_2" className="space-y-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-indigo-500 block tracking-wider">
                    Step 2
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Enter Settlement Amount
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Your escrow-cleared Withdrawable balance is <strong className="text-slate-800 dark:text-white font-mono">${currentUser.balance.toFixed(2)}</strong>.
                  </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      placeholder="Enter amount (USD)"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        setWithdrawError('');
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-8 pr-4 py-3.5 text-base font-bold font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Preset selections */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[100, 500, 1000, 5000].map(amt => {
                      const isBelowLimit = isStandard && amt < 500;
                      return (
                        <button
                          key={amt}
                          type="button"
                          disabled={isBelowLimit}
                          onClick={() => {
                            setWithdrawAmount(amt.toString());
                            setWithdrawError('');
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            isBelowLimit
                              ? 'border-slate-100 dark:border-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-55'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-indigo-500 hover:text-indigo-500'
                          }`}
                        >
                          ${amt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* REAL-TIME COST SUMMARY CARD */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Real-time transaction computation
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Withdrawal Amount:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">${amountVal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing & Compliance Fee (Separate payment):</span>
                      <span className="font-bold text-indigo-500 dark:text-indigo-400 font-mono">${calculatedFee.toFixed(2)}</span>
                    </div>
                    <hr className="border-slate-200/50 dark:border-slate-800/80" />
                    <div className="flex justify-between text-sm font-bold pt-1">
                      <span className="text-slate-900 dark:text-white">Net Released Amount:</span>
                      <span className="text-emerald-500 font-mono">${amountVal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Minimum $500 standard payment warning */}
                {isAmountTooLowForStandard && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/10 text-rose-500 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-pulse">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>This payment method requires a minimum withdrawal amount of $500.</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: ENTER PAYMENT DETAILS */}
            {withdrawStep === 3 && (
              <div id="wizard_step_3" className="space-y-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-indigo-500 block tracking-wider">
                    Step 3
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Enter Payment Coordinates ({selectedMethod})
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Please provide the coordinates to receive your funds. Verify details carefully to prevent settlement routing delays.
                  </p>
                </div>

                {/* Conditional Inputs based on Selected Payout Method */}
                <div className="space-y-4">
                  {selectedMethod === 'M-Pesa' ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Full Registered Name</label>
                        <input
                          type="text"
                          placeholder="Legal full name registered on M-Pesa"
                          value={destData.fullName || ''}
                          onChange={(e) => setDestData({ ...destData, fullName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Safaricom Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 0712345678 or 254712345678"
                          value={destData.phone || ''}
                          onChange={(e) => setDestData({ ...destData, phone: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </>
                  ) : instantMethods.includes(selectedMethod) ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Your Receive Address</label>
                        <input
                          type="text"
                          placeholder={`Paste your destination ${selectedMethod} address`}
                          value={destData.walletAddress || ''}
                          onChange={(e) => setDestData({ ...destData, walletAddress: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="p-3 bg-indigo-500/5 rounded-xl text-[10px] text-indigo-500 font-bold flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>Network Required: {selectedMethod === 'Bitcoin' ? 'BTC Mainnet' : selectedMethod === 'USDT TRC20' ? 'TRON Network (TRC-20)' : selectedMethod === 'USDT BEP20' ? 'Binance Smart Chain (BEP-20)' : 'Ethereum Network (ERC-20)'}</span>
                      </div>
                    </>
                  ) : selectedMethod === 'Bank Transfer' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Account holder name</label>
                        <input
                          type="text"
                          placeholder="Legal full name on Bank Account"
                          value={destData.accountName || ''}
                          onChange={(e) => setDestData({ ...destData, accountName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Bank Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Chase, HSBC, Equity Bank"
                          value={destData.bankName || ''}
                          onChange={(e) => setDestData({ ...destData, bankName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Account number / IBAN</label>
                        <input
                          type="text"
                          placeholder="Account Number or IBAN"
                          value={destData.accountNumber || ''}
                          onChange={(e) => setDestData({ ...destData, accountNumber: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">SWIFT / BIC / routing code</label>
                        <input
                          type="text"
                          placeholder="8-11 character Swift/Routing ID"
                          value={destData.swiftCode || ''}
                          onChange={(e) => setDestData({ ...destData, swiftCode: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : ['PayPal', 'Skrill', 'Neteller', 'Wise'].includes(selectedMethod) ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400">Receiver Email Address</label>
                      <input
                        type="email"
                        placeholder={`Your registered ${selectedMethod} email address`}
                        value={destData.email || ''}
                        onChange={(e) => setDestData({ ...destData, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : selectedMethod === 'Payoneer' ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400">Payoneer Email or Customer ID</label>
                      <input
                        type="text"
                        placeholder="Your Payoneer account email or ID"
                        value={destData.payoneerId || ''}
                        onChange={(e) => setDestData({ ...destData, payoneerId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : ['Western Union', 'MoneyGram'].includes(selectedMethod) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Recipient Full Name</label>
                        <input
                          type="text"
                          placeholder="Recipient legal name"
                          value={destData.fullName || ''}
                          onChange={(e) => setDestData({ ...destData, fullName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Recipient Country</label>
                        <input
                          type="text"
                          placeholder="e.g. Kenya, Nigeria, USA"
                          value={destData.country || ''}
                          onChange={(e) => setDestData({ ...destData, country: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Recipient Phone</label>
                        <input
                          type="tel"
                          placeholder="Active phone number"
                          value={destData.phone || ''}
                          onChange={(e) => setDestData({ ...destData, phone: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : ['Visa', 'Mastercard'].includes(selectedMethod) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Cardholder Full Name</label>
                        <input
                          type="text"
                          placeholder="Name printed on card"
                          value={destData.cardholderName || ''}
                          onChange={(e) => setDestData({ ...destData, cardholderName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={destData.expiryDate || ''}
                          onChange={(e) => setDestData({ ...destData, expiryDate: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-3">
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400">16-Digit Card Number</label>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={destData.cardNumber || ''}
                          onChange={(e) => setDestData({ ...destData, cardNumber: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : selectedMethod === 'Binance Pay' ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400">Binance Pay ID / Registered Email</label>
                      <input
                        type="text"
                        placeholder="Binance Pay ID (9-Digit) or Registered Email address"
                        value={destData.binanceId || ''}
                        onChange={(e) => setDestData({ ...destData, binanceId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : selectedMethod === 'Perfect Money' ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400">Perfect Money USD Account ID</label>
                      <input
                        type="text"
                        placeholder="e.g. U12345678"
                        value={destData.pmAccount || ''}
                        onChange={(e) => setDestData({ ...destData, pmAccount: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400">AdvCash Email or Wallet Number</label>
                      <input
                        type="text"
                        placeholder="Your registered AdvCash email or wallet ID"
                        value={destData.advAccount || ''}
                        onChange={(e) => setDestData({ ...destData, advAccount: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {withdrawStep > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawStep(withdrawStep - 1);
                    setWithdrawError('');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                disabled={isAmountTooLowForStandard}
                onClick={handleNextStep}
                className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isAmountTooLowForStandard
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                <span>{withdrawStep === 3 ? 'Request Payout' : 'Next Step'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Right Column: Transaction History Ledger List */}
      <div id="withdrawal_history_sidebar" className="space-y-6">
        
        {/* Withdrawable Balance KPI card in sidebar */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          
          <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-100">
            Escrow Guarded Wallet
          </span>
          <span className="block text-3xl font-black font-mono mt-2 tracking-tight">
            ${currentUser.balance.toFixed(2)}
          </span>
          
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-indigo-100 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Cleared auditor payout balance ready</span>
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Settlement Ledger
            </h3>
            
            {selectedWithdrawalId && (
              <button 
                id="btn_new_request_top"
                onClick={() => {
                  setSelectedWithdrawalId(null);
                  setWithdrawStep(1);
                  setTaxSuccess(false);
                  setTaxError('');
                }}
                className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Click on any request below to view its 6-stage compliance routing, processing instructions, or declare fee payments.
          </p>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {withdrawals.filter(w => w.userId === currentUser.id).length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-600 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No past withdrawals registered.
              </div>
            ) : (
              [...withdrawals]
                .filter(w => w.userId === currentUser.id)
                .sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                .map(w => {
                  const isSelected = selectedWithdrawalId === w.id;
                  const c = getStatusConfig(w.status);
                  const Icon = c.icon;
                  return (
                    <div
                      key={w.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedWithdrawalId(w.id);
                        setTaxSuccess(false);
                        setTaxError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedWithdrawalId(w.id);
                          setTaxSuccess(false);
                          setTaxError('');
                        }
                      }}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col gap-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950/30'
                      }`}
                    >
                      {/* Top line */}
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">
                            {new Date(w.requestedAt).toLocaleDateString()}
                          </span>
                          <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                            {w.paymentMethod}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-slate-900 dark:text-white font-mono">
                            ${w.amount.toFixed(2)}
                          </span>
                          <span className="block text-[9px] text-indigo-500 font-mono mt-0.5">
                            Fee: ${w.fee.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex justify-between items-center w-full pt-1.5 border-t border-slate-100/50 dark:border-slate-800/50">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[120px] font-mono">
                          Ref: {w.id}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {w.status === 'awaiting_tax_payment' && (
                            <div className="flex items-center gap-1.5">
                              {confirmCancelId === w.id ? (
                                <div className="flex items-center gap-1 bg-rose-500/5 border border-rose-500/20 px-2 py-1 rounded-lg animate-fade-in">
                                  <span className="text-[8px] text-rose-500 font-bold mr-1">Confirm cancel?</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelWithdrawal(w.id);
                                      if (selectedWithdrawalId === w.id) {
                                        setSelectedWithdrawalId(null);
                                      }
                                      setConfirmCancelId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-500 hover:bg-rose-600 text-white text-[8px] font-black rounded-md transition-all cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmCancelId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[8px] font-bold rounded-md transition-all cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmCancelId(w.id);
                                  }}
                                  className="px-2 py-0.5 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[9px] font-bold text-rose-500 rounded-lg transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                          
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-${c.color}-500/10 text-${c.color}-500 ${c.pulse ? 'animate-pulse' : ''}`}>
                            <Icon className={`w-3 h-3 ${c.spin ? 'animate-spin' : ''}`} />
                            {c.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Automated Verification Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 overflow-hidden">
            
            {!verificationFailed ? (
              // LOADING / VERIFYING STATE
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-5">
                {/* Animated Shield/Radar Scan */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-2000" />
                  <div className="absolute inset-2 bg-indigo-500/5 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-3 border-transparent border-t-indigo-500 border-r-indigo-500 rounded-full animate-spin" />
                  <ShieldCheck className="w-12 h-12 text-indigo-500 relative z-10 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Verifying Your Payment...
                  </h3>
                  <p className="text-sm font-medium font-mono text-indigo-500 animate-pulse">
                    {verificationStatusText}
                  </p>
                </div>
                
                {/* Status dots */}
                <div className="flex gap-1.5 justify-center">
                  {statusMessages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === verificationStep ? 'bg-indigo-500 w-5' : idx < verificationStep ? 'bg-indigo-400/50' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // VERIFICATION RESULT (FAILED) & CANCELLATION SUCCESS
              <div className="space-y-6">
                {/* 1. Warning Card: Payment Could Not Be Verified */}
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-black text-sm uppercase tracking-wider">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <span>Payment Could Not Be Verified</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-sans">
                    <p className="leading-relaxed font-medium">
                      We could not find a matching Processing & Compliance Fee payment associated with this withdrawal request.
                    </p>
                    <p className="leading-relaxed font-light text-slate-500 dark:text-slate-400">
                      If you have already completed the payment, please contact our support team and include your payment details so we can review your transaction.
                    </p>
                  </div>
                </div>
                
                {/* 2. Success Notification: Withdrawal Cancelled & Wallet Updated */}
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Withdrawal Cancelled</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 font-sans">
                    <p className="leading-relaxed font-light">
                      Your withdrawal request has been cancelled because the required Processing & Compliance Fee could not be verified.
                    </p>
                    <p className="leading-relaxed font-semibold text-emerald-600 dark:text-emerald-400">
                      The full withdrawal amount has been returned to your available balance. You may submit a new withdrawal request at any time.
                    </p>
                  </div>
                  
                  {/* Wallet Update Counter animation block */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Available Balance Adjusted</span>
                    <div className="flex items-center gap-3 mt-1 font-mono">
                      <span className="text-xs line-through text-slate-400 font-medium">${animatingFrom.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-bold">→</span>
                      <span className="text-lg font-black text-emerald-500 animate-pulse">${displayedBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Our billing and compliance team has been notified. Please email support@reviewnest.io with your user ID and payment proof to expedite manual audit.");
                    }}
                    className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    Contact Support
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifying(false);
                      setSelectedWithdrawalId(null);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    Return to Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
