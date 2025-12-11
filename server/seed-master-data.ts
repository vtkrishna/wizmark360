import { db } from "./db";
import { 
  campaigns, 
  socialPosts, 
  seoAudits, 
  leads, 
  performanceAds, 
  whatsappConversations, 
  linkedinActivities,
  analyticsSnapshots 
} from "@shared/market360-schema";
import { 
  brands,
  contentItems
} from "@shared/schema";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

export async function seedMasterData() {
  console.log("🌱 Seeding production-ready master data...");

  try {
    // ============================================
    // 1. BRANDS - Master Data
    // ============================================
    const defaultUserId = "system";
    
    const brandData = [
      {
        userId: defaultUserId,
        name: "TechVista Solutions",
        description: "Enterprise SaaS platform for digital transformation",
        logo: "https://api.dicebear.com/7.x/shapes/svg?seed=techvista",
        primaryColor: "#4F46E5",
        secondaryColors: ["#818CF8", "#C7D2FE"],
        guidelines: {
          industry: "Technology",
          tier: "enterprise",
          llmEnabled: true,
          dualModelEnabled: true,
          monthlyBudget: 500000,
          languages: ["en", "hi", "ta"],
          website: "https://techvista.example.com"
        },
        status: "active"
      },
      {
        userId: defaultUserId,
        name: "GreenLeaf Organics",
        description: "Organic food and wellness products marketplace",
        logo: "https://api.dicebear.com/7.x/shapes/svg?seed=greenleaf",
        primaryColor: "#059669",
        secondaryColors: ["#34D399", "#A7F3D0"],
        guidelines: {
          industry: "Retail & E-commerce",
          tier: "professional",
          llmEnabled: true,
          dualModelEnabled: false,
          monthlyBudget: 150000,
          languages: ["en", "hi", "bn", "mr"],
          website: "https://greenleaf.example.com"
        },
        status: "active"
      },
      {
        userId: defaultUserId,
        name: "FinSecure Bank",
        description: "Digital-first banking and investment platform",
        logo: "https://api.dicebear.com/7.x/shapes/svg?seed=finsecure",
        primaryColor: "#0369A1",
        secondaryColors: ["#38BDF8", "#BAE6FD"],
        guidelines: {
          industry: "Financial Services",
          tier: "vip",
          llmEnabled: true,
          dualModelEnabled: true,
          monthlyBudget: 1000000,
          languages: ["en", "hi", "ta", "te", "kn", "ml"],
          website: "https://finsecure.example.com"
        },
        status: "active"
      },
      {
        userId: defaultUserId,
        name: "EduSpark Academy",
        description: "Online learning platform for competitive exams",
        logo: "https://api.dicebear.com/7.x/shapes/svg?seed=eduspark",
        primaryColor: "#DC2626",
        secondaryColors: ["#F87171", "#FECACA"],
        guidelines: {
          industry: "Education",
          tier: "professional",
          llmEnabled: true,
          dualModelEnabled: false,
          monthlyBudget: 200000,
          languages: ["en", "hi", "te", "ta", "kn"],
          website: "https://eduspark.example.com"
        },
        status: "active"
      },
      {
        userId: defaultUserId,
        name: "HealthFirst Clinics",
        description: "Multi-specialty healthcare chain with telemedicine",
        logo: "https://api.dicebear.com/7.x/shapes/svg?seed=healthfirst",
        primaryColor: "#7C3AED",
        secondaryColors: ["#A78BFA", "#DDD6FE"],
        guidelines: {
          industry: "Healthcare",
          tier: "enterprise",
          llmEnabled: true,
          dualModelEnabled: true,
          monthlyBudget: 350000,
          languages: ["en", "hi", "mr", "gu", "pa"],
          website: "https://healthfirst.example.com"
        },
        status: "active"
      }
    ];

    console.log("  📦 Inserting brands...");
    const insertedBrands = await db.insert(brands).values(brandData).onConflictDoNothing().returning();
    console.log(`  ✅ Inserted ${insertedBrands.length} brands`);

    // ============================================
    // 2. CAMPAIGNS - Per Vertical
    // ============================================
    const campaignData = [
      // Social Media Campaigns
      { brandId: 1, name: "Diwali 2024 Social Blast", vertical: "social", status: "active", budget: "75000", startDate: daysAgo(30), endDate: daysAgo(-15), config: { platforms: ["instagram", "facebook", "twitter"], targetAudience: "25-45 professionals", objective: "brand_awareness" } },
      { brandId: 1, name: "Product Launch Teaser", vertical: "social", status: "completed", budget: "50000", startDate: daysAgo(60), endDate: daysAgo(30), config: { platforms: ["instagram", "linkedin"], targetAudience: "tech decision makers", objective: "lead_generation" } },
      { brandId: 2, name: "Organic Living Campaign", vertical: "social", status: "active", budget: "35000", startDate: daysAgo(15), endDate: daysAgo(-30), config: { platforms: ["instagram", "facebook"], targetAudience: "health conscious families", objective: "engagement" } },
      
      // SEO Campaigns
      { brandId: 1, name: "Enterprise SaaS Keywords", vertical: "seo", status: "active", budget: "45000", startDate: daysAgo(90), endDate: daysAgo(-90), config: { targetKeywords: ["enterprise software", "digital transformation", "SaaS platform"], targetPages: 25 } },
      { brandId: 3, name: "Digital Banking SEO", vertical: "seo", status: "active", budget: "80000", startDate: daysAgo(60), endDate: daysAgo(-60), config: { targetKeywords: ["online banking", "UPI payments", "investment app"], targetPages: 40 } },
      { brandId: 4, name: "Exam Prep Keywords", vertical: "seo", status: "completed", budget: "25000", startDate: daysAgo(120), endDate: daysAgo(30), config: { targetKeywords: ["UPSC preparation", "JEE coaching online", "NEET study material"], targetPages: 30 } },
      
      // Web Development Campaigns
      { brandId: 1, name: "Landing Page Optimization Q4", vertical: "web", status: "active", budget: "120000", startDate: daysAgo(45), endDate: daysAgo(-30), config: { pages: ["homepage", "pricing", "features", "demo"], objective: "conversion_optimization" } },
      { brandId: 2, name: "E-commerce Revamp", vertical: "web", status: "in_progress", budget: "200000", startDate: daysAgo(30), endDate: daysAgo(-60), config: { pages: ["product_catalog", "checkout", "cart"], objective: "ux_improvement" } },
      { brandId: 5, name: "Telemedicine Portal", vertical: "web", status: "completed", budget: "180000", startDate: daysAgo(90), endDate: daysAgo(15), config: { pages: ["doctor_profiles", "appointment_booking", "video_consultation"], objective: "feature_launch" } },
      
      // Sales SDR Campaigns
      { brandId: 1, name: "Enterprise Outreach Q4", vertical: "sales", status: "active", budget: "60000", startDate: daysAgo(30), endDate: daysAgo(-30), config: { targetCompanySize: "500+", targetIndustries: ["IT", "BFSI", "Manufacturing"], dailyLeadTarget: 20 } },
      { brandId: 3, name: "SMB Banking Acquisition", vertical: "sales", status: "active", budget: "40000", startDate: daysAgo(45), endDate: daysAgo(-45), config: { targetCompanySize: "50-500", targetIndustries: ["Retail", "Services"], dailyLeadTarget: 30 } },
      { brandId: 4, name: "School Partnership Drive", vertical: "sales", status: "completed", budget: "35000", startDate: daysAgo(90), endDate: daysAgo(30), config: { targetType: "schools", targetRegions: ["Tier 1", "Tier 2 cities"], dailyLeadTarget: 15 } },
      
      // WhatsApp Campaigns
      { brandId: 2, name: "Order Automation Flow", vertical: "whatsapp", status: "active", budget: "15000", startDate: daysAgo(60), endDate: daysAgo(-30), config: { flowType: "transactional", languages: ["en", "hi"], messageTypes: ["order_confirmation", "shipping_update", "delivery"] } },
      { brandId: 3, name: "Banking Support Bot", vertical: "whatsapp", status: "active", budget: "25000", startDate: daysAgo(45), endDate: daysAgo(-60), config: { flowType: "support", languages: ["en", "hi", "ta"], messageTypes: ["balance_inquiry", "transaction_history", "card_services"] } },
      { brandId: 5, name: "Appointment Reminders", vertical: "whatsapp", status: "active", budget: "10000", startDate: daysAgo(30), endDate: daysAgo(-90), config: { flowType: "notification", languages: ["en", "hi", "mr"], messageTypes: ["appointment_reminder", "prescription_ready", "follow_up"] } },
      
      // LinkedIn Campaigns
      { brandId: 1, name: "CEO Thought Leadership", vertical: "linkedin", status: "active", budget: "30000", startDate: daysAgo(60), endDate: daysAgo(-60), config: { contentTypes: ["articles", "posts", "carousels"], postingFrequency: "3x/week", targetAudience: "CTOs, CIOs" } },
      { brandId: 3, name: "FinTech Innovation Series", vertical: "linkedin", status: "active", budget: "45000", startDate: daysAgo(30), endDate: daysAgo(-60), config: { contentTypes: ["articles", "videos", "polls"], postingFrequency: "daily", targetAudience: "Finance professionals" } },
      { brandId: 4, name: "Educator Network Building", vertical: "linkedin", status: "completed", budget: "20000", startDate: daysAgo(90), endDate: daysAgo(30), config: { contentTypes: ["posts", "documents"], postingFrequency: "2x/week", targetAudience: "Teachers, Principals" } },
      
      // Performance Campaigns
      { brandId: 1, name: "Google Ads - Demo Signups", vertical: "performance", status: "active", budget: "150000", startDate: daysAgo(30), endDate: daysAgo(-30), config: { platforms: ["google_ads"], objective: "conversions", targetCPA: 500 } },
      { brandId: 2, name: "Meta Retargeting", vertical: "performance", status: "active", budget: "80000", startDate: daysAgo(45), endDate: daysAgo(-30), config: { platforms: ["meta"], objective: "remarketing", targetROAS: 4.5 } },
      { brandId: 3, name: "App Install Campaign", vertical: "performance", status: "active", budget: "200000", startDate: daysAgo(60), endDate: daysAgo(-30), config: { platforms: ["google_ads", "meta"], objective: "app_installs", targetCPI: 25 } }
    ];

    console.log("  📊 Inserting campaigns...");
    const insertedCampaigns = await db.insert(campaigns).values(campaignData).onConflictDoNothing().returning();
    console.log(`  ✅ Inserted ${insertedCampaigns.length} campaigns`);

    // ============================================
    // 3. SOCIAL POSTS - Past History
    // ============================================
    const socialPostData = [
      { campaignId: 1, platform: "instagram", content: "✨ दिवाली की हार्दिक शुभकामनाएं! इस त्योहार पर हमारे साथ जुड़ें और पाएं विशेष ऑफर! #Diwali2024 #TechVista #DigitalDiwali", mediaUrls: ["https://example.com/diwali-banner.jpg"], status: "published", scheduledAt: daysAgo(28), publishedAt: daysAgo(28), engagement: { likes: 1245, comments: 89, shares: 156, reach: 45000 } },
      { campaignId: 1, platform: "facebook", content: "🪔 Celebrate Diwali with TechVista! Special enterprise offers launching soon. Stay tuned! #FestiveOffers #Enterprise", mediaUrls: ["https://example.com/diwali-fb.jpg"], status: "published", scheduledAt: daysAgo(27), publishedAt: daysAgo(27), engagement: { likes: 892, comments: 45, shares: 78, reach: 32000 } },
      { campaignId: 1, platform: "twitter", content: "🎉 Big announcement coming this Diwali! Our new AI-powered features will transform your business. #TechVista #AI #Diwali", mediaUrls: [], status: "published", scheduledAt: daysAgo(25), publishedAt: daysAgo(25), engagement: { likes: 456, retweets: 123, replies: 34, impressions: 28000 } },
      { campaignId: 2, platform: "instagram", content: "Introducing our next-gen platform! 🚀 Preview the future of enterprise software. Link in bio. #ProductLaunch #Innovation", mediaUrls: ["https://example.com/product-teaser.mp4"], status: "published", scheduledAt: daysAgo(55), publishedAt: daysAgo(55), engagement: { likes: 2340, comments: 178, shares: 290, reach: 78000 } },
      { campaignId: 3, platform: "instagram", content: "🌿 Go organic this season! Fresh vegetables delivered to your doorstep. Use code FRESH20 for 20% off! #OrganicLiving #HealthyEating", mediaUrls: ["https://example.com/organic-veggies.jpg"], status: "published", scheduledAt: daysAgo(12), publishedAt: daysAgo(12), engagement: { likes: 567, comments: 45, shares: 89, reach: 18000 } },
      { campaignId: 3, platform: "facebook", content: "Join our Organic Living community! 🥗 Weekly meal plans, recipes, and exclusive offers. #GreenLeaf #OrganicFood", mediaUrls: ["https://example.com/meal-plan.jpg"], status: "scheduled", scheduledAt: daysAgo(-2), publishedAt: null, engagement: {} },
      { campaignId: 1, platform: "instagram", content: "🎯 Year-end review: How TechVista helped 500+ enterprises achieve digital transformation in 2024. Full report in bio! #YearInReview", mediaUrls: ["https://example.com/year-review.jpg"], status: "draft", scheduledAt: null, publishedAt: null, engagement: {} }
    ];

    console.log("  📱 Inserting social posts...");
    await db.insert(socialPosts).values(socialPostData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${socialPostData.length} social posts`);

    // ============================================
    // 4. SEO AUDITS - Past History
    // ============================================
    const seoAuditData = [
      { campaignId: 4, url: "https://techvista.example.com", scores: { performance: 92, accessibility: 88, bestPractices: 95, seo: 89, pwa: 45 }, recommendations: [{ priority: "high", issue: "Add meta descriptions to 12 pages", impact: "Medium SEO impact" }, { priority: "medium", issue: "Optimize images for Core Web Vitals", impact: "Performance improvement" }], createdAt: daysAgo(85) },
      { campaignId: 4, url: "https://techvista.example.com/features", scores: { performance: 88, accessibility: 92, bestPractices: 90, seo: 94, pwa: 50 }, recommendations: [{ priority: "low", issue: "Add structured data for features", impact: "Rich snippets in SERP" }], createdAt: daysAgo(60) },
      { campaignId: 5, url: "https://finsecure.example.com", scores: { performance: 78, accessibility: 85, bestPractices: 92, seo: 82, pwa: 60 }, recommendations: [{ priority: "high", issue: "Improve mobile page speed", impact: "Critical for mobile-first indexing" }, { priority: "high", issue: "Fix broken internal links (23 found)", impact: "Crawl efficiency" }], createdAt: daysAgo(55) },
      { campaignId: 5, url: "https://finsecure.example.com/personal-banking", scores: { performance: 85, accessibility: 90, bestPractices: 88, seo: 91, pwa: 65 }, recommendations: [{ priority: "medium", issue: "Add FAQ schema markup", impact: "Featured snippets opportunity" }], createdAt: daysAgo(30) },
      { campaignId: 6, url: "https://eduspark.example.com", scores: { performance: 72, accessibility: 78, bestPractices: 85, seo: 76, pwa: 40 }, recommendations: [{ priority: "high", issue: "Reduce JavaScript bundle size", impact: "40% performance improvement" }, { priority: "high", issue: "Add canonical tags to course pages", impact: "Duplicate content resolution" }], createdAt: daysAgo(100) }
    ];

    console.log("  🔍 Inserting SEO audits...");
    await db.insert(seoAudits).values(seoAuditData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${seoAuditData.length} SEO audits`);

    // ============================================
    // 5. LEADS - Sales History
    // ============================================
    const leadData = [
      { campaignId: 10, name: "Rajesh Kumar", email: "rajesh.kumar@infosys.com", company: "Infosys Ltd", source: "linkedin", status: "qualified", score: 85, metadata: { title: "VP Engineering", employees: "250000+", industry: "IT Services", lastTouch: daysAgo(2).toISOString() }, createdAt: daysAgo(25) },
      { campaignId: 10, name: "Priya Sharma", email: "priya.s@wipro.com", company: "Wipro Technologies", source: "webinar", status: "meeting_scheduled", score: 92, metadata: { title: "CTO", employees: "200000+", industry: "IT Services", meetingDate: daysAgo(-3).toISOString() }, createdAt: daysAgo(20) },
      { campaignId: 10, name: "Amit Patel", email: "amit.patel@tatasteel.com", company: "Tata Steel", source: "google_ads", status: "proposal_sent", score: 78, metadata: { title: "IT Director", employees: "50000+", industry: "Manufacturing", proposalValue: 2500000 }, createdAt: daysAgo(18) },
      { campaignId: 10, name: "Sneha Reddy", email: "sneha.r@hdfcbank.com", company: "HDFC Bank", source: "linkedin", status: "negotiation", score: 95, metadata: { title: "Head of Digital", employees: "100000+", industry: "Banking", dealValue: 5000000 }, createdAt: daysAgo(30) },
      { campaignId: 11, name: "Vikram Singh", email: "vikram@retailmart.in", company: "RetailMart India", source: "referral", status: "qualified", score: 72, metadata: { title: "Owner", employees: "200", industry: "Retail", annualRevenue: "50Cr" }, createdAt: daysAgo(40) },
      { campaignId: 11, name: "Kavitha Nair", email: "kavitha@fashionhub.com", company: "FashionHub", source: "cold_email", status: "new", score: 45, metadata: { title: "Marketing Manager", employees: "80", industry: "E-commerce" }, createdAt: daysAgo(5) },
      { campaignId: 12, name: "Dr. Ramesh Iyer", email: "principal@dpsdelhi.edu", company: "DPS Delhi", source: "conference", status: "closed_won", score: 88, metadata: { title: "Principal", studentCount: 3500, dealValue: 1200000 }, createdAt: daysAgo(75) },
      { campaignId: 12, name: "Mrs. Sunita Verma", email: "admin@springdale.edu", company: "Springdale School", source: "referral", status: "closed_won", score: 82, metadata: { title: "Administrator", studentCount: 2200, dealValue: 800000 }, createdAt: daysAgo(60) }
    ];

    console.log("  🎯 Inserting leads...");
    await db.insert(leads).values(leadData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${leadData.length} leads`);

    // ============================================
    // 6. PERFORMANCE ADS - Ad History
    // ============================================
    const performanceAdData = [
      { campaignId: 19, platform: "google_ads", adId: "GA-2024-001", name: "Enterprise Demo - Search", status: "active", spend: "45000", impressions: 125000, clicks: 3200, conversions: 156, roas: "4.85", createdAt: daysAgo(28) },
      { campaignId: 19, platform: "google_ads", adId: "GA-2024-002", name: "Digital Transformation - Display", status: "active", spend: "32000", impressions: 450000, clicks: 8900, conversions: 89, roas: "3.20", createdAt: daysAgo(28) },
      { campaignId: 19, platform: "google_ads", adId: "GA-2024-003", name: "SaaS Platform - Video", status: "paused", spend: "18000", impressions: 89000, clicks: 2100, conversions: 34, roas: "2.10", createdAt: daysAgo(25) },
      { campaignId: 20, platform: "meta", adId: "META-2024-001", name: "Organic Products - Carousel", status: "active", spend: "28000", impressions: 320000, clicks: 12500, conversions: 890, roas: "5.20", createdAt: daysAgo(40) },
      { campaignId: 20, platform: "meta", adId: "META-2024-002", name: "Health Benefits - Video", status: "active", spend: "22000", impressions: 180000, clicks: 8200, conversions: 456, roas: "4.80", createdAt: daysAgo(35) },
      { campaignId: 21, platform: "google_ads", adId: "GA-APP-001", name: "Banking App - UAC", status: "active", spend: "85000", impressions: 2500000, clicks: 45000, conversions: 3400, roas: "2.80", createdAt: daysAgo(55) },
      { campaignId: 21, platform: "meta", adId: "META-APP-001", name: "FinSecure App - Install", status: "active", spend: "65000", impressions: 1800000, clicks: 38000, conversions: 2600, roas: "3.10", createdAt: daysAgo(50) }
    ];

    console.log("  📈 Inserting performance ads...");
    await db.insert(performanceAds).values(performanceAdData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${performanceAdData.length} performance ads`);

    // ============================================
    // 7. WHATSAPP CONVERSATIONS - History
    // ============================================
    const whatsappData = [
      { campaignId: 13, phoneNumber: "+91-9876543210", status: "completed", messages: [{ role: "user", content: "Where is my order?", timestamp: daysAgo(5).toISOString() }, { role: "bot", content: "Hi! Your order #GL2024-1234 is out for delivery. Expected by 6 PM today.", timestamp: daysAgo(5).toISOString() }, { role: "user", content: "Thanks!", timestamp: daysAgo(5).toISOString() }], lastMessageAt: daysAgo(5), createdAt: daysAgo(5) },
      { campaignId: 13, phoneNumber: "+91-9988776655", status: "completed", messages: [{ role: "bot", content: "🎉 Your order #GL2024-1567 has been delivered! Rate your experience.", timestamp: daysAgo(3).toISOString() }, { role: "user", content: "5 stars! Great quality produce.", timestamp: daysAgo(3).toISOString() }], lastMessageAt: daysAgo(3), createdAt: daysAgo(3) },
      { campaignId: 14, phoneNumber: "+91-9123456789", status: "active", messages: [{ role: "user", content: "What is my account balance?", timestamp: daysAgo(1).toISOString() }, { role: "bot", content: "Your savings account ending in 4523 has a balance of ₹1,25,430.50 as of today.", timestamp: daysAgo(1).toISOString() }], lastMessageAt: daysAgo(1), createdAt: daysAgo(1) },
      { campaignId: 14, phoneNumber: "+91-9234567890", status: "escalated", messages: [{ role: "user", content: "I need to block my card urgently!", timestamp: hoursAgo(2).toISOString() }, { role: "bot", content: "I understand the urgency. Connecting you to our security team immediately.", timestamp: hoursAgo(2).toISOString() }], lastMessageAt: hoursAgo(2), createdAt: hoursAgo(2) },
      { campaignId: 15, phoneNumber: "+91-9345678901", status: "completed", messages: [{ role: "bot", content: "Reminder: Your appointment with Dr. Sharma is tomorrow at 10:30 AM. Reply YES to confirm.", timestamp: daysAgo(2).toISOString() }, { role: "user", content: "YES", timestamp: daysAgo(2).toISOString() }, { role: "bot", content: "Confirmed! See you tomorrow. Location: HealthFirst Clinic, Andheri.", timestamp: daysAgo(2).toISOString() }], lastMessageAt: daysAgo(2), createdAt: daysAgo(2) }
    ];

    console.log("  💬 Inserting WhatsApp conversations...");
    await db.insert(whatsappConversations).values(whatsappData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${whatsappData.length} WhatsApp conversations`);

    // ============================================
    // 8. LINKEDIN ACTIVITIES - History
    // ============================================
    const linkedinData = [
      { campaignId: 16, profileUrl: "https://linkedin.com/in/ceo-techvista", activityType: "article", content: "The Future of Enterprise AI: 5 Trends Shaping 2025 - A comprehensive look at how AI is transforming business operations...", engagement: { views: 15400, likes: 892, comments: 145, shares: 234 }, createdAt: daysAgo(45) },
      { campaignId: 16, profileUrl: "https://linkedin.com/in/ceo-techvista", activityType: "post", content: "Excited to announce our partnership with Google Cloud! Together, we're bringing AI-powered solutions to enterprises across India. 🚀 #AIPartnership #GoogleCloud", engagement: { views: 28000, likes: 1560, comments: 234, shares: 456 }, createdAt: daysAgo(30) },
      { campaignId: 16, profileUrl: "https://linkedin.com/in/ceo-techvista", activityType: "carousel", content: "10 Signs Your Business Needs Digital Transformation (Swipe to learn more) →", engagement: { views: 42000, likes: 2340, comments: 312, shares: 567 }, createdAt: daysAgo(15) },
      { campaignId: 17, profileUrl: "https://linkedin.com/company/finsecure", activityType: "video", content: "Watch: How UPI is revolutionizing payments in India - Our CEO explains the technology behind seamless transactions.", engagement: { views: 35000, likes: 1890, comments: 267, shares: 389 }, createdAt: daysAgo(25) },
      { campaignId: 17, profileUrl: "https://linkedin.com/company/finsecure", activityType: "poll", content: "What's your preferred digital payment method? 💳", engagement: { views: 18000, votes: 4500, comments: 123 }, createdAt: daysAgo(10) },
      { campaignId: 18, profileUrl: "https://linkedin.com/company/eduspark", activityType: "document", content: "Free Guide: How to Prepare for UPSC 2025 - Download our comprehensive study plan!", engagement: { views: 25000, likes: 1200, comments: 189, downloads: 4500 }, createdAt: daysAgo(70) }
    ];

    console.log("  💼 Inserting LinkedIn activities...");
    await db.insert(linkedinActivities).values(linkedinData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${linkedinData.length} LinkedIn activities`);

    // ============================================
    // 9. ANALYTICS SNAPSHOTS - Historical Data
    // ============================================
    const analyticsData = [
      // Social Media Analytics
      { campaignId: 1, vertical: "social", metrics: { totalReach: 245000, engagementRate: 4.8, followers: 12500, posts: 24, topPlatform: "instagram", sentimentScore: 0.82 }, timestamp: daysAgo(7) },
      { campaignId: 1, vertical: "social", metrics: { totalReach: 198000, engagementRate: 4.2, followers: 11800, posts: 18, topPlatform: "instagram", sentimentScore: 0.79 }, timestamp: daysAgo(14) },
      { campaignId: 1, vertical: "social", metrics: { totalReach: 156000, engagementRate: 3.9, followers: 11200, posts: 12, topPlatform: "facebook", sentimentScore: 0.75 }, timestamp: daysAgo(21) },
      
      // SEO Analytics
      { campaignId: 4, vertical: "seo", metrics: { organicTraffic: 45000, keywordsRanked: 156, avgPosition: 12.5, backlinks: 892, domainAuthority: 45, crawlErrors: 3 }, timestamp: daysAgo(7) },
      { campaignId: 4, vertical: "seo", metrics: { organicTraffic: 38000, keywordsRanked: 142, avgPosition: 14.2, backlinks: 845, domainAuthority: 43, crawlErrors: 8 }, timestamp: daysAgo(30) },
      
      // Performance Analytics
      { campaignId: 19, vertical: "performance", metrics: { spend: 95000, impressions: 664000, clicks: 14200, conversions: 279, ctr: 2.14, cpc: 6.69, roas: 4.12 }, timestamp: daysAgo(7) },
      { campaignId: 19, vertical: "performance", metrics: { spend: 78000, impressions: 520000, clicks: 11500, conversions: 198, ctr: 2.21, cpc: 6.78, roas: 3.85 }, timestamp: daysAgo(14) },
      
      // Sales Analytics
      { campaignId: 10, vertical: "sales", metrics: { newLeads: 127, qualifiedLeads: 43, meetingsBooked: 18, proposalsSent: 12, dealsWon: 4, pipelineValue: 8500000, conversionRate: 32 }, timestamp: daysAgo(7) },
      { campaignId: 10, vertical: "sales", metrics: { newLeads: 98, qualifiedLeads: 35, meetingsBooked: 14, proposalsSent: 8, dealsWon: 2, pipelineValue: 6200000, conversionRate: 28 }, timestamp: daysAgo(14) },
      
      // WhatsApp Analytics
      { campaignId: 13, vertical: "whatsapp", metrics: { activeChats: 89, messagesSent: 2400, avgResponseTime: 1.8, satisfactionScore: 4.7, automationRate: 78, escalationRate: 5 }, timestamp: daysAgo(7) },
      
      // LinkedIn Analytics
      { campaignId: 16, vertical: "linkedin", metrics: { profileViews: 1200, connectionRate: 28, postImpressions: 85000, inMailResponse: 18, ssiScore: 72, followerGrowth: 156 }, timestamp: daysAgo(7) }
    ];

    console.log("  📊 Inserting analytics snapshots...");
    await db.insert(analyticsSnapshots).values(analyticsData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${analyticsData.length} analytics snapshots`);


    // ============================================
    // 12. CONTENT ITEMS - Multilingual Library
    // ============================================
    const contentItemData = [
      // Hindi Content
      { name: "दिवाली विशेष ऑफर", type: "social_post", author: "TechVista Marketing", language: "Hindi", content: "✨ दिवाली की हार्दिक शुभकामनाएं! इस त्योहारी सीज़न में TechVista के साथ अपने व्यवसाय को नई ऊंचाइयों पर ले जाएं। विशेष 30% छूट! #दिवाली2024 #डिजिटलट्रांसफॉर्मेशन", status: "published", metadata: { brandId: 1, vertical: "social", platform: "instagram", engagement: { likes: 1245, shares: 156 } }, createdAt: daysAgo(28) },
      { name: "स्वस्थ जीवन गाइड", type: "text", author: "GreenLeaf Content Team", language: "Hindi", content: "जैविक खाद्य पदार्थों के 10 अद्भुत फायदे जो आपकी सेहत को बेहतर बनाएंगे। पूरी जानकारी के लिए पढ़ें...", status: "published", metadata: { brandId: 2, vertical: "seo", wordCount: 1500, readTime: 7 }, createdAt: daysAgo(20) },
      
      // Tamil Content
      { name: "பொங்கல் சிறப்பு வங்கி சேவைகள்", type: "social_post", author: "FinSecure Marketing", language: "Tamil", content: "🎉 பொங்கல் வாழ்த்துக்கள்! இந்த பண்டிகை காலத்தில் சிறப்பு வட்டி விகிதங்களுடன் சேமிப்புக் கணக்கை தொடங்குங்கள். #பொங்கல்2024 #சேமிப்பு", status: "published", metadata: { brandId: 3, vertical: "social", platform: "facebook", engagement: { likes: 892, shares: 78 } }, createdAt: daysAgo(25) },
      { name: "UPSC தயாரிப்பு வழிகாட்டி", type: "text", author: "EduSpark Educators", language: "Tamil", content: "UPSC தேர்வுக்கான முழுமையான தயாரிப்பு திட்டம். படிப்பு நேரம், புத்தகங்கள், மற்றும் உத்திகள்...", status: "published", metadata: { brandId: 4, vertical: "seo", downloads: 4500, rating: 4.8 }, createdAt: daysAgo(60) },
      
      // Telugu Content
      { name: "సంక్రాంతి ఆఫర్లు", type: "text", author: "FinSecure Marketing", language: "Telugu", content: "సంక్రాంతి పండుగ సందర్భంగా FinSecure యాప్‌లో ₹500 క్యాష్‌బ్యాక్! ఇప్పుడే డౌన్‌లోడ్ చేయండి. #సంక్రాంతి2024", status: "published", metadata: { brandId: 3, vertical: "performance", platform: "google_ads", impressions: 125000 }, createdAt: daysAgo(15) },
      
      // Bengali Content  
      { name: "দুর্গা পূজা স্বাস্থ্য টিপস", type: "text", author: "HealthFirst Team", language: "Bengali", content: "🙏 শুভ দুর্গা পূজা! এই পূজার মরসুমে স্বাস্থ্যকর থাকুন। বিনামূল্যে স্বাস্থ্য পরীক্ষার জন্য বুক করুন।", status: "published", metadata: { brandId: 5, vertical: "whatsapp", sent: 15000, opened: 8500 }, createdAt: daysAgo(35) },
      
      // Marathi Content
      { name: "गणेशोत्सव आरोग्य शिबिर", type: "social_post", author: "HealthFirst Marketing", language: "Marathi", content: "गणपती बाप्पा मोरया! 🙏 या गणेशोत्सवात HealthFirst मध्ये मोफत आरोग्य तपासणी शिबिर. आजच नोंदणी करा!", status: "published", metadata: { brandId: 5, vertical: "social", platform: "instagram", registrations: 450 }, createdAt: daysAgo(40) },
      
      // Gujarati Content
      { name: "નવરાત્રી સ્પેશિયલ મેનુ", type: "text", author: "GreenLeaf Content Team", language: "Gujarati", content: "નવરાત્રીના 9 દિવસ માટે વિશેષ સાત્વિક વાનગીઓ. GreenLeaf ની 100% ઓર્ગેનિક સામગ્રી સાથે.", status: "published", metadata: { brandId: 2, vertical: "seo", views: 12000, shares: 890 }, createdAt: daysAgo(30) },
      
      // Kannada Content
      { name: "NEET ಪರೀಕ್ಷೆ ತಯಾರಿ", type: "text", author: "EduSpark Educators", language: "Kannada", content: "NEET 2025 ಪರೀಕ್ಷೆಗೆ ಸಂಪೂರ್ಣ ತಯಾರಿ ಮಾರ್ಗದರ್ಶಿ. ವಿಷಯವಾರು ಅಧ್ಯಯನ ಯೋಜನೆ ಮತ್ತು ಮಾದರಿ ಪತ್ರಿಕೆಗಳು.", status: "published", metadata: { brandId: 4, vertical: "seo", downloads: 3200, rating: 4.7 }, createdAt: daysAgo(45) },
      
      // Malayalam Content
      { name: "ഓണം സേവിംഗ്സ് ഓഫർ", type: "text", author: "FinSecure Marketing", language: "Malayalam", content: "ഓണാശംസകൾ! 🌻 FinSecure-ൽ പുതിയ സേവിംഗ്സ് അക്കൗണ്ട് തുറക്കൂ, 7% പലിശ നേടൂ. #ഓണം2024", status: "published", metadata: { brandId: 3, vertical: "performance", platform: "meta", conversions: 890 }, createdAt: daysAgo(50) },
      
      // Punjabi Content
      { name: "ਬੈਸਾਖੀ ਸਿਹਤ ਮੇਲਾ", type: "social_post", author: "HealthFirst Marketing", language: "Punjabi", content: "ਬੈਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! 🌾 HealthFirst ਵੱਲੋਂ ਮੁਫ਼ਤ ਸਿਹਤ ਜਾਂਚ ਕੈਂਪ। ਹੁਣੇ ਰਜਿਸਟਰ ਕਰੋ!", status: "published", metadata: { brandId: 5, vertical: "social", platform: "facebook", registrations: 320 }, createdAt: daysAgo(55) },
      
      // English Content
      { name: "Digital Transformation Whitepaper", type: "presentation", author: "TechVista Leadership", language: "English", content: "Comprehensive guide to enterprise digital transformation in 2025. Key strategies, case studies, and ROI analysis for CXOs.", status: "published", metadata: { brandId: 1, vertical: "linkedin", downloads: 8500, leads: 234 }, createdAt: daysAgo(30) },
      { name: "Enterprise SaaS Demo Script", type: "text", author: "TechVista Sales Team", language: "English", content: "30-minute product demo script for enterprise prospects. Covers key features, integrations, and pricing discussion points.", status: "published", metadata: { brandId: 1, vertical: "sales", usedIn: 45, conversionRate: 32 }, createdAt: daysAgo(20) },
      
      // Additional multilingual content
      { name: "Odia Festival Greetings", type: "social_post", author: "GreenLeaf Marketing", language: "Odia", content: "ଶୁଭ ଓଡ଼ିଆ ନୂଆ ବର୍ଷ! 🎉 GreenLeaf ରେ ବିଶେଷ ଅଫର୍ ପାଆନ୍ତୁ। #OdiaNewYear #OrganicLiving", status: "published", metadata: { brandId: 2, vertical: "social", platform: "instagram" }, createdAt: daysAgo(35) },
      { name: "Assamese Bihu Campaign", type: "social_post", author: "TechVista Marketing", language: "Assamese", content: "ৰঙালী বিহুৰ শুভেচ্ছা! 🌾 TechVista ৰ সৈতে আপোনাৰ ব্যৱসায়ক ডিজিটেল কৰক। #বিহু2024", status: "published", metadata: { brandId: 1, vertical: "social", platform: "facebook" }, createdAt: daysAgo(42) },
      { name: "Urdu Marketing Copy", type: "text", author: "FinSecure Content", language: "Urdu", content: "آپ کی مالی ضروریات کے لیے FinSecure - محفوظ اور قابل اعتماد بینکنگ۔ ابھی اپنا اکاؤنٹ کھولیں!", status: "published", metadata: { brandId: 3, vertical: "performance", platform: "meta" }, createdAt: daysAgo(48) }
    ];

    console.log("  📝 Inserting content items...");
    await db.insert(contentItems).values(contentItemData).onConflictDoNothing();
    console.log(`  ✅ Inserted ${contentItemData.length} content items`);

    console.log("\n✅ Master data seeding completed successfully!");
    console.log("   📊 Summary:");
    console.log(`   - Brands: ${brandData.length}`);
    console.log(`   - Campaigns: ${campaignData.length}`);
    console.log(`   - Social Posts: ${socialPostData.length}`);
    console.log(`   - SEO Audits: ${seoAuditData.length}`);
    console.log(`   - Leads: ${leadData.length}`);
    console.log(`   - Performance Ads: ${performanceAdData.length}`);
    console.log(`   - WhatsApp Conversations: ${whatsappData.length}`);
    console.log(`   - LinkedIn Activities: ${linkedinData.length}`);
    console.log(`   - Analytics Snapshots: ${analyticsData.length}`);
    console.log(`   - Content Items: ${contentItemData.length}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding master data:", error);
    throw error;
  }
}

