interface DifyConfig {
  apiKey: string;
  baseUrl: string;
}

interface DifyWorkflowInput {
  inputs: Record<string, any>;
  responseMode: "blocking" | "streaming";
  user: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

interface DifyChatInput {
  inputs: Record<string, any>;
  query: string;
  responseMode: "blocking" | "streaming";
  conversationId?: string;
  user: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

interface DifyCompletionInput {
  inputs: Record<string, any>;
  responseMode: "blocking" | "streaming";
  user: string;
}

interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: "running" | "succeeded" | "failed" | "stopped" | "partial-succeeded";
    outputs: Record<string, any>;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps?: number;
    created_at: number;
    finished_at?: number;
  };
}

interface DifyChatResponse {
  event: string;
  message_id: string;
  conversation_id: string;
  mode: string;
  answer: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      prompt_unit_price: string;
      prompt_price_unit: string;
      prompt_price: string;
      completion_tokens: number;
      completion_unit_price: string;
      completion_price_unit: string;
      completion_price: string;
      total_tokens: number;
      total_price: string;
      currency: string;
      latency: number;
    };
    retriever_resources?: Array<{
      position: number;
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      segment_id: string;
      score: number;
      content: string;
    }>;
  };
  created_at: number;
}

interface DifyConversation {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: string;
  introduction: string;
  created_at: number;
  updated_at: number;
}

interface DifyMessage {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  message_files: any[];
  feedback: any;
  retriever_resources: any[];
  agent_thoughts: any[];
  created_at: number;
}

interface DifyApplication {
  id: string;
  name: string;
  description: string;
  type: "chat" | "completion" | "workflow" | "agent-chat";
  icon_type: string;
  icon: string;
  icon_background: string;
}

export class DifyIntegration {
  private config: DifyConfig;
  private isConfigured: boolean = false;

  constructor() {
    this.config = {
      apiKey: process.env.DIFY_API_KEY || "",
      baseUrl: process.env.DIFY_BASE_URL || "https://api.dify.ai/v1"
    };
    this.isConfigured = !!this.config.apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Authorization": `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json"
    };
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  getStatus(): { configured: boolean; baseUrl: string } {
    return {
      configured: this.isConfigured,
      baseUrl: this.config.baseUrl
    };
  }

  async runWorkflow(input: DifyWorkflowInput): Promise<DifyWorkflowResponse> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/workflows/run`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: input.inputs,
        response_mode: input.responseMode,
        user: input.user,
        files: input.files
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify workflow error: ${error}`);
    }

    return response.json();
  }

  async *runWorkflowStream(input: DifyWorkflowInput): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/workflows/run`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: input.inputs,
        response_mode: "streaming",
        user: input.user,
        files: input.files
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify workflow stream error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  async getWorkflowStatus(workflowRunId: string): Promise<DifyWorkflowResponse> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/workflows/run/${workflowRunId}`, {
      method: "GET",
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify workflow status error: ${error}`);
    }

    return response.json();
  }

  async stopWorkflow(taskId: string, user: string): Promise<{ result: string }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/workflows/tasks/${taskId}/stop`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ user })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify stop workflow error: ${error}`);
    }

    return response.json();
  }

  async sendChatMessage(input: DifyChatInput): Promise<DifyChatResponse> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/chat-messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: input.inputs,
        query: input.query,
        response_mode: input.responseMode,
        conversation_id: input.conversationId || "",
        user: input.user,
        files: input.files
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify chat error: ${error}`);
    }

    return response.json();
  }

  async *streamChatMessage(input: DifyChatInput): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/chat-messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: input.inputs,
        query: input.query,
        response_mode: "streaming",
        conversation_id: input.conversationId || "",
        user: input.user,
        files: input.files
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify chat stream error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  async createCompletion(input: DifyCompletionInput): Promise<DifyChatResponse> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/completion-messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: input.inputs,
        response_mode: input.responseMode,
        user: input.user
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify completion error: ${error}`);
    }

    return response.json();
  }

  async getConversations(user: string, limit: number = 20, lastId?: string): Promise<{
    data: DifyConversation[];
    has_more: boolean;
    limit: number;
  }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const params = new URLSearchParams({
      user,
      limit: limit.toString()
    });
    if (lastId) {
      params.append("last_id", lastId);
    }

    const response = await fetch(`${this.config.baseUrl}/conversations?${params}`, {
      method: "GET",
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify get conversations error: ${error}`);
    }

    return response.json();
  }

  async getConversationMessages(
    conversationId: string,
    user: string,
    limit: number = 20,
    firstId?: string
  ): Promise<{
    data: DifyMessage[];
    has_more: boolean;
    limit: number;
  }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const params = new URLSearchParams({
      user,
      limit: limit.toString()
    });
    if (firstId) {
      params.append("first_id", firstId);
    }

    const response = await fetch(
      `${this.config.baseUrl}/messages?conversation_id=${conversationId}&${params}`,
      {
        method: "GET",
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify get messages error: ${error}`);
    }

    return response.json();
  }

  async deleteConversation(conversationId: string, user: string): Promise<{ result: string }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify({ user })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify delete conversation error: ${error}`);
    }

    return response.json();
  }

  async renameConversation(
    conversationId: string,
    name: string,
    user: string,
    autoGenerate: boolean = false
  ): Promise<{ result: string }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}/name`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        user,
        auto_generate: autoGenerate
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify rename conversation error: ${error}`);
    }

    return response.json();
  }

  async submitMessageFeedback(
    messageId: string,
    rating: "like" | "dislike" | null,
    user: string,
    content?: string
  ): Promise<{ result: string }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/messages/${messageId}/feedbacks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        rating,
        user,
        content
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify submit feedback error: ${error}`);
    }

    return response.json();
  }

  async getSuggestedQuestions(messageId: string, user: string): Promise<{ data: string[] }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(
      `${this.config.baseUrl}/messages/${messageId}/suggested?user=${user}`,
      {
        method: "GET",
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify get suggestions error: ${error}`);
    }

    return response.json();
  }

  async textToAudio(text: string, user: string, messageId?: string): Promise<ArrayBuffer> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/text-to-audio`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        text,
        user,
        message_id: messageId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify TTS error: ${error}`);
    }

    return response.arrayBuffer();
  }

  async audioToText(audioFile: ArrayBuffer, user: string): Promise<{ text: string }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(audioFile)]), "audio.wav");
    formData.append("user", user);

    const response = await fetch(`${this.config.baseUrl}/audio-to-text`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify STT error: ${error}`);
    }

    return response.json();
  }

  async getAppParameters(): Promise<{
    opening_statement: string;
    suggested_questions: string[];
    suggested_questions_after_answer: { enabled: boolean };
    speech_to_text: { enabled: boolean };
    text_to_speech: { enabled: boolean; voice: string; language: string };
    retriever_resource: { enabled: boolean };
    annotation_reply: { enabled: boolean };
    user_input_form: Array<{
      "text-input"?: { label: string; variable: string; required: boolean; default: string };
      "paragraph"?: { label: string; variable: string; required: boolean; default: string };
      "select"?: { label: string; variable: string; required: boolean; options: string[] };
    }>;
    file_upload: { image: { enabled: boolean; number_limits: number; transfer_methods: string[] } };
    system_parameters: { file_size_limit: number; image_file_size_limit: number };
  }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/parameters`, {
      method: "GET",
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify get parameters error: ${error}`);
    }

    return response.json();
  }

  async getAppMeta(): Promise<{
    tool_icons: Record<string, { background: string; content: string } | string>;
  }> {
    if (!this.isConfigured) {
      throw new Error("Dify API key not configured");
    }

    const response = await fetch(`${this.config.baseUrl}/meta`, {
      method: "GET",
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify get meta error: ${error}`);
    }

    return response.json();
  }
}

export const DIFY_CAPABILITIES = {
  name: "Dify Agentic Workflow Platform",
  version: "1.8+",
  features: [
    "Visual Workflow Builder",
    "Multi-LLM Support (50+ models)",
    "RAG Engine with Vector DB Integration",
    "Agent Framework with Tool Calling",
    "Prompt Orchestration",
    "LLMOps & Monitoring",
    "MCP Protocol Support",
    "Plugin System",
    "Self-Hosting Option"
  ],
  endpoints: {
    workflows: "/workflows/run",
    chat: "/chat-messages",
    completion: "/completion-messages",
    conversations: "/conversations",
    messages: "/messages",
    parameters: "/parameters",
    tts: "/text-to-audio",
    stt: "/audio-to-text"
  },
  supportedLLMs: [
    "OpenAI GPT-4 Turbo",
    "OpenAI GPT-4 Vision",
    "Anthropic Claude",
    "DeepSeek",
    "Llama 2/3",
    "Gemini",
    "Mistral",
    "Cohere",
    "Local models via Ollama"
  ],
  integrations: [
    "Qdrant",
    "Weaviate",
    "Milvus/Zilliz",
    "Google Search",
    "DALL-E",
    "Stable Diffusion",
    "WolframAlpha",
    "Firecrawl"
  ]
};

export const difyIntegration = new DifyIntegration();
export default difyIntegration;
