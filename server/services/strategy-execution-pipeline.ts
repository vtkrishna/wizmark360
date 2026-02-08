import { generateResponse, type LLMRequest } from './unified-llm-service';

export interface MarketingStrategy {
  id: string;
  brandId: string;
  name: string;
  objectives: string[];
  targetAudience: string;
  budget: number;
  duration: string;
  verticals: string[];
  status: 'draft' | 'planning' | 'executing' | 'monitoring' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionPlan {
  strategyId: string;
  vertical: string;
  tasks: ExecutionTask[];
  timeline: { start: Date; end: Date };
  budget: number;
  kpis: KPI[];
}

export interface ExecutionTask {
  id: string;
  name: string;
  vertical: string;
  type: 'content_creation' | 'campaign_launch' | 'optimization' | 'monitoring' | 'reporting';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent: string;
  scheduledDate: Date;
  completedDate?: Date;
  output?: any;
}

export interface KPI {
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

const strategiesStore = new Map<string, MarketingStrategy>();
const executionPlansStore = new Map<string, ExecutionPlan[]>();
const tasksIndex = new Map<string, { strategyId: string; planIndex: number; taskIndex: number }>();

export async function createStrategy(input: {
  brandId: string;
  name: string;
  objectives: string[];
  targetAudience: string;
  budget: number;
  duration: string;
  verticals: string[];
}): Promise<MarketingStrategy> {
  const request: LLMRequest = {
    message: `Create a comprehensive marketing strategy with the following inputs:
Name: ${input.name}
Objectives: ${input.objectives.join(', ')}
Target Audience: ${input.targetAudience}
Budget: $${input.budget}
Duration: ${input.duration}
Verticals: ${input.verticals.join(', ')}

Return a JSON object with these fields:
- refinedObjectives: array of specific, measurable objectives
- recommendedVerticals: array of verticals to activate (from the provided list)
- budgetBreakdown: object mapping each vertical to a recommended budget amount

Return ONLY valid JSON, no markdown.`,
    systemPrompt: 'You are an expert marketing strategist. Always respond with valid JSON only, no markdown formatting or code blocks.',
    temperature: 0.7,
    maxTokens: 2048,
  };

  let refinedObjectives = input.objectives;
  let finalVerticals = input.verticals;

  try {
    const llmResponse = await generateResponse(request);
    const parsed = JSON.parse(llmResponse.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    if (Array.isArray(parsed.refinedObjectives) && parsed.refinedObjectives.length > 0) {
      refinedObjectives = parsed.refinedObjectives;
    }
    if (Array.isArray(parsed.recommendedVerticals) && parsed.recommendedVerticals.length > 0) {
      finalVerticals = parsed.recommendedVerticals;
    }
  } catch (_e) {
  }

  const strategy: MarketingStrategy = {
    id: `strategy_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    brandId: input.brandId,
    name: input.name,
    objectives: refinedObjectives,
    targetAudience: input.targetAudience,
    budget: input.budget,
    duration: input.duration,
    verticals: finalVerticals,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  strategiesStore.set(strategy.id, strategy);
  return strategy;
}

export async function generateExecutionPlans(strategy: MarketingStrategy): Promise<ExecutionPlan[]> {
  const plans: ExecutionPlan[] = [];
  const budgetPerVertical = strategy.budget / strategy.verticals.length;
  const now = new Date();
  const durationMonths = parseInt(strategy.duration) || 3;
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  for (const vertical of strategy.verticals) {
    const request: LLMRequest = {
      message: `Generate an execution plan for the "${vertical}" vertical of a marketing strategy.

Strategy: ${strategy.name}
Objectives: ${strategy.objectives.join(', ')}
Target Audience: ${strategy.targetAudience}
Vertical Budget: $${Math.round(budgetPerVertical)}
Duration: ${strategy.duration}

Return a JSON object with:
- tasks: array of objects with fields: name (string), type (one of: content_creation, campaign_launch, optimization, monitoring, reporting), assignedAgent (string describing the agent role)
- kpis: array of objects with fields: name (string), target (number), unit (string)

Return ONLY valid JSON, no markdown.`,
      systemPrompt: 'You are a marketing execution planner. Always respond with valid JSON only, no markdown formatting or code blocks.',
      temperature: 0.7,
      maxTokens: 2048,
    };

    let tasks: ExecutionTask[] = [];
    let kpis: KPI[] = [];

    try {
      const llmResponse = await generateResponse(request);
      const parsed = JSON.parse(llmResponse.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

      if (Array.isArray(parsed.tasks)) {
        tasks = parsed.tasks.map((t: any, idx: number) => {
          const scheduledDate = new Date(now);
          scheduledDate.setDate(scheduledDate.getDate() + idx * 7);
          const task: ExecutionTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${idx}`,
            name: t.name || `Task ${idx + 1}`,
            vertical,
            type: t.type || 'content_creation',
            status: 'pending',
            assignedAgent: t.assignedAgent || `${vertical}-agent`,
            scheduledDate,
          };
          return task;
        });
      }

      if (Array.isArray(parsed.kpis)) {
        kpis = parsed.kpis.map((k: any) => ({
          name: k.name || 'Unnamed KPI',
          target: k.target || 0,
          current: 0,
          unit: k.unit || 'count',
          trend: 'stable' as const,
        }));
      }
    } catch (_e) {
      tasks = [
        {
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_0`,
          name: `${vertical} - Content Creation`,
          vertical,
          type: 'content_creation',
          status: 'pending',
          assignedAgent: `${vertical}-content-agent`,
          scheduledDate: now,
        },
        {
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_1`,
          name: `${vertical} - Campaign Launch`,
          vertical,
          type: 'campaign_launch',
          status: 'pending',
          assignedAgent: `${vertical}-campaign-agent`,
          scheduledDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_2`,
          name: `${vertical} - Performance Monitoring`,
          vertical,
          type: 'monitoring',
          status: 'pending',
          assignedAgent: `${vertical}-analytics-agent`,
          scheduledDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      ];
      kpis = [
        { name: 'Engagement Rate', target: 5, current: 0, unit: '%', trend: 'stable' },
        { name: 'Conversions', target: 100, current: 0, unit: 'count', trend: 'stable' },
        { name: 'ROI', target: 200, current: 0, unit: '%', trend: 'stable' },
      ];
    }

    const plan: ExecutionPlan = {
      strategyId: strategy.id,
      vertical,
      tasks,
      timeline: { start: now, end: endDate },
      budget: Math.round(budgetPerVertical),
      kpis,
    };

    plans.push(plan);
  }

  executionPlansStore.set(strategy.id, plans);

  plans.forEach((plan, planIndex) => {
    plan.tasks.forEach((task, taskIndex) => {
      tasksIndex.set(task.id, { strategyId: strategy.id, planIndex, taskIndex });
    });
  });

  strategy.status = 'executing';
  strategy.updatedAt = new Date();
  strategiesStore.set(strategy.id, strategy);

  return plans;
}

export function getStrategyStatus(strategyId: string): {
  strategy: MarketingStrategy;
  progress: Record<string, { total: number; completed: number; percentage: number }>;
  overallProgress: number;
  kpis: KPI[];
} | null {
  const strategy = strategiesStore.get(strategyId);
  if (!strategy) return null;

  const plans = executionPlansStore.get(strategyId) || [];
  const progress: Record<string, { total: number; completed: number; percentage: number }> = {};
  const allKpis: KPI[] = [];
  let totalTasks = 0;
  let totalCompleted = 0;

  for (const plan of plans) {
    const completed = plan.tasks.filter(t => t.status === 'completed').length;
    const total = plan.tasks.length;
    totalTasks += total;
    totalCompleted += completed;

    progress[plan.vertical] = {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    allKpis.push(...plan.kpis);
  }

  return {
    strategy,
    progress,
    overallProgress: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    kpis: allKpis,
  };
}

export function getStrategies(brandId?: string): MarketingStrategy[] {
  const all = Array.from(strategiesStore.values());
  if (brandId) {
    return all.filter(s => s.brandId === brandId);
  }
  return all;
}

export function updateTaskStatus(
  taskId: string,
  status: ExecutionTask['status']
): ExecutionTask | null {
  const ref = tasksIndex.get(taskId);
  if (!ref) return null;

  const plans = executionPlansStore.get(ref.strategyId);
  if (!plans || !plans[ref.planIndex]) return null;

  const task = plans[ref.planIndex].tasks[ref.taskIndex];
  if (!task) return null;

  task.status = status;
  if (status === 'completed') {
    task.completedDate = new Date();
  }

  const strategy = strategiesStore.get(ref.strategyId);
  if (strategy) {
    const allTasks = plans.flatMap(p => p.tasks);
    const allCompleted = allTasks.every(t => t.status === 'completed');
    const anyInProgress = allTasks.some(t => t.status === 'in_progress');

    if (allCompleted) {
      strategy.status = 'completed';
    } else if (anyInProgress) {
      strategy.status = 'executing';
    }
    strategy.updatedAt = new Date();
    strategiesStore.set(strategy.id, strategy);
  }

  return task;
}

export function getExecutionPlans(strategyId: string): ExecutionPlan[] | null {
  return executionPlansStore.get(strategyId) || null;
}
