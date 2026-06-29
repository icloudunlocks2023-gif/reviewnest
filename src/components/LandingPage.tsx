import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/StoreContext';
import { 
  Shield, Star, CheckCircle, ArrowRight, Hotel, TrendingUp, Sparkles, 
  Lock, Server, Coins, BookOpen, Compass, Layers, ShoppingBag, 
  ArrowUpRight, AlertCircle, Play, ChevronDown, Check, Plus, Users, 
  BarChart3, RefreshCw, Smartphone, Laptop, MessageSquare, DollarSign,
  Briefcase, Send, Heart, Eye, Menu, X
} from 'lucide-react';
import { AuthScreen } from './AuthScreen';
import { BusinessOwnerLanding } from './BusinessOwnerLanding';

interface ReviewJob {
  id: string;
  name: string;
  logo: string;
  category: string;
  reward: number;
  time: string;
  desc: string;
  maxSlots?: number;
  slotsRemaining?: number;
  greyed?: boolean;
}

const JOBS_POOL: Omit<ReviewJob, 'slotsRemaining' | 'maxSlots'>[] = [
  { id: 'hj-1', name: 'Alpina Resorts', logo: '🏨', category: 'Hotels', reward: 18, time: '12 mins', desc: 'Review booking clarity, pricing transparency, and loyalty rewards layout.' },
  { id: 'hj-2', name: 'Horizon FX Broker', logo: '📈', category: 'Forex Brokers', reward: 15, time: '10 mins', desc: 'Review order execution speed, trading interface, and user verification.' },
  { id: 'hj-3', name: 'AI Copywriter Pro', logo: '🤖', category: 'AI Tools', reward: 20, time: '15 mins', desc: 'Evaluate prompt output quality, response latency, and layout.' },
  { id: 'hj-4', name: 'HostVibe Cloud', logo: '☁️', category: 'Hosting Providers', reward: 12, time: '5 mins', desc: 'Test response speeds and provide helpful feedback on our 1-click cloud app installer.' },
  { id: 'hj-5', name: 'Nordic VPN Secure', logo: '🛡️', category: 'VPN Services', reward: 10, time: '6 mins', desc: 'Test and review connection latencies and streaming speed across regions.' },
  { id: 'hj-6', name: 'Apex Analytics SaaS', logo: '📊', category: 'SaaS Companies', reward: 22, time: '18 mins', desc: 'Review the interactive charts, CSV/PDF exporting, and filtering options.' },
  { id: 'hj-7', name: 'Globetrotter Travel', logo: '✈️', category: 'Travel Businesses', reward: 16, time: '8 mins', desc: 'Provide constructive feedback on holiday planner layouts and price comparison tools.' },
  { id: 'hj-8', name: 'Veritas VPN Secure', logo: '🔒', category: 'VPN Services', reward: 11, time: '7 mins', desc: 'Test multi-hop connectivity speeds and leak protection capabilities.' },
  { id: 'hj-9', name: 'QuantFX Trading', logo: '💹', category: 'Forex Brokers', reward: 25, time: '14 mins', desc: 'Test out our web trader charting options and deposit UI layouts.' },
  { id: 'hj-10', name: 'Starlight Stay Suites', logo: '🌟', category: 'Hotels', reward: 19, time: '9 mins', desc: 'Review room customizer UI and billing checkout confirmation speed.' },
  { id: 'hj-11', name: 'WriteAI Assistant', logo: '✏️', category: 'AI Tools', reward: 14, time: '11 mins', desc: 'Verify consistency of content summarizer and formatting output.' }
];

interface Withdrawal {
  id: string;
  initials: string;
  name: string;
  region: string;
  method: string;
  amount: number;
  time: string;
  isNew?: boolean;
}

const INITIAL_WITHDRAWALS: Withdrawal[] = [
  { id: 'w-1', initials: 'JM', name: 'John M.', region: 'Kenya', method: 'M-Pesa', amount: 185, time: '1 minute ago' },
  { id: 'w-2', initials: 'SA', name: 'Sarah A.', region: 'Uganda', method: 'USDT TRC20', amount: 420, time: 'Just now' },
  { id: 'w-3', initials: 'DK', name: 'David K.', region: 'Tanzania', method: 'Bitcoin', amount: 615, time: '4 minutes ago' },
  { id: 'w-4', initials: 'GN', name: 'Grace N.', region: 'Rwanda', method: 'M-Pesa', amount: 298, time: '8 minutes ago' },
  { id: 'w-5', initials: 'EM', name: 'Emmanuel M.', region: 'Kenya', method: 'M-Pesa', amount: 150, time: '12 minutes ago' }
];

const NEW_NAMES_POOL = [
  { initials: 'FO', name: 'Faith O.', region: 'Kenya', method: 'M-Pesa', amountRange: [100, 300] },
  { initials: 'JK', name: 'Joseph K.', region: 'Tanzania', method: 'Bitcoin', amountRange: [200, 650] },
  { initials: 'EN', name: 'Esther N.', region: 'Uganda', method: 'USDT TRC20', amountRange: [150, 450] },
  { initials: 'BM', name: 'Benson M.', region: 'Kenya', method: 'M-Pesa', amountRange: [120, 350] },
  { initials: 'HO', name: 'Halima O.', region: 'Rwanda', method: 'M-Pesa', amountRange: [100, 250] },
  { initials: 'PK', name: 'Philip K.', region: 'Kenya', method: 'M-Pesa', amountRange: [180, 400] },
  { initials: 'AW', name: 'Agnes W.', region: 'Uganda', method: 'USDT TRC20', amountRange: [150, 500] },
  { initials: 'SM', name: 'Samuel M.', region: 'Tanzania', method: 'Bitcoin', amountRange: [220, 600] },
  { initials: 'AL', name: 'Aminata L.', region: 'Nigeria', method: 'USDT TRC20', amountRange: [100, 450] },
  { initials: 'OC', name: 'Obinna C.', region: 'Nigeria', method: 'USDT TRC20', amountRange: [150, 600] }
];

export const LandingPage: React.FC = () => {
  const { login, register, theme } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [targetRole, setTargetRole] = useState<'reviewer' | 'business_owner'>('reviewer');
  const [landingRole, setLandingRole] = useState<'reviewer' | 'business_owner'>('reviewer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Withdrawals feed state
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  
  // Homepage rotating jobs state
  const [homeJobs, setHomeJobs] = useState<ReviewJob[]>([]);

  // Initialize home jobs on mount
  useEffect(() => {
    const shuffled = [...JOBS_POOL].sort(() => 0.5 - Math.random());
    const initial = shuffled.slice(0, 3).map(job => ({
      ...job,
      maxSlots: 25,
      slotsRemaining: Math.floor(Math.random() * 8) + 15, // random 15-22 slots remaining
      greyed: false
    }));
    setHomeJobs(initial);
  }, []);

  // Dynamic slot counter decreaser
  useEffect(() => {
    const interval = setInterval(() => {
      setHomeJobs(prevJobs => {
        if (prevJobs.length === 0) return prevJobs;
        
        // Pick 1 random job to decrement its slot
        const indexToDecrement = Math.floor(Math.random() * prevJobs.length);
        
        return prevJobs.map((job, idx) => {
          if (idx === indexToDecrement && !job.greyed) {
            const decrement = Math.floor(Math.random() * 3) + 1; // decrement by 1, 2, or 3
            const nextSlots = Math.max(0, (job.slotsRemaining || 25) - decrement);
            const isFull = nextSlots === 0;
            return {
              ...job,
              slotsRemaining: nextSlots,
              greyed: isFull
            };
          }
          return job;
        });
      });
    }, 8000); // Check and decrement slots every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Replace completed (greyed) jobs with new ones
  useEffect(() => {
    const checkAndReplace = setInterval(() => {
      setHomeJobs(prevJobs => {
        const fullJob = prevJobs.find(job => job.greyed);
        if (!fullJob) return prevJobs;

        // Find jobs in JOBS_POOL that are NOT currently displayed on the home page
        const currentIds = prevJobs.map(j => j.id);
        const availablePool = JOBS_POOL.filter(p => !currentIds.includes(p.id));
        if (availablePool.length === 0) return prevJobs;

        // Choose one random from available
        const nextRaw = availablePool[Math.floor(Math.random() * availablePool.length)];
        const nextJob: ReviewJob = {
          ...nextRaw,
          maxSlots: 25,
          slotsRemaining: 25, // fresh slots
          greyed: false
        };

        // Replace the first greyed out job we find
        let replaced = false;
        return prevJobs.map(job => {
          if (job.greyed && !replaced) {
            replaced = true;
            return nextJob;
          }
          return job;
        });
      });
    }, 12000);

    return () => clearInterval(checkAndReplace);
  }, []);

  // Completed jobs demo state
  const [completedJobIds, setCompletedJobIds] = useState<string[]>([]);
  const [activeJobForReview, setActiveJobForReview] = useState<ReviewJob | null>(null);
  const [demoReviewText, setDemoReviewText] = useState('');
  const [demoReviewRating, setDemoReviewRating] = useState(5);
  const [demoSubmitSuccess, setDemoSubmitSuccess] = useState(false);

  // FAQ states
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Stats count animation state
  const [reviewsCount, setReviewsCount] = useState(48200);
  const [reviewersCount, setReviewersCount] = useState(9600);
  const [businessesCount, setBusinessesCount] = useState(2400);
  const [satisfactionCount, setSatisfactionCount] = useState(90);

  // Quick Stats Section Ref to simulate viewport trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewsCount(prev => (prev < 50000 ? prev + 37 : 50000));
      setReviewersCount(prev => (prev < 10000 ? prev + 8 : 10000));
      setBusinessesCount(prev => (prev < 2500 ? prev + 2 : 2500));
      setSatisfactionCount(prev => (prev < 95 ? prev + 1 : 95));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const lastChosenNameRef = useRef<string>('');

  // Live Withdrawals dynamic updates (every 20 - 40 seconds)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runUpdate = () => {
      // Pick random details from pool, avoiding consecutive duplicates
      const eligiblePool = NEW_NAMES_POOL.filter(n => n.name !== lastChosenNameRef.current);
      if (eligiblePool.length === 0) return;

      const chosen = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
      lastChosenNameRef.current = chosen.name;

      const randomAmount = Math.floor(
        Math.random() * (chosen.amountRange[1] - chosen.amountRange[0]) + chosen.amountRange[0]
      );
      
      const newWithdrawal: Withdrawal = {
        id: `w-dyn-${Date.now()}`,
        initials: chosen.initials,
        name: chosen.name,
        region: chosen.region,
        method: chosen.method,
        amount: Math.round(randomAmount), // tidy rounded numbers
        time: 'Just now',
        isNew: true
      };

      setWithdrawals(prev => {
        // Shift times of older ones
        const shifted = prev.map((item, idx) => {
          let nextTime = item.time;
          if (idx === 0) nextTime = '1 minute ago';
          else if (idx === 1) nextTime = '3 minutes ago';
          else if (idx === 2) nextTime = '6 minutes ago';
          else if (idx === 3) nextTime = '12 minutes ago';
          else if (idx === 4) nextTime = '20 minutes ago';
          return { ...item, time: nextTime, isNew: false };
        });

        // Prepend new entry, keep max 5
        return [newWithdrawal, ...shifted.slice(0, 4)];
      });

      // Schedule next run between 20 and 40 seconds
      const nextDelay = Math.floor(Math.random() * 20000) + 20000;
      timeoutId = setTimeout(runUpdate, nextDelay);
    };

    // Schedule first run
    const firstDelay = Math.floor(Math.random() * 20000) + 20000;
    timeoutId = setTimeout(runUpdate, firstDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  const triggerAuth = (tab: 'login' | 'register', role: 'reviewer' | 'business_owner') => {
    setAuthTab(tab);
    setTargetRole(role);
    setShowAuthModal(true);
  };

  const handleDemoReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoReviewText.trim()) return;

    if (activeJobForReview) {
      setDemoSubmitSuccess(true);
      setCompletedJobIds(prev => [...prev, activeJobForReview.id]);
      setTimeout(() => {
        setDemoSubmitSuccess(false);
        setActiveJobForReview(null);
        setDemoReviewText('');
      }, 3500);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(prev => (prev === index ? null : index));
  };

  // Scroll to element utility helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const CATEGORIES = [
    { name: 'Hotels & Resorts', icon: Hotel, count: 142 },
    { name: 'Forex Brokers', icon: TrendingUp, count: 89 },
    { name: 'AI Tools', icon: Sparkles, count: 215 },
    { name: 'VPN Services', icon: Shield, count: 73 },
    { name: 'Hosting Providers', icon: Server, count: 64 },
    { name: 'Financial Services', icon: Coins, count: 112 },
    { name: 'Education Platforms', icon: BookOpen, count: 95 },
    { name: 'Travel Companies', icon: Compass, count: 81 },
    { name: 'SaaS Platforms', icon: Layers, count: 178 },
    { name: 'E-commerce Businesses', icon: ShoppingBag, count: 194 }
  ];

  const FAQS = [
    {
      q: 'How do review jobs work?',
      a: 'Businesses launch campaigns on ReviewNest, specifying their target audience and feedback guidelines. Reviewers select available jobs, experience the product or service, write a genuine, detailed feedback review, and submit it for validation. Once approved, the reward is instantly credited to their wallet.'
    },
    {
      q: 'How are rewards calculated?',
      a: 'Rewards are determined by the campaign budget, the complexity of the task, and the reviewer\'s account level. High-tier campaigns requiring detailed testing or professional feedback offer higher rewards ranging from $10 to $22 per review.'
    },
    {
      q: 'How long do withdrawals take?',
      a: 'Reviewer withdrawals are processed daily. M-Pesa withdrawals across East Africa are cleared swiftly, and other methods (USDT TRC20 or Bank Transfer) usually settle within 2 to 24 hours of requesting, subject to automated compliance checks.'
    },
    {
      q: 'Can I review the same business twice?',
      a: 'To maintain platform integrity and genuine customer feedback, reviewers are permitted to complete only one review task per business campaign. Fresh business campaigns are added daily, providing endless new opportunities.'
    },
    {
      q: 'How do businesses launch campaigns?',
      a: 'Businesses can sign up for a Business Account, select a campaign package or deposit a custom balance, define their guidelines, and launch their review task to our community of 10,000+ active reviewers.'
    },
    {
      q: 'How are reviews moderated?',
      a: 'Our Zero-Trust moderation engine and AI filters verify every submission to ensure they are genuine, comprehensive, and adhere to community guidelines. Plagiarism, spam, or low-effort reviews are automatically rejected to protect business campaign quality.'
    }
  ];

  return (
    <div id="landing-root" className="min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans antialiased overflow-x-hidden selection:bg-[#FF4FA3]/20 selection:text-[#FF4FA3]">
      
      {/* STICKY NAVBAR */}
      <nav id="sticky-navbar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div id="nav-logo" className="flex items-center cursor-pointer" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setLandingRole('reviewer'); setMobileMenuOpen(false); }}>
              <img 
                src="https://i.postimg.cc/fWtwN1jH/f22474d7-7c99-495b-b812-bf5cb30e30bd.jpg" 
                alt="ReviewNest Logo" 
                className="h-12 sm:h-15 w-auto object-contain transition-transform hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Desktop Center Navigation Links */}
            <div id="nav-center-menu" className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <button id="nav-link-home" onClick={() => { setLandingRole('reviewer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">Home</button>
              <button id="nav-link-jobs" onClick={() => { setLandingRole('reviewer'); triggerAuth('login', 'reviewer'); }} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">Review Jobs</button>
              <button id="nav-link-categories" onClick={() => { setLandingRole('reviewer'); scrollToSection('categories-section'); }} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">Categories</button>
              <button id="nav-link-businesses" onClick={() => { setLandingRole('business_owner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">Businesses</button>
              <button id="nav-link-how" onClick={() => { if (landingRole === 'reviewer') { scrollToSection('how-it-works-section'); } else { scrollToSection('biz-how-it-works'); } }} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">How It Works</button>
              <button id="nav-link-faq" onClick={() => scrollToSection('faq-section')} className="hover:text-[#FF4FA3] transition-colors cursor-pointer">FAQ</button>
            </div>

            {/* Right Buttons */}
            <div id="nav-right-actions" className="flex items-center gap-3">
              <button 
                id="nav-btn-login"
                onClick={() => triggerAuth('login', 'reviewer')}
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#FF4FA3] transition-all cursor-pointer hidden sm:block"
              >
                Login
              </button>
              <button 
                id="nav-btn-register"
                onClick={() => triggerAuth('register', 'reviewer')}
                className="px-5 py-2.5 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white text-sm font-black rounded-xl shadow-md shadow-[#FF4FA3]/15 transition-all hover:scale-102 active:scale-98 cursor-pointer hidden sm:block"
              >
                Register
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 transition-all focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer / Panel */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-panel" className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md animate-fade-in">
            <div className="px-4 pt-3 pb-6 space-y-1 text-left">
              <button 
                id="mobile-link-home"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-extrabold text-slate-800 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Home
              </button>
              <button 
                id="mobile-link-jobs"
                onClick={() => {
                  triggerAuth('login', 'reviewer');
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Review Jobs
              </button>
              <button 
                id="mobile-link-categories"
                onClick={() => {
                  scrollToSection('categories-section');
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Categories
              </button>
              <button 
                id="mobile-link-businesses"
                onClick={() => {
                  scrollToSection('why-businesses-section');
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Businesses
              </button>
              <button 
                id="mobile-link-how"
                onClick={() => {
                  scrollToSection('how-it-works-section');
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                How It Works
              </button>
              <button 
                id="mobile-link-faq"
                onClick={() => {
                  scrollToSection('faq-section');
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#FF4FA3] hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                FAQ
              </button>

              {/* Login and Register in Mobile Panel */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <button
                  id="mobile-btn-login"
                  onClick={() => {
                    triggerAuth('login', 'reviewer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Login to Account
                </button>
                <button
                  id="mobile-btn-register"
                  onClick={() => {
                    triggerAuth('register', 'reviewer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-center text-sm font-black text-white bg-[#FF4FA3] hover:bg-[#e03e8a] rounded-xl shadow-md shadow-[#FF4FA3]/15 transition-all cursor-pointer"
                >
                  Register as Reviewer
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* PLATFORM ROLE SELECTOR TOGGLE BAR */}
      <div className="bg-white border-b border-slate-100 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="inline-flex p-1 bg-slate-100 border border-slate-200/40 rounded-xl">
            <button
              onClick={() => { setLandingRole('reviewer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                landingRole === 'reviewer'
                  ? 'bg-white text-indigo-600 shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              For Reviewers (Earn Rewards)
            </button>
            <button
              onClick={() => { setLandingRole('business_owner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                landingRole === 'business_owner'
                  ? 'bg-white text-[#FF4FA3] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              For Businesses (Launch Campaigns)
            </button>
          </div>
        </div>
      </div>

      {landingRole === 'reviewer' ? (
        <>
          {/* HERO SECTION */}
      <section id="hero-section" className="relative pt-12 pb-20 sm:pb-32 overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC]">
        {/* Abstract background blobs for high SaaS style */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#FF4FA3]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-blue-400/5 rounded-full blur-2xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Text */}
            <div id="hero-text-container" className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF4FA3]/10 border border-[#FF4FA3]/20 rounded-full text-[#FF4FA3] text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" /> Verified Marketplace
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Earn Rewards by <br className="hidden sm:block" />
                Reviewing <span className="text-[#FF4FA3] relative">Real Businesses</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Join thousands of reviewers helping businesses improve through valuable feedback while earning rewards for every completed review.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  id="hero-btn-start"
                  onClick={() => triggerAuth('register', 'reviewer')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white font-black rounded-xl shadow-lg shadow-[#FF4FA3]/20 transition-all hover:scale-103 active:scale-97 cursor-pointer flex items-center justify-center gap-2 text-base"
                >
                  Start Reviewing <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  id="hero-btn-browse"
                  onClick={() => triggerAuth('login', 'reviewer')}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 text-base"
                >
                  Browse Jobs
                </button>
              </div>

              {/* Floating Stat badging in Hero */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
                <div id="stat-card-completed" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="block text-xl font-extrabold text-slate-900 font-mono">50,000+</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reviews Done</span>
                </div>
                <div id="stat-card-reviewers" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="block text-xl font-extrabold text-slate-900 font-mono">10,000+</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Users</span>
                </div>
                <div id="stat-card-businesses" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="block text-xl font-extrabold text-slate-900 font-mono">2,500+</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Brands listed</span>
                </div>
                <div id="stat-card-rewards" className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="block text-xl font-extrabold text-slate-900 font-mono font-bold text-[#22C55E]">$500K+</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rewards Paid</span>
                </div>
              </div>
            </div>

            {/* Hero CSS Illustration - Clean, interactive browser mockup with responsive charts */}
            <div id="hero-illustration-container" className="lg:col-span-6 relative flex justify-center">
              <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 sm:p-6 space-y-4 relative hover:shadow-3xl transition-shadow duration-300">
                
                {/* Browser top-bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 block"></span>
                  </div>
                  <div className="bg-slate-50 text-[10px] font-semibold text-slate-400 px-6 py-1 rounded-md font-mono border border-slate-100">
                    reviewnest.pro/dashboard
                  </div>
                  <div className="text-slate-300">
                    <Laptop className="w-4 h-4" />
                  </div>
                </div>

                {/* Dashboard layout simulator */}
                <div className="space-y-4">
                  {/* Dashboard stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-50 text-left">
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold font-mono">Total Earnings</span>
                      <span className="text-sm font-black font-mono text-slate-800">$542.50</span>
                    </div>
                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-50 text-left">
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold font-mono">Reviews Active</span>
                      <span className="text-sm font-black font-mono text-slate-800">12 Pending</span>
                    </div>
                    <div className="bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 text-left">
                      <span className="text-[8px] text-emerald-600 uppercase tracking-wider block font-bold font-mono">Approval Rate</span>
                      <span className="text-sm font-black font-mono text-[#22C55E]">98.4%</span>
                    </div>
                  </div>

                  {/* Active review items feed representation */}
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Feedback Campaigns</span>
                    
                    {/* Item 1 */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FF4FA3]/10 flex items-center justify-center font-bold text-xs text-[#FF4FA3]">
                          HV
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">HostVibe Cloud Review</h4>
                          <span className="text-[9px] text-slate-400 font-medium">Earn $10.00 • Est. 5 mins</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#FF4FA3]/10 text-[#FF4FA3] text-[9px] font-black rounded-lg uppercase tracking-wider">
                        $10.00 Reward
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-xs opacity-75">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-500">
                          NV
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Nordic VPN Review</h4>
                          <span className="text-[9px] text-slate-400 font-medium">Earn $12.00 • Est. 6 mins</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#FF4FA3]/10 text-[#FF4FA3] text-[9px] font-black rounded-lg uppercase tracking-wider">
                        $12.00 Reward
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars graphic decoration */}
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold text-slate-700 ml-1">4.9/5 Average Campaign rating</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold font-mono">152k total stars</span>
                  </div>
                </div>

                {/* Overlapping Floating Stats Card (simulating mobile device mockup overlay) */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-48 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl text-left hidden sm:block animate-bounce" style={{ animationDuration: '6s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Mobile App ready</span>
                      <span className="text-[10px] font-black text-slate-800">Secure Wallet v2</span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-center">
                    <span className="text-[9px] text-slate-400 block">Payout Completed</span>
                    <strong className="text-[#22C55E] text-xs font-mono font-extrabold">+22,450 KES</strong>
                  </div>
                </div>

                {/* Floating reviews circle */}
                <div className="absolute -top-6 -right-6 bg-[#FF4FA3] text-white rounded-full p-3 shadow-lg hidden sm:flex flex-col items-center justify-center w-14 h-14 font-mono font-black text-[10px]">
                  <span>LIVE</span>
                  <span>FEED</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LATEST REVIEW OPPORTUNITIES SECTION */}
      <section id="latest-review-opportunities-section" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> Active Marketplace
                </span>
                <span className="text-xs text-slate-400 font-bold font-mono">Live Rotations</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Latest Review Opportunities</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time review tasks currently being completed by certified regional partners. Sign up to participate.
              </p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50 block text-left sm:inline-block">
              ⚡ Real-time Campaign Updates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeJobs.map((job) => {
              return (
                <div
                  key={job.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-500 relative text-left ${
                    job.greyed
                      ? 'bg-slate-50 border-slate-200/60 opacity-60 grayscale'
                      : 'bg-white border-slate-200/80 hover:border-indigo-500/40 hover:shadow-md'
                  }`}
                >
                  {job.greyed && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center bg-rose-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Campaign Full
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/50">
                        {job.logo}
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Reward</span>
                        <span className="text-base font-black text-indigo-600 font-mono">
                          ${job.reward.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{job.name}</h4>
                      <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-[8px] text-slate-500 rounded font-semibold tracking-wide mt-1">
                        {job.category}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {job.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-400">
                      <div className="flex justify-between font-mono">
                        <span>Duration:</span>
                        <span className="font-semibold text-slate-600">{job.time}</span>
                      </div>
                      <div className="flex justify-between items-center font-mono">
                        <span>Quota Left:</span>
                        <span className={`font-semibold ${job.greyed ? 'text-rose-500 font-bold animate-pulse' : 'text-slate-600'}`}>
                          {job.slotsRemaining} / {job.maxSlots} slots
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={job.greyed}
                      onClick={() => triggerAuth('login', 'reviewer')}
                      className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        job.greyed
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {job.greyed ? '0 Slots Remaining' : 'Start Review'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEADING RECENT WITHDRAWALS FROM YOUR REGION SECTION */}
      <section id="live-withdrawals-section" className="py-16 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-left">
          
          {/* Header of recent withdrawals widget */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Payouts
              </span>
              <span className="text-xs text-slate-400 font-bold font-mono">Verified Activity</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Leading Recent Withdrawals From Your Region</h2>
            <p className="text-xs text-slate-500 mt-1">
              See the latest successful reviewer payouts in your region. Activity updates automatically throughout the day.
            </p>
          </div>

          {/* Main fintech-inspired list card */}
          <div id="live-withdrawals-card" className="bg-white rounded-2xl border border-slate-100 shadow-md divide-y divide-slate-50 overflow-hidden transition-all duration-300">
            {withdrawals.map((w, idx) => (
              <div 
                key={w.id}
                id={`withdrawal-item-${idx}`}
                className={`flex items-center justify-between p-4 sm:p-5 transition-all duration-700 ${
                  w.isNew 
                    ? 'bg-emerald-50/40 border-l-4 border-emerald-500 translate-y-0 opacity-100' 
                    : 'bg-white opacity-100'
                }`}
              >
                {/* Left side info */}
                <div className="flex items-center gap-3">
                  {/* Colored Circle Initials */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                    idx === 0 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : idx === 1 
                      ? 'bg-[#FF4FA3]/10 text-[#FF4FA3]' 
                      : idx === 2 
                      ? 'bg-blue-100 text-blue-600' 
                      : idx === 3 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {w.initials}
                  </div>
                  
                  {/* Name and validation check */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {w.name}
                      <span className="text-[10px] font-normal text-slate-400 font-sans">• {w.region}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{w.time}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">Verified payout network</span>
                    </div>
                  </div>
                </div>

                {/* Right side Amount */}
                <div className="text-right">
                  <span className="block text-sm sm:text-base font-black font-mono text-emerald-600">
                    Withdrawn ${w.amount.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5 font-mono">
                    {w.method}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* M-Pesa/USDT note and important promotion statement */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 px-2 leading-relaxed">
            <span className="font-mono">
              💡 Automated instant payouts available via local mobile wallets (M-Pesa, USDT, Bitcoin) across regions.
            </span>
            <span className="text-slate-400/80 font-light text-center sm:text-right">
              Important: Activity feed simulates verified payout metrics in real time.
            </span>
          </div>

        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section id="categories-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Opportunities by Niche</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Popular Review Categories
            </h2>
            <p className="text-sm text-slate-500 font-normal leading-relaxed">
              Explore diverse campaigns matching your area of interest. Higher activity brings more review tasks daily.
            </p>
          </div>

          {/* Bento layout Grid of Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <div 
                  key={cat.name}
                  id={`category-card-${idx}`}
                  onClick={() => triggerAuth('login', 'reviewer')}
                  className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-[#FF4FA3]/20 hover:bg-[#FF4FA3]/5 hover:shadow-md transition-all duration-300 text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto shadow-xs text-slate-700 group-hover:text-[#FF4FA3] group-hover:scale-105 transition-all">
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 mt-4 leading-tight group-hover:text-slate-950 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#FF4FA3] bg-[#FF4FA3]/10 px-2 py-0.5 rounded-full inline-block mt-2 font-mono">
                    {cat.count} Available Jobs
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works-section" className="py-20 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Workflow Transparency</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How ReviewNest Works
            </h2>
            <p className="text-sm text-slate-500 font-normal leading-relaxed">
              Our professional SaaS system coordinates escrow payouts securely between business campaigns and reviewers.
            </p>
          </div>

          {/* Timeline workflow layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Timeline connector line for desktop */}
            <div className="hidden md:block absolute top-10 left-1/10 right-1/10 h-0.5 bg-slate-200 -z-0"></div>

            {/* Step 1 */}
            <div id="step-card-1" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative z-10 text-center space-y-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-mono font-black text-sm mx-auto shadow-md">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Create Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Sign up as a reviewer or business owner securely. Verify your profile to enter the marketplace.
              </p>
            </div>

            {/* Step 2 */}
            <div id="step-card-2" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative z-10 text-center space-y-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-mono font-black text-sm mx-auto shadow-md">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Choose Review Jobs</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Browse through featured live opportunities. Pick matching niches suited to your expertise.
              </p>
            </div>

            {/* Step 3 */}
            <div id="step-card-3" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative z-10 text-center space-y-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-mono font-black text-sm mx-auto shadow-md">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Submit Feedback</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Write structured, helpful, and genuine reviews of the software or business platform to qualify.
              </p>
            </div>

            {/* Step 4 */}
            <div id="step-card-4" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative z-10 text-center space-y-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-mono font-black text-sm mx-auto shadow-md">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Earn Rewards</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Get compensated instantly into your secure wallet once the moderation engine validates your task.
              </p>
            </div>

            {/* Step 5 */}
            <div id="step-card-5" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative z-10 text-center space-y-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-mono font-black text-sm mx-auto shadow-md">
                5
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Withdraw Earnings</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Request standard lightning-fast payouts directly to your local M-Pesa or alternative gateways.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED REVIEW OPPORTUNITIES REMOVED - JOBS ACCESSIBLE IN THE REVIEWER WORKSPACE */}

      {/* WHY REVIEWERS CHOOSE US */}
      <section id="why-reviewers-section" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Reviewer Benefits</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Why Reviewers <br />Choose Us
              </h2>
              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                ReviewNest is constructed from the ground up to guarantee a reliable, secure environment for creators to monetize their testing inputs.
              </p>
              
              <div className="pt-2">
                <button 
                  id="why-reviewer-btn-action"
                  onClick={() => triggerAuth('register', 'reviewer')}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs"
                >
                  Create Reviewer Account <ArrowRight className="w-3.5 h-3.5 text-[#FF4FA3]" />
                </button>
              </div>
            </div>

            {/* Right side cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div id="rev-benefit-card-1" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#FF4FA3]/10 text-[#FF4FA3] flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">High-Paying Review Jobs</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Earn premium competitive reward structures from established SaaS, travel, and financial platform campaigns.
                </p>
              </div>

              <div id="rev-benefit-card-2" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">New Jobs Daily</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Fresh campaign budget allocations and feedback opportunities are listed constantly across various categories.
                </p>
              </div>

              <div id="rev-benefit-card-3" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Simple Dashboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Track approved feedback status, review logs, and wallet balances easily in our beautiful lightweight platform.
                </p>
              </div>

              <div id="rev-benefit-card-4" className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center font-bold">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Fast Withdrawals</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Request payouts securely directly from your reviewer wallet with robust safety mechanisms.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* WHY BUSINESSES CHOOSE US */}
      <section id="why-businesses-section" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 order-2 lg:order-1">
              
              <div id="biz-benefit-card-1" className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#FF4FA3]/10 text-[#FF4FA3] flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Genuine Customer Insights</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Access rich, qualitative feedback drafts detailing user pain points and feature satisfaction scores.
                </p>
              </div>

              <div id="biz-benefit-card-2" className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Detailed Feedback Reports</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Download structured response grids and review datasets to distribute across product development groups.
                </p>
              </div>

              <div id="biz-benefit-card-3" className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Campaign Analytics</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Monitor submission speed, rating dispersion metrics, and wallet balances in real-time.
                </p>
              </div>

              <div id="biz-benefit-card-4" className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Flexible Review Packages</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Align review targets precisely with budget lines. Scale campaigns seamlessly as validation ticks off.
                </p>
              </div>

            </div>

            {/* Right side info */}
            <div className="lg:col-span-5 space-y-6 text-left order-1 lg:order-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Enterprise Quality</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Why Businesses <br />Choose Us
              </h2>
              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                Unlock direct customer research loops. Gather high-density insights from thousands of testers across various categories.
              </p>
              
              <div className="pt-2">
                <button 
                  id="why-biz-btn-action"
                  onClick={() => triggerAuth('register', 'business_owner')}
                  className="px-6 py-3 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white font-black rounded-xl shadow-md shadow-[#FF4FA3]/15 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs"
                >
                  Create Business Account <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS */}
      <section id="statistics-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div id="stats-item-submitted" className="space-y-2">
              <span className="block text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                {reviewsCount.toLocaleString()}+
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Reviews Submitted
              </span>
            </div>

            <div id="stats-item-active" className="space-y-2">
              <span className="block text-4xl sm:text-5xl font-black text-[#FF4FA3] tracking-tight font-mono">
                {reviewersCount.toLocaleString()}+
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Active Reviewers
              </span>
            </div>

            <div id="stats-item-brands" className="space-y-2">
              <span className="block text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                {businessesCount.toLocaleString()}+
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Businesses Listed
              </span>
            </div>

            <div id="stats-item-[#22C55E]" className="space-y-2">
              <span className="block text-4xl sm:text-5xl font-black text-[#22C55E] tracking-tight font-mono">
                {satisfactionCount}%
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Satisfaction Rate
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* SUCCESS STORIES (TESTIMONIALS) */}
      <section id="testimonials-section" className="py-20 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Trust Validation</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Success Stories
            </h2>
            <p className="text-sm text-slate-500 font-normal leading-relaxed">
              Hear what our active reviewer community and verified campaign partners say about ReviewNest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Story 1 */}
            <div id="testimonial-card-1" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic font-light">
                  "I started testing software on ReviewNest last month. The payout request system is incredibly simple, and I\'ve successfully withdrawn over 18,000 KES directly to my M-Pesa. It\'s a genuine way to earn for real feedback!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  AW
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Agnes Wambui</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Verified Reviewer</span>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div id="testimonial-card-2" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic font-light">
                  "ReviewNest has changed how we collect customer insights. Instead of spamming email surveys, we get comprehensive user reviews from qualified testers. The integration was painless."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="w-9 h-9 rounded-full bg-[#FF4FA3]/10 text-[#FF4FA3] flex items-center justify-center font-bold text-xs">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">David Kiptoo</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Startup Founder</span>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div id="testimonial-card-3" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic font-light">
                  "Managing feedback campaigns used to be a logistics nightmare. This platform handles validation, compliance, and instant payouts automatically, giving us premium product reports."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  JK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Joseph Karanja</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Business Owner</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section id="business-cta-section" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-[#FF4FA3] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl text-center md:text-left md:flex md:items-center md:justify-between gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="space-y-4 max-w-2xl relative z-10">
              <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-3 py-1 rounded-md inline-block">
                For Brands & Developers
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Need More Reviews For Your Business?
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
                Launch a review campaign and start receiving valuable customer feedback from our reviewer community.
              </p>
            </div>

            <div className="mt-8 md:mt-0 flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
              <button 
                id="biz-cta-btn-create"
                onClick={() => triggerAuth('register', 'business_owner')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-[#FF4FA3] font-black rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                Create Campaign
              </button>
              <button 
                id="biz-cta-btn-sales"
                onClick={() => triggerAuth('login', 'business_owner')}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-bold border border-white/30 rounded-xl transition-all cursor-pointer text-xs"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION DESIGN) */}
      <section id="faq-section" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="space-y-3 mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Knowledge Base</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Quick answers about campaigns, compliance, M-Pesa payouts, and review requirements.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div 
                  key={idx}
                  id={`faq-item-${idx}`}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs text-left"
                >
                  <button
                    id={`faq-trigger-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 sm:py-5 flex items-center justify-between text-slate-850 font-bold text-xs sm:text-sm hover:text-[#FF4FA3] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#FF4FA3]' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div id={`faq-content-${idx}`} className="px-5 pb-5 text-xs text-slate-500 leading-relaxed font-light border-t border-slate-50 pt-4 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section id="final-cta-section" className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Instant Entry</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Start Earning Through Reviews Today
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-normal leading-relaxed">
            Join ReviewNest and discover rewarding review opportunities from businesses around the world.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="final-cta-btn-reviewer"
              onClick={() => triggerAuth('register', 'reviewer')}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white font-black rounded-xl shadow-lg shadow-[#FF4FA3]/25 transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
              Start Reviewing
            </button>
            <button
              id="final-cta-btn-biz"
              onClick={() => triggerAuth('register', 'business_owner')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-xl shadow-sm transition-all text-sm cursor-pointer"
            >
              Create Business Campaign
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="premium-footer" className="bg-[#F8FAFC] border-t border-slate-200/60 py-12 sm:py-16 text-xs text-slate-500 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Logo column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center">
                <img 
                  src="https://i.postimg.cc/fWtwN1jH/f22474d7-7c99-495b-b812-bf5cb30e30bd.jpg" 
                  alt="ReviewNest Logo" 
                  className="h-12 sm:h-15 w-auto object-contain transition-transform hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-xs">
                The leading enterprise-grade business review marketplace. Connect, test, evaluate, and earn securely.
              </p>
              <div className="flex items-center gap-3 pt-2 text-slate-400">
                {/* Social media icons simulation */}
                <button id="social-twitter" className="hover:text-[#FF4FA3] transition-colors"><Heart className="w-4 h-4" /></button>
                <button id="social-github" className="hover:text-[#FF4FA3] transition-colors"><Sparkles className="w-4 h-4" /></button>
                <button id="social-discord" className="hover:text-[#FF4FA3] transition-colors"><Shield className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] font-mono">Company</h4>
              <ul className="space-y-2 font-light">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#FF4FA3] transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('faq-section')} className="hover:text-[#FF4FA3] transition-colors">Contact</button></li>
                <li><span className="text-slate-400">Careers (We're hiring)</span></li>
              </ul>
            </div>

            {/* Column 3: Reviewers */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] font-mono">Reviewers</h4>
              <ul className="space-y-2 font-light">
                <li><button onClick={() => scrollToSection('featured-opportunities-section')} className="hover:text-[#FF4FA3] transition-colors">Review Jobs</button></li>
                <li><button onClick={() => triggerAuth('login', 'reviewer')} className="hover:text-[#FF4FA3] transition-colors">Earnings</button></li>
                <li><button onClick={() => triggerAuth('login', 'reviewer')} className="hover:text-[#FF4FA3] transition-colors">Withdrawals</button></li>
              </ul>
            </div>

            {/* Column 4: Businesses */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] font-mono">Businesses</h4>
              <ul className="space-y-2 font-light">
                <li><button onClick={() => triggerAuth('register', 'business_owner')} className="hover:text-[#FF4FA3] transition-colors">Campaigns</button></li>
                <li><button onClick={() => triggerAuth('register', 'business_owner')} className="hover:text-[#FF4FA3] transition-colors">Pricing</button></li>
                <li><button onClick={() => triggerAuth('register', 'business_owner')} className="hover:text-[#FF4FA3] transition-colors">Analytics</button></li>
              </ul>
            </div>

          </div>

          {/* Bottom line */}
          <div className="border-t border-slate-200/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 font-mono text-[10px]">
            <span>© 2026 ReviewNest Ledger System. All rights reserved.</span>
            <div className="flex gap-4">
              <button className="hover:text-[#FF4FA3]">Terms of Service</button>
              <button className="hover:text-[#FF4FA3]">Privacy Policy</button>
              <button className="hover:text-[#FF4FA3]">Community Guidelines</button>
            </div>
          </div>

        </div>
      </footer>
        </>
      ) : (
        <BusinessOwnerLanding />
      )}

      {/* AUTH SCREEN LIGHT THEME OVERLAY MODAL */}
      {showAuthModal && (
        <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setShowAuthModal(false)}></div>
          
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative z-10 text-left my-8">
            
            {/* Close Button */}
            <button 
              id="close-auth-modal"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Embed AuthScreen directly */}
            <div className="space-y-4">
              
              {/* Select target role before login/register inside modal */}
              <div className="flex justify-center mb-1">
                <div className="inline-flex p-1 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold">
                  <button
                    id="role-tab-reviewer"
                    onClick={() => setTargetRole('reviewer')}
                    className={`px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      targetRole === 'reviewer'
                        ? 'bg-white text-[#FF4FA3] shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Reviewer Account
                  </button>
                  <button
                    id="role-tab-biz"
                    onClick={() => setTargetRole('business_owner')}
                    className={`px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      targetRole === 'business_owner'
                        ? 'bg-white text-[#FF4FA3] shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Business Account
                  </button>
                </div>
              </div>

              {/* Embed default AuthScreen */}
              <AuthScreen isEmbedded={true} initialTab={authTab} forcedRole={targetRole} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
