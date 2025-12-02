import fs from 'fs/promises';
import path from 'path';
import { db } from '../db';
import { agentCatalog } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface AgentManifest {
  version: string;
  manifestFormat: string;
  totalAgents: number;
  agentTiers: {
    [tierName: string]: {
      count: number;
      agents: Array<{
        id: string;
        name: string;
        role: string;
        capabilities: string[];
        systemPrompt: string;
        tier: string;
        status: string;
        model: string;
        fallbackModel: string;
        costOptimization: boolean;
        romaFlows?: any;
        readiness?: {
          status: string;
          conformanceScore: number;
          performanceMetrics: {
            avgResponseTime: number;
            successRate: number;
            resourceUsage: string;
          };
        };
      }>;
    };
  };
}

class AgentManifestLoader {
  private manifestPath = path.join(process.cwd(), 'attached_assets', 'WAI-SDK-v9-Complete', 'agents', 'agent-manifests.json');

  async loadManifestData(): Promise<AgentManifest> {
    try {
      const manifestData = await fs.readFile(this.manifestPath, 'utf-8');
      return JSON.parse(manifestData) as AgentManifest;
    } catch (error) {
      console.error('Error loading agent manifest:', error);
      // Fallback to minimal manifest structure
      return {
        version: '1.0.1',
        manifestFormat: "ROMA-aligned",
        totalAgents: 0,
        agentTiers: {}
      };
    }
  }

  async syncAgentsToDatabase(): Promise<void> {
    try {
      const manifest = await this.loadManifestData();
      console.log(`Loading ${manifest.totalAgents} agents from manifest...`);

      // Get all agents from all tiers
      const allAgents: any[] = [];
      Object.entries(manifest.agentTiers).forEach(([tierName, tierData]) => {
        tierData.agents.forEach(agent => {
          allAgents.push({
            ...agent,
            tier: tierName,
            originalManifestData: JSON.stringify({
              romaFlows: agent.romaFlows,
              readiness: agent.readiness
            })
          });
        });
      });

      // Sync each agent to database (upsert operation)
      for (const agent of allAgents) {
        try {
          // Check if agent exists
          const existingAgent = await db
            .select()
            .from(agentCatalog)
            .where(eq(agentCatalog.agentId, agent.id))
            .limit(1);

          const agentData = {
            agentId: agent.id,
            name: agent.name,
            displayName: agent.name,
            description: agent.role,
            tier: agent.tier,
            category: agent.tier,
            specialization: agent.tier,
            capabilities: agent.capabilities,
            systemPrompt: agent.systemPrompt,
            preferredModels: [agent.model, agent.fallbackModel],
            isAvailable: agent.status === 'active',
            status: agent.status,
            version: '1.0.0',
            workflowPatterns: agent.romaFlows ? [agent.romaFlows] : [],
            baselineMetrics: agent.readiness?.performanceMetrics || {},
            updatedAt: new Date(),
          };

          if (existingAgent.length > 0) {
            // Update existing agent
            await db
              .update(agentCatalog)
              .set(agentData)
              .where(eq(agentCatalog.agentId, agent.id));
            console.log(`Updated agent: ${agent.name}`);
          } else {
            // Insert new agent
            await db
              .insert(agentCatalog)
              .values({
                ...agentData,
                createdAt: new Date(),
              });
            console.log(`Inserted new agent: ${agent.name}`);
          }
        } catch (agentError) {
          console.error(`Error syncing agent ${agent.id}:`, agentError);
        }
      }

      console.log(`Successfully synced ${allAgents.length} agents to database`);
    } catch (error) {
      console.error('Error syncing agents to database:', error);
      throw error;
    }
  }

  async getAllAgentsFromManifest(): Promise<any[]> {
    const manifest = await this.loadManifestData();
    const allAgents: any[] = [];
    
    Object.entries(manifest.agentTiers).forEach(([tierName, tierData]) => {
      tierData.agents.forEach(agent => {
        allAgents.push({
          ...agent,
          tier: tierName
        });
      });
    });

    return allAgents;
  }

  async getAgentFromManifest(agentId: string): Promise<any | null> {
    const allAgents = await this.getAllAgentsFromManifest();
    return allAgents.find(agent => agent.id === agentId) || null;
  }

  async updateAgentSystemPrompt(agentId: string, newSystemPrompt: string): Promise<boolean> {
    try {
      // Update in database
      const result = await db
        .update(agentCatalog)
        .set({ 
          systemPrompt: newSystemPrompt,
          updatedAt: new Date()
        })
        .where(eq(agentCatalog.agentId, agentId))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error updating agent system prompt:', error);
      return false;
    }
  }

  async updateAgentWorkflow(agentId: string, newWorkflow: any): Promise<boolean> {
    try {
      // Update in database
      const result = await db
        .update(agentCatalog)
        .set({ 
          workflowPatterns: [newWorkflow],
          updatedAt: new Date()
        })
        .where(eq(agentCatalog.agentId, agentId))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error updating agent workflow:', error);
      return false;
    }
  }
}

export const agentManifestLoader = new AgentManifestLoader();