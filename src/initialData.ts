import { User, Business, Campaign, ReviewJob, WithdrawalRequest } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    fullName: 'Alex Morgan',
    email: 'admin@reviewhub.pro',
    role: 'admin',
    country: 'United States',
    phoneNumber: '+1 (555) 019-2831',
    balance: 1450.00,
    totalEarnings: 8230.00,
    completedReviewsCount: 0,
    pendingWithdrawalsCount: 0,
    accountLevel: 'Level 5',
    verified: true,
    twoFactorEnabled: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'u-reviewer-1',
    fullName: 'Sarah Jenkins',
    email: 'reviewer@reviewhub.pro',
    role: 'reviewer',
    country: 'United Kingdom',
    phoneNumber: '+44 7911 123456',
    balance: 125.50,
    totalEarnings: 980.00,
    completedReviewsCount: 24,
    pendingWithdrawalsCount: 1,
    accountLevel: 'Level 2',
    verified: true,
    twoFactorEnabled: false,
    createdAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'u-owner-1',
    fullName: 'David Chen',
    email: 'owner@reviewhub.pro',
    role: 'business_owner',
    country: 'Canada',
    phoneNumber: '+1 (604) 555-0144',
    balance: 1250.00, // starting balance for campaigns
    totalEarnings: 0,
    completedReviewsCount: 0,
    pendingWithdrawalsCount: 0,
    accountLevel: 'Level 1',
    verified: true,
    twoFactorEnabled: false,
    createdAt: '2026-03-01T09:15:00Z'
  }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'b-1',
    name: 'Sip & Byte Cafe',
    category: 'Food & Beverage',
    website: 'https://sipandbyte.cafe',
    description: 'A cozy, tech-themed coffee shop serving premium artisanal espresso, homemade pastries, and offering ultra-fast gigabit internet. Perfect for developers, remote workers, and creative thinkers.',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-03-02T10:00:00Z'
  },
  {
    id: 'b-2',
    name: 'Apex Fitness Center',
    category: 'Health & Wellness',
    website: 'https://apexfitness.fit',
    description: 'A premium, state-of-the-art gym equipped with biometric tracking, top-tier strength machines, an Olympic-size pool, and professional coaching staff dedicated to helping you scale your physical peak.',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-03-05T11:20:00Z'
  },
  {
    id: 'b-3',
    name: 'Azure Sands Resort',
    category: 'Hotels & Resorts',
    website: 'https://azuresands.com',
    description: 'A five-star beachfront luxury oasis featuring private bungalows, high-end fine dining, wellness spas, and personalized butler service overlooking crystal blue lagoons.',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-03-10T14:00:00Z'
  },
  {
    id: 'b-4',
    name: 'Alpha FX Brokerage',
    category: 'Forex Brokers',
    website: 'https://alphafx.co',
    description: 'A globally regulated forex broker providing institutional spreads, zero commissions on major pairs, ultra-low latency server execution, and state-of-the-art analytical terminals.',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-03-15T09:00:00Z'
  },
  {
    id: 'b-5',
    name: 'Summit Prop Traders',
    category: 'Prop Firms',
    website: 'https://summitprop.io',
    description: 'Empowering retail traders worldwide with up to $200,000 in funded accounts. Gain a 90% profit split while enjoying realistic, flexible rules with zero daily drawdown constraints.',
    logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-03-20T10:30:00Z'
  },
  {
    id: 'b-6',
    name: 'Synapse Engine',
    category: 'AI Tools',
    website: 'https://synapse.ai',
    description: 'An advanced multi-modal generative AI workspace that produces flawless copy, bespoke graphic illustrations, and optimized codebase modules from natural language instructions.',
    logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-04-01T11:00:00Z'
  },
  {
    id: 'b-7',
    name: 'Fortress VPN',
    category: 'VPN Services',
    website: 'https://fortressvpn.net',
    description: 'Secure your digital life with enterprise grade AES-256 encryption. We feature a strict no-logs policy, dedicated streaming ips, and over 5,000 high speed servers across 90 countries.',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-04-10T16:00:00Z'
  },
  {
    id: 'b-8',
    name: 'HostFlow Cloud',
    category: 'Hosting Providers',
    website: 'https://hostflow.io',
    description: 'Modern, containerized cloud hosting designed for static applications and microservices. Includes free dynamic SSL, instant worldwide Edge caching, and automated backups.',
    logoUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-04-20T15:20:00Z'
  },
  {
    id: 'b-9',
    name: 'Academix Learning',
    category: 'Education Platforms',
    website: 'https://academix.edu',
    description: 'An immersive digital learning environment packed with gamified programming labs, live peer reviews, structured full-stack modules, and industry career coaching pathways.',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60',
    ownerId: 'u-owner-1',
    status: 'approved',
    createdAt: '2026-05-01T08:30:00Z'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-1',
    businessId: 'b-1',
    businessName: 'Sip & Byte Cafe',
    category: 'Food & Beverage',
    description: 'We need high-quality, authentic feedback regarding our remote-working setup and internet speed. Please focus on coffee selection and the overall workspace ambiance.',
    reviewsNeeded: 10,
    reviewsCompleted: 4,
    rewardPerReview: 10.00,
    status: 'active',
    totalBudget: 100.00,
    createdAt: '2026-03-03T08:00:00Z'
  },
  {
    id: 'c-2',
    businessId: 'b-2',
    businessName: 'Apex Fitness Center',
    category: 'Health & Wellness',
    description: 'Seeking objective customer reviews regarding our group classes and locker room facilities. Share your workout experience and coach interaction.',
    reviewsNeeded: 15,
    reviewsCompleted: 3,
    rewardPerReview: 12.00,
    status: 'active',
    totalBudget: 180.00,
    createdAt: '2026-03-06T12:00:00Z'
  },
  {
    id: 'c-3',
    businessId: 'b-3',
    businessName: 'Azure Sands Resort',
    category: 'Hotels & Resorts',
    description: 'Provide an in-depth analysis of our online booking experience, layout, and perceived value. We want honest elite feedback.',
    reviewsNeeded: 10,
    reviewsCompleted: 0,
    rewardPerReview: 22.00, // Premium (Requires Level 3)
    status: 'active',
    totalBudget: 220.00,
    createdAt: '2026-03-11T14:30:00Z'
  },
  {
    id: 'c-4',
    businessId: 'b-4',
    businessName: 'Alpha FX Brokerage',
    category: 'Forex Brokers',
    description: 'Test the transparency of our landing page and registration forms. We want detailed, specific notes on usability.',
    reviewsNeeded: 8,
    reviewsCompleted: 0,
    rewardPerReview: 15.00, // Level 1
    status: 'active',
    totalBudget: 120.00,
    createdAt: '2026-03-16T10:00:00Z'
  },
  {
    id: 'c-5',
    businessId: 'b-5',
    businessName: 'Summit Prop Traders',
    category: 'Prop Firms',
    description: 'Audit our client dashboard portal structure. Does it look professional, and are rules clearly outlined? Write an explicit summary.',
    reviewsNeeded: 12,
    reviewsCompleted: 0,
    rewardPerReview: 18.00, // Requires Level 2
    status: 'active',
    totalBudget: 216.00,
    createdAt: '2026-03-21T11:00:00Z'
  },
  {
    id: 'c-6',
    businessId: 'b-6',
    businessName: 'Synapse Engine',
    category: 'AI Tools',
    description: 'Analyze the speed, formatting, and helpfulness of our landing page. Does it spark interest as an AI suite?',
    reviewsNeeded: 20,
    reviewsCompleted: 0,
    rewardPerReview: 20.00, // Requires Level 3
    status: 'active',
    totalBudget: 400.00,
    createdAt: '2026-04-02T12:00:00Z'
  },
  {
    id: 'c-7',
    businessId: 'b-7',
    businessName: 'Fortress VPN',
    category: 'VPN Services',
    description: 'Review our product features list and user interface screenshots. Does our pitch look compelling and clean?',
    reviewsNeeded: 25,
    reviewsCompleted: 0,
    rewardPerReview: 12.00, // Level 1
    status: 'active',
    totalBudget: 300.00,
    createdAt: '2026-04-11T16:30:00Z'
  },
  {
    id: 'c-8',
    businessId: 'b-8',
    businessName: 'HostFlow Cloud',
    category: 'Hosting Providers',
    description: 'Analyze our edge caching network documentation page. Ensure technical clarity and write a quality review.',
    reviewsNeeded: 15,
    reviewsCompleted: 0,
    rewardPerReview: 15.00, // Level 1
    status: 'active',
    totalBudget: 225.00,
    createdAt: '2026-04-21T15:30:00Z'
  },
  {
    id: 'c-9',
    businessId: 'b-9',
    businessName: 'Academix Learning',
    category: 'Education Platforms',
    description: 'Test our interactive landing page and curriculum overview. Provide extensive advice on what topics sound most exciting.',
    reviewsNeeded: 10,
    reviewsCompleted: 0,
    rewardPerReview: 20.00, // Requires Level 3
    status: 'active',
    totalBudget: 200.00,
    createdAt: '2026-05-02T09:00:00Z'
  }
];

export const INITIAL_REVIEWS: ReviewJob[] = [
  {
    id: 'r-1',
    campaignId: 'c-1',
    reviewerId: 'u-reviewer-1',
    reviewerName: 'Sarah Jenkins',
    businessId: 'b-1',
    businessName: 'Sip & Byte Cafe',
    rating: 5,
    content: 'Hands down the best place to code in the city! The wifi speed was clocked at 850 Mbps sync, and the cold brew was exceptional. Plentiful power outlets under every single table.',
    feedback: 'Keep up the good work. Adding a few more vegan food options would make it flawless!',
    status: 'approved',
    rewardAmount: 10.00,
    submittedAt: '2026-03-04T16:22:00Z',
    approvedAt: '2026-03-04T18:00:00Z'
  },
  {
    id: 'r-2',
    campaignId: 'c-2',
    reviewerId: 'u-reviewer-1',
    reviewerName: 'Sarah Jenkins',
    businessId: 'b-2',
    businessName: 'Apex Fitness Center',
    rating: 4,
    content: 'Fantastic equipment selection and very spacious environment. The staff was incredibly welcoming. Subtracting one star because the sauna was busy during peak hours.',
    feedback: 'The sauna capacity could be improved or a scheduling board could be set up.',
    status: 'approved',
    rewardAmount: 12.00,
    submittedAt: '2026-03-07T14:10:00Z',
    approvedAt: '2026-03-07T16:45:00Z'
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'w-1',
    userId: 'u-reviewer-1',
    userName: 'Sarah Jenkins',
    userEmail: 'reviewer@reviewhub.pro',
    amount: 50.00,
    fee: 6.00,
    amountReceived: 44.00,
    paymentMethod: 'mpesa',
    details: 'M-Pesa registered: Sarah Jenkins (+254 712 345678)',
    status: 'paid',
    requestedAt: '2026-03-10T09:00:00Z'
  },
  {
    id: 'w-2',
    userId: 'u-reviewer-1',
    userName: 'Sarah Jenkins',
    userEmail: 'reviewer@reviewhub.pro',
    amount: 100.00,
    fee: 12.00,
    amountReceived: 88.00,
    paymentMethod: 'bank_transfer',
    details: 'IBAN: GB98 BARC 2020 1234 5678 90',
    status: 'pending',
    requestedAt: '2026-06-23T22:15:00Z'
  }
];
