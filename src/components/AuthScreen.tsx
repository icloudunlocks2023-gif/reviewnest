import React, { useState, useEffect } from 'react';
import { useStore } from '../state/StoreContext';
import { UserRole } from '../types';
import { Mail, Lock, User, Globe, Phone, ShieldCheck, Key, RefreshCw, Send, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export interface AuthScreenProps {
  isEmbedded?: boolean;
  initialTab?: 'login' | 'register';
  forcedRole?: UserRole;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  isEmbedded = false,
  initialTab = 'login',
  forcedRole
}) => {
  const { login, register, resetPasswordFlow, updateUserSecurity, theme } = useStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [role, setRole] = useState<UserRole>(forcedRole || 'reviewer');

  // Sync state if props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (forcedRole) {
      setRole(forcedRole);
    }
  }, [forcedRole]);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Security flows
  const [flow, setFlow] = useState<'auth' | 'forgot' | 'verify' | 'mfa'>('auth');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [pendingMfaEmail, setPendingMfaEmail] = useState('');
  const [pendingMfaRole, setPendingMfaRole] = useState<UserRole>('reviewer');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    // Check if account has 2FA enabled (Sarah has it off, Admin Alex has it on)
    // For demo purposes, if email is admin@reviewhub.pro, prompt MFA!
    if (loginEmail.toLowerCase() === 'admin@reviewhub.pro') {
      setPendingMfaEmail(loginEmail);
      setPendingMfaRole('admin');
      setFlow('mfa');
      return;
    }

    const success = login(loginEmail, role);
    if (!success) {
      setLoginError('Invalid credentials. Try using one of the demo buttons below!');
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode === '123 456') {
      login(pendingMfaEmail, pendingMfaRole);
      setFlow('auth');
    } else {
      setMfaError('Incorrect 6-digit authentication code. (Use 123456 for demo)');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName || !regEmail || !regPassword || !regPhone) {
      setRegError('Please fill out all required fields.');
      return;
    }

    const success = register(regName, regEmail, role, regCountry, regPhone);
    if (success) {
      // Show Verification pending flow
      setFlow('verify');
    } else {
      setRegError('An account with this email already exists.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    resetPasswordFlow(resetEmail);
    setResetSent(true);
  };

  const handleQuickLogin = (email: string, r: UserRole) => {
    setLoginEmail(email);
    setLoginPassword('password123');
    setRole(r);
    
    if (email === 'admin@reviewhub.pro') {
      setPendingMfaEmail(email);
      setPendingMfaRole('admin');
      setFlow('mfa');
    } else {
      login(email, r);
    }
  };

  const renderInnerForm = () => {
    return (
      <>
        {/* Logo and Tagline */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/fWtwN1jH/f22474d7-7c99-495b-b812-bf5cb30e30bd.jpg" 
            alt="ReviewNest Logo" 
            className="w-16 h-16 rounded-2xl object-contain bg-white shadow-lg mb-4 border border-slate-100"
            referrerPolicy="no-referrer"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 rounded-full text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3">
            <ShieldCheck className="w-4.5 h-4.5" />
            Zero-Trust Review System
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Review<span className="text-indigo-500">Nest</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            The decentralized trust engine for business reviews
          </p>
        </div>

        {flow === 'auth' && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
              <button
                id="tab-login"
                onClick={() => { setActiveTab('login'); setLoginError(''); }}
                className={`flex-1 pb-3 text-center text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-register"
                onClick={() => { setActiveTab('register'); setRegError(''); }}
                className={`flex-1 pb-3 text-center text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                I want to participate as:
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                {(['reviewer', 'business_owner', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    id={`role-${r}`}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                      role === r
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50 font-bold'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      id="forgot-password"
                      type="button"
                      onClick={() => { setFlow('forgot'); setResetSent(false); }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-6 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign In Safely
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4" id="register-form">
                {regError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Globe className="w-4 h-4" />
                      </span>
                      <select
                        id="reg-country"
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="btn-register-submit"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-6 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  Register Secure Account
                </button>
              </form>
            )}

            {/* Demo Accounts Panel */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-4">
                Explore Demo Roles Instantly
              </span>
              <div className="space-y-2">
                <button
                  id="demo-reviewer"
                  onClick={() => handleQuickLogin('reviewer@reviewhub.pro', 'reviewer')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-950/40 dark:hover:bg-slate-850 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">
                      REV
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Sarah Jenkins (Reviewer)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Sarah Jenkins • SARAH.PAYMENTS • $125.50 Balance
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                    Access →
                  </span>
                </button>

                <button
                  id="demo-owner"
                  onClick={() => handleQuickLogin('owner@reviewhub.pro', 'business_owner')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-950/40 dark:hover:bg-slate-850 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                      OWN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        David Chen (Business Owner)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        David Chen • Sip & Byte Cafe • $450.00 Deposit
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                    Access →
                  </span>
                </button>

                <button
                  id="demo-admin"
                  onClick={() => handleQuickLogin('admin@reviewhub.pro', 'admin')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-500/20 bg-indigo-50/20 hover:bg-indigo-50/50 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/30 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500 font-bold text-xs">
                      ADM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        Alex Morgan (Platform Admin)
                      </h4>
                      <p className="text-[10px] text-indigo-500/80">
                        Alex Morgan • MFA Shield • Approved Withdrawals
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                    Access →
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD FLOW */}
        {flow === 'forgot' && (
          <div className="space-y-4">
            <button
              id="back-to-auth"
              onClick={() => setFlow('auth')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email address and we'll instantly generate a secure reset token and log the request to our ledger.
            </p>

            {resetSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Reset Link Dispatched
                </div>
                <p>
                  We've successfully logged this request. In production, an encrypted reset link would be emailed to <strong>{resetEmail}</strong>.
                </p>
                <button
                  id="reset-sent-login"
                  onClick={() => { setFlow('auth'); setResetSent(false); }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold mt-2 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <button
                  id="btn-send-reset"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Generate Security Ticket
                </button>
              </form>
            )}
          </div>
        )}

        {/* EMAIL VERIFICATION REQUIRED FLOW */}
        {flow === 'verify' && (
          <div className="text-center space-y-5 py-2">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 rounded-full flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900 animate-bounce">
              <Mail className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Verify your email address
            </h2>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We've created your secure review container! An activation email was sent to your registered address. Please click the button below to simulate verifying your email and entering the system.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-left">
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Pending Register Info
              </span>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong>Name:</strong> {regName}</p>
                <p><strong>Email:</strong> {regEmail}</p>
                <p><strong>Verification:</strong> <span className="text-amber-500 font-semibold">PENDING_ACTIVATION</span></p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="btn-simulate-verify"
                onClick={() => {
                  // Perform verify and log in
                  updateUserSecurity(false, true);
                  login(regEmail, role);
                  setFlow('auth');
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4.5 h-4.5" />
                Simulate Instant Verification
              </button>
              <button
                id="btn-verify-back"
                onClick={() => setFlow('auth')}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* TWO-FACTOR AUTHENTICATION VALIDATION SCREEN */}
        {flow === 'mfa' && (
          <form onSubmit={handleMfaSubmit} className="space-y-5 py-2">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 rounded-full flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Two-Factor Security
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the security code generated by your Authenticator app for <strong>{pendingMfaEmail}</strong>.
              </p>
            </div>

            {mfaError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{mfaError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
                6-Digit Authentication Code
              </label>
              <input
                id="mfa-code"
                type="text"
                required
                maxLength={7}
                placeholder="123 456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full text-center py-3 text-2xl font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-indigo-600 dark:text-indigo-400 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="block text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
                Tip: Enter code <strong>123456</strong> for testing.
              </span>
            </div>

            <div className="space-y-2">
              <button
                id="btn-mfa-submit"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-4.5 h-4.5" />
                Verify Identity
              </button>
              <button
                id="btn-mfa-cancel"
                type="button"
                onClick={() => setFlow('auth')}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs cursor-pointer"
              >
                Cancel Sign In
              </button>
            </div>
          </form>
        )}
      </>
    );
  };

  if (isEmbedded) {
    return (
      <div className="w-full text-slate-900 dark:text-white" id="auth-embedded">
        {renderInnerForm()}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative overflow-hidden min-h-[85vh]">
      {/* Visual background details to enhance aesthetic without tech larping */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10"></div>

      {/* Left Column: Stunning Image-Matched Hero Section */}
      <div className="lg:col-span-7 space-y-6 text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-slate-800 leading-none uppercase">
          RELIABLE FEEDBACK <br />
          <span className="text-indigo-500">SECURE REWARDS</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-light leading-relaxed max-w-xl">
          <strong className="font-semibold text-slate-800">ReviewNest</strong> is the ultimate destination for verified user feedback. Complete review tasks, support authentic businesses, and receive payouts securely through our decentralized review ledger system.
        </p>
        
        {/* Subtle decorative badges */}
        <div className="pt-4 flex flex-wrap gap-2.5 text-xs font-semibold text-slate-500">
          <span className="px-3 py-1 bg-white/70 border border-slate-200/80 rounded-full shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Verified Campaigns
          </span>
          <span className="px-3 py-1 bg-white/70 border border-slate-200/80 rounded-full shadow-xs">
            Escrow Protection
          </span>
          <span className="px-3 py-1 bg-white/70 border border-slate-200/80 rounded-full shadow-xs">
            Automatic Payouts
          </span>
        </div>
      </div>

      {/* Right Column: The interactive Login/Registration form */}
      <div className="lg:col-span-5 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl transition-all p-6 md:p-8">
        {renderInnerForm()}
      </div>
    </div>
  );
};
