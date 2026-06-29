import React, { useState } from 'react';
import { useStore } from '../state/StoreContext';
import { UserRole } from '../types';
import { Shield, LogOut, Wallet, User, ChevronDown, Award, RefreshCw, Settings, CheckCircle, Bell, Check, Trash2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout, login, theme, notifications, markNotificationAsRead, setReviewerActiveTab } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!currentUser) return null;

  const handleRoleSwap = (newRole: UserRole) => {
    login(currentUser.email, newRole);
    setDropdownOpen(false);
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/45';
      case 'business_owner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/45';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/45';
    }
  };

  const userNotifications = notifications ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header className="border-b border-slate-200/85 dark:border-slate-800/85 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Name */}
          <div className="flex items-center">
            <img 
              src="https://i.postimg.cc/fWtwN1jH/f22474d7-7c99-495b-b812-bf5cb30e30bd.jpg" 
              alt="ReviewNest Logo" 
              className="h-11 w-auto object-contain transition-transform hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Nav Actions / User info */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick Demo Balance Widget */}
            {currentUser.role === 'reviewer' ? (
              <button
                type="button"
                onClick={() => setReviewerActiveTab('payout_portal')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 text-xs text-indigo-600 dark:text-indigo-400 font-medium transition-all cursor-pointer shadow-xs hover:shadow-sm"
                title="Click to withdraw earnings"
              >
                <Wallet className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  My Earnings:
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  ${currentUser.balance.toFixed(2)}
                </span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs">
                <Wallet className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">
                  Deposit Balance:
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  ${currentUser.balance.toFixed(2)}
                </span>
              </div>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setDropdownOpen(false);
                }}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-slate-500 dark:text-slate-400 relative cursor-pointer"
              >
                <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? 'animate-bounce text-indigo-500' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-[10px] font-extrabold text-white flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-h-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 overflow-hidden flex flex-col text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                      <span className="font-display font-bold text-slate-900 dark:text-white">
                        Notifications Alerts
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            userNotifications.forEach(n => {
                              if (!n.read) markNotificationAsRead(n.id);
                            });
                          }}
                          className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px]">
                      {userNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                          <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          <span className="font-medium text-xs">All caught up!</span>
                          <span className="text-[10px] text-slate-400/80">No recent alerts found.</span>
                        </div>
                      ) : (
                        userNotifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              if (!n.read) markNotificationAsRead(n.id);
                            }}
                            className={`p-3 text-left transition-all hover:bg-slate-50/80 dark:hover:bg-slate-850/60 cursor-pointer ${
                              !n.read ? 'bg-indigo-50/25 dark:bg-indigo-950/5 border-l-2 border-indigo-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                                n.type === 'referral' ? 'bg-indigo-500/10 text-indigo-500' :
                                n.type === 'earnings_credited' ? 'bg-emerald-500/10 text-emerald-500' :
                                n.type === 'withdrawal_status' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>
                                {n.type.replace('_', ' ')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                              {n.message}
                            </p>
                            {!n.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(n.id);
                                }}
                                className="flex items-center gap-0.5 mt-1.5 text-[9px] text-indigo-500 font-bold hover:underline cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                Mark as Read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown / Quick Role Swap */}
            <div className="relative">
              <button
                id="profile-dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden md:block pr-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                      {currentUser.fullName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="block text-[10px] text-slate-400">
                    {currentUser.email}
                  </span>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 animate-fade-in text-sm">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Active Profile
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getRoleBadgeColor(currentUser.role)}`}>
                          {currentUser.role.replace('_', ' ')}
                        </span>
                        {currentUser.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Balance Mobile */}
                    {currentUser.role === 'reviewer' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewerActiveTab('payout_portal');
                          setDropdownOpen(false);
                        }}
                        className="sm:hidden w-full text-left px-3 py-2 border-b border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/15 hover:bg-indigo-100/40 dark:hover:bg-indigo-950/25 transition-all cursor-pointer"
                      >
                        <span className="block text-[10px] font-bold text-indigo-500">
                          My Earnings (Click to withdraw)
                        </span>
                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                          ${currentUser.balance.toFixed(2)}
                        </span>
                      </button>
                    ) : (
                      <div className="sm:hidden px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
                        <span className="block text-[10px] text-slate-400">
                          Deposit Balance
                        </span>
                        <span className="text-sm font-extrabold text-slate-950 dark:text-white font-mono">
                          ${currentUser.balance.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Role swap options (Demo feature) */}
                    <div className="p-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                        Swap Demo Role
                      </span>
                      <button
                        id="swap-role-reviewer"
                        onClick={() => handleRoleSwap('reviewer')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          currentUser.role === 'reviewer'
                            ? 'bg-slate-50 dark:bg-slate-800 text-indigo-500 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Reviewer Mode</span>
                        {currentUser.role === 'reviewer' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </button>
                      <button
                        id="swap-role-owner"
                        onClick={() => handleRoleSwap('business_owner')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          currentUser.role === 'business_owner'
                            ? 'bg-slate-50 dark:bg-slate-800 text-indigo-500 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Business Owner Mode</span>
                        {currentUser.role === 'business_owner' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </button>
                      <button
                        id="swap-role-admin"
                        onClick={() => handleRoleSwap('admin')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          currentUser.role === 'admin'
                            ? 'bg-slate-50 dark:bg-slate-800 text-indigo-500 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Platform Admin Mode</span>
                        {currentUser.role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </button>
                    </div>

                    {/* Security options shortcut */}
                    <div className="p-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold px-2 py-0.5">
                        LEVEL: {currentUser.accountLevel.toUpperCase()}
                      </span>
                    </div>

                    {/* Logout */}
                    <div className="p-1">
                      <button
                        id="header-logout-btn"
                        onClick={logout}
                        className="w-full text-left px-2 py-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Security Session
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
