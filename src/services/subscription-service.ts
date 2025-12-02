/**
 * Subscription Management Service
 * Handles user subscription plans, billing, and feature access control
 */

import { storage } from '../storage-enhanced';
import type { SubscriptionPlan, InsertSubscriptionPlan } from '@shared/schema';

export class SubscriptionService {
  /**
   * Initialize subscription plans in the database
   */
  async initializeSubscriptionPlans(): Promise<void> {
    console.log('🎯 Initializing subscription plans...');

    const plans: InsertSubscriptionPlan[] = [
      {
        id: 'alpha',
        name: 'Alpha',
        displayName: 'Alpha Plan',
        description: 'Perfect for individual developers getting started with AI-powered development',
        price: '0',
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          '5 AI agents',
          '3 concurrent projects',
          'Basic SDLC templates',
          'Community support',
          '1GB storage',
          'Email notifications'
        ],
        limits: {
          maxProjects: 3,
          maxAgents: 5,
          maxStorageGB: 1,
          maxTeamMembers: 1,
          maxApiCallsPerMonth: 1000,
          maxWorkflowExecutions: 50,
          enterpriseIntegrations: false,
          advancedAnalytics: false,
          prioritySupport: false
        },
        sortOrder: 1
      },
      {
        id: 'beta',
        name: 'Beta',
        displayName: 'Beta Plan',
        description: 'Ideal for small teams and growing projects with enhanced collaboration features',
        price: '29',
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          '15 AI agents',
          '10 concurrent projects',
          'All SDLC templates',
          'Priority support',
          '10GB storage',
          'Team collaboration',
          'Advanced workflows',
          'Basic integrations'
        ],
        limits: {
          maxProjects: 10,
          maxAgents: 15,
          maxStorageGB: 10,
          maxTeamMembers: 5,
          maxApiCallsPerMonth: 10000,
          maxWorkflowExecutions: 500,
          enterpriseIntegrations: true,
          advancedAnalytics: true,
          prioritySupport: true
        },
        sortOrder: 2
      },
      {
        id: 'gamma',
        name: 'Gamma',
        displayName: 'Gamma Plan',
        description: 'For professional teams requiring advanced features and unlimited scalability',
        price: '99',
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Unlimited AI agents',
          'Unlimited projects',
          'Custom SDLC templates',
          '24/7 premium support',
          '100GB storage',
          'Advanced team management',
          'Custom workflows',
          'All enterprise integrations',
          'Advanced analytics',
          'White-label options'
        ],
        limits: {
          maxProjects: -1, // Unlimited
          maxAgents: -1, // Unlimited
          maxStorageGB: 100,
          maxTeamMembers: 25,
          maxApiCallsPerMonth: 100000,
          maxWorkflowExecutions: -1, // Unlimited
          enterpriseIntegrations: true,
          advancedAnalytics: true,
          prioritySupport: true,
          customBranding: true,
          dedicatedSupport: true
        },
        sortOrder: 3
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        displayName: 'Enterprise Plan',
        description: 'Custom enterprise solution with dedicated support and on-premise deployment options',
        price: 'Contact Us',
        currency: 'USD',
        billingCycle: 'yearly',
        features: [
          'Everything in Gamma',
          'On-premise deployment',
          'Dedicated account manager',
          'Custom SLA',
          'Advanced security',
          'Compliance support',
          'Custom development',
          'Training and onboarding',
          'Priority feature requests'
        ],
        limits: {
          maxProjects: -1,
          maxAgents: -1,
          maxStorageGB: -1, // Unlimited
          maxTeamMembers: -1, // Unlimited
          maxApiCallsPerMonth: -1, // Unlimited
          maxWorkflowExecutions: -1,
          enterpriseIntegrations: true,
          advancedAnalytics: true,
          prioritySupport: true,
          customBranding: true,
          dedicatedSupport: true,
          onPremiseDeployment: true,
          customDevelopment: true,
          complianceSupport: true
        },
        sortOrder: 4
      }
    ];

    try {
      for (const plan of plans) {
        const existingPlan = await storage.getSubscriptionPlan(plan.id);
        if (!existingPlan) {
          await storage.createSubscriptionPlan(plan);
          console.log(`✅ Created subscription plan: ${plan.displayName}`);
        } else {
          console.log(`⏭️  Plan already exists: ${plan.displayName}`);
        }
      }
      console.log('🎯 Subscription plans initialization completed!');
    } catch (error) {
      console.error('❌ Error initializing subscription plans:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId: number, feature: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      const plan = await storage.getSubscriptionPlan(user.subscriptionPlan);
      if (!plan) return false;

      const limits = plan.limits as any;
      
      switch (feature) {
        case 'enterprise_integrations':
          return limits.enterpriseIntegrations === true;
        case 'advanced_analytics':
          return limits.advancedAnalytics === true;
        case 'priority_support':
          return limits.prioritySupport === true;
        case 'custom_branding':
          return limits.customBranding === true;
        case 'dedicated_support':
          return limits.dedicatedSupport === true;
        default:
          return true; // Default allow for unknown features
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Check if user is within usage limits
   */
  async checkUsageLimits(userId: number, resource: string, currentUsage: number): Promise<{ allowed: boolean; limit: number; message?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { allowed: false, limit: 0, message: 'User not found' };
      }

      const plan = await storage.getSubscriptionPlan(user.subscriptionPlan);
      if (!plan) {
        return { allowed: false, limit: 0, message: 'Subscription plan not found' };
      }

      const limits = plan.limits as any;
      const limit = limits[resource];

      if (limit === -1) {
        return { allowed: true, limit: -1 }; // Unlimited
      }

      if (currentUsage >= limit) {
        return { 
          allowed: false, 
          limit, 
          message: `Usage limit reached. Current: ${currentUsage}, Limit: ${limit}. Please upgrade your plan.` 
        };
      }

      return { allowed: true, limit };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { allowed: false, limit: 0, message: 'Error checking limits' };
    }
  }

  /**
   * Get subscription plan recommendations based on usage
   */
  async getRecommendedPlan(userId: number): Promise<{ recommendedPlan: string; reason: string } | null> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;

      const currentPlan = user.subscriptionPlan;
      
      // Get real usage metrics from SDK
      const sdkIntegration = (await import('../sdk/wai-sdk-integration.js')).WAISDKIntegration.getInstance();
      const performanceMonitor = sdkIntegration.getService('performanceMonitor');
      const taskQueue = sdkIntegration.getService('taskQueue');
      
      // Get real-time metrics from the platform
      const metrics = performanceMonitor.getMetrics();
      const queueStats = taskQueue.getStats();
      
      const usage = {
        projects: metrics.totalProjects || 0,
        apiCalls: metrics.totalApiCalls || 0,
        workflowExecutions: queueStats.totalExecutions || 0,
        teamMembers: metrics.activeUsers || 0
      };

      if (currentPlan === 'alpha') {
        if (usage.projects > 3 || usage.apiCalls > 1000) {
          return {
            recommendedPlan: 'beta',
            reason: 'Your usage exceeds Alpha plan limits. Beta plan offers more projects and API calls.'
          };
        }
      }

      if (currentPlan === 'beta') {
        if (usage.projects > 10 || usage.apiCalls > 10000 || usage.teamMembers > 5) {
          return {
            recommendedPlan: 'gamma',
            reason: 'Consider upgrading to Gamma for unlimited projects and advanced features.'
          };
        }
      }

      return null; // No recommendation needed
    } catch (error) {
      console.error('Error getting plan recommendation:', error);
      return null;
    }
  }

  /**
   * Calculate trial expiration date
   */
  getTrialExpirationDate(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 14); // 14-day trial
    return now;
  }

  /**
   * Check if user's trial has expired
   */
  isTrialExpired(user: any): boolean {
    if (!user.trialExpiresAt) return false;
    return new Date() > new Date(user.trialExpiresAt);
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(userId: number, newPlan: string): Promise<{ success: boolean; message: string }> {
    try {
      const plan = await storage.getSubscriptionPlan(newPlan);
      if (!plan) {
        return { success: false, message: 'Invalid subscription plan' };
      }

      await storage.updateUser(userId, {
        subscriptionPlan: newPlan,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: this.getSubscriptionExpirationDate(plan.billingCycle),
        updatedAt: new Date()
      });

      return { success: true, message: `Successfully upgraded to ${plan.displayName}` };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { success: false, message: 'Failed to upgrade subscription' };
    }
  }

  /**
   * Get subscription expiration date based on billing cycle
   */
  private getSubscriptionExpirationDate(billingCycle: string): Date {
    const now = new Date();
    if (billingCycle === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now;
  }
}

export const subscriptionService = new SubscriptionService();