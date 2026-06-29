import React, { useState } from 'react';
import { useStore } from '../state/StoreContext';
import { 
  Star, CheckCircle, ArrowRight, TrendingUp, Sparkles, 
  Lock, BarChart3, MessageSquare, DollarSign, Briefcase, 
  ShieldCheck, Globe, Phone, Mail, User, Laptop, Smartphone,
  Check, Play, ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const BusinessOwnerLanding: React.FC = () => {
  const { register, login, addBusiness } = useStore();

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('United States');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessCategory, setBusinessCategory] = useState('SaaS Companies');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!businessName || !contactPerson || !businessEmail || !phoneNumber || !businessWebsite || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Business Advertising Policy.');
      return;
    }

    // Call store register
    const successReg = register(
      contactPerson,
      businessEmail,
      'business_owner',
      country,
      phoneNumber
    );

    if (!successReg) {
      setError('An account with this email already exists.');
      return;
    }

    // Login user
    login(businessEmail, 'business_owner');

    // Add business profile
    addBusiness(
      businessName,
      businessCategory,
      businessWebsite,
      `Dedicated campaign for ${businessName}. Discover helpful feedback and grow customer loyalty.`,
      ''
    );

    setSuccess('Business account created successfully! Redirecting to your dashboard...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FBFBFD] text-slate-900 selection:bg-[#FF4FA3]/20 selection:text-[#FF4FA3]">
      
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-20 md:py-28 overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF4FA3]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF4FA3]/10 border border-[#FF4FA3]/20 rounded-full text-[#FF4FA3] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> For Brands, SaaS & Businesses
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Grow Your Business With <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-indigo-600">Authentic reviews</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Launch a review campaign on ReviewNest and receive valuable customer feedback from our global reviewer community. Improve your online reputation, discover customer insights, and build trust with future customers.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => scrollToElement('register-form-section')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white font-black rounded-xl shadow-lg shadow-[#FF4FA3]/20 transition-all hover:scale-103 active:scale-97 cursor-pointer flex items-center justify-center gap-2 text-base"
                >
                  Open Business Account <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollToElement('why-advertise-section')}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 text-base"
                >
                  Learn More
                </button>
              </div>

              {/* Verified Trust Badging */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-6 text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fully Insured Escrow
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Zero-Trust AI Moderated
                </div>
              </div>
            </div>

            {/* Illustration Section (Mock Interactive Dashboard) */}
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative overflow-hidden"
              >
                {/* Dashboard Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-slate-400 font-mono ml-2">https://reviewnest.io/dashboard</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                    SaaS Portal
                  </span>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Reviews</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-extrabold text-slate-800">2,540</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg. Rating</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-lg font-extrabold text-slate-800">4.8</span>
                      <div className="flex text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Ads</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-extrabold text-[#FF4FA3]">12</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                  </div>
                </div>

                {/* Mini Chart Representation */}
                <div className="bg-[#FAF9FF] border border-[#FF4FA3]/10 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-700">Review Inflow Analytics</h4>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">+28% Growth</span>
                  </div>
                  {/* CSS bar charts representing a growth trend */}
                  <div className="h-24 flex items-end justify-between gap-2 pt-4">
                    <div className="bg-indigo-200 w-full rounded-t-lg h-[20%]"></div>
                    <div className="bg-indigo-300 w-full rounded-t-lg h-[35%]"></div>
                    <div className="bg-indigo-400 w-full rounded-t-lg h-[50%]"></div>
                    <div className="bg-[#FF4FA3]/50 w-full rounded-t-lg h-[65%]"></div>
                    <div className="bg-[#FF4FA3]/70 w-full rounded-t-lg h-[80%]"></div>
                    <div className="bg-[#FF4FA3] w-full rounded-t-lg h-[95%] relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        Peak
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Review Stream Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Live Review Stream</h4>
                  
                  <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-xs flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#FF4FA3]/10 text-[#FF4FA3] flex items-center justify-center text-xs font-extrabold">
                      SK
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">Sarah K. (Reviewer)</span>
                        <div className="flex text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        "Apex Fitness has a brilliant onboarding form. The biometric tracker is flawless. Highly recommend!"
                      </p>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-xs flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-extrabold">
                      JM
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">John M. (Reviewer)</span>
                        <div className="flex text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        "Constructive advice: Add social logins to Sip & Byte's loyalty program. Coffee is incredible!"
                      </p>
                    </div>
                  </div>

                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY ADVERTISE WITH REVIEWNEST SECTION */}
      <section id="why-advertise-section" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-3 mb-16 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">
              Advertise With Purpose
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              Why Advertise With ReviewNest?
            </h2>
            <p className="text-sm text-slate-500">
              Get targeted, genuine visual and written feedback from verified users that helps propel your product to the top tier.
            </p>
          </div>

          {/* 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#FF4FA3]/10 text-[#FF4FA3] flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reach Thousands of Active Reviewers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your business with reviewers from around the world who are eager to test your interface, provide thorough writeups, and improve your metrics.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Valuable Customer Feedback</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive detailed reviews, honest scores, and private constructive feedback to understand customer pain points and optimize your digital products.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Increase Brand Visibility</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your business is prominently featured in our busy review marketplace where thousands of reviewers browse campaign listings and learn about new products.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Campaign Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track live campaign performance with detailed real-time statistics, review logs, average ratings charts, and reviewer demographics.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Secure Platform</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our Zero-Trust verification framework and Escrow model ensures campaign quality, transparent payout terms, and protects against plagiarism and bots.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FF4FA3]/30 hover:bg-white transition-all duration-300 text-left space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Easy Campaign Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamlessly launch, pause, scale, and distribute advertising budget allocations. Set exact review criteria and approve payouts in seconds.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="biz-how-it-works" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-3 mb-16 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF4FA3] block">Step-By-Step Guide</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">How It Works For Businesses</h2>
            <p className="text-sm text-slate-500">
              Get from sign-up to valuable user reviews in 6 simple structured milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#FF4FA3] text-white flex items-center justify-center font-black text-sm">1</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Create Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Register your brand profile, contact person info, website address, and category details in minutes.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">2</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Deposit Balance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Deposit the minimum $300 balance using standard crypto addresses or standard manual invoices (Bank Transfer, M-Pesa, PayPal).</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">3</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Create Review Campaign</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Set up requirements, customize maximum slot size, specify rewards per review, and upload brand logos.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left md:mt-4 lg:mt-0">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#FF4FA3]/80 text-white flex items-center justify-center font-black text-sm">4</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Community Browsing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Your campaign becomes visible instantly on the Reviewer dashboard under the respective category.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left md:mt-4 lg:mt-0">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-indigo-600/80 text-white flex items-center justify-center font-black text-sm">5</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Receive Feedback</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Reviewers submit detailed analysis, ratings, and private constructive tips which you inspect live.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative text-left md:mt-4 lg:mt-0">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center font-black text-sm">6</span>
              <h3 className="font-extrabold text-slate-800 text-base mt-2 mb-2">Approve & Settle</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Approve completed reviews to release the escrow rewards, helping reviewers build prestige and rankings.</p>
            </div>
          </div>

        </div>
      </section>

      {/* REGISTRATION FORM SECTION */}
      <section id="register-form-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl">
            
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Open Business Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl mx-auto">
                Join hundreds of successful brands using ReviewNest to supercharge customer satisfaction, gain authentic feedback, and scale visibility.
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 mb-6 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Business Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. Acme SaaS Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Contact Person</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email"
                      placeholder="e.g. advertising@acme.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2831"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Business Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="url"
                      placeholder="e.g. https://acme.com"
                      value={businessWebsite}
                      onChange={(e) => setBusinessWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Business Category</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none"
                    >
                      <option value="SaaS Companies">SaaS Companies</option>
                      <option value="AI Tools">AI Tools</option>
                      <option value="Hotels">Hotels</option>
                      <option value="Forex Brokers">Forex Brokers</option>
                      <option value="Travel Businesses">Travel Businesses</option>
                      <option value="Hosting Providers">Hosting Providers</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Empty block on desktop for aesthetic symmetry */}
                <div className="hidden md:block"></div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#FF4FA3] focus:outline-none focus:ring-1 focus:ring-[#FF4FA3]"
                  />
                </div>

              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 flex items-start gap-3">
                <input 
                  type="checkbox"
                  id="agree-terms-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4.5 h-4.5 text-[#FF4FA3] border-slate-200 rounded-md focus:ring-[#FF4FA3] mt-0.5 cursor-pointer"
                />
                <label htmlFor="agree-terms-checkbox" className="text-[11px] text-slate-500 leading-relaxed cursor-pointer select-none">
                  I agree to the <span className="text-[#FF4FA3] hover:underline font-bold cursor-pointer">Terms of Service</span> and <span className="text-[#FF4FA3] hover:underline font-bold cursor-pointer">Business Advertising Policy</span>.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#FF4FA3] hover:bg-[#e03e8a] text-white font-black rounded-xl shadow-lg shadow-[#FF4FA3]/20 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Create Business Account
                </button>
              </div>

            </form>

          </div>
        </div>
      </section>

    </div>
  );
};
