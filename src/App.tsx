import React from 'react';
import { StoreProvider, useStore } from './state/StoreContext';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { BusinessOwnerDashboard } from './components/BusinessOwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { ShieldCheck, ArrowUpRight, Github, Heart } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { currentUser, theme } = useStore();

  if (!currentUser) {
    return <LandingPage />;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'reviewer':
        return <ReviewerDashboard />;
      case 'business_owner':
        return <BusinessOwnerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <AuthScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300 bg-gradient-mesh-light">
      
      {/* Header element */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>

      {/* Modern Humble Footer - Avoiding visual clutter */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/30 dark:bg-slate-900/10 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 font-display font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>ReviewNest Ledger System</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built securely with React & Tailwind CSS</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400/80">
            LATENCY: 2ms • SECURE CONTAINER OK
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}
