CREATE TABLE "ab_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"variant_a" jsonb NOT NULL,
	"variant_b" jsonb NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"results" jsonb DEFAULT '{}',
	"confidence" numeric(5, 2) DEFAULT '0',
	"winner" text,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "action_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"estimated_duration" text,
	"phases" jsonb NOT NULL,
	"tasks" jsonb NOT NULL,
	"dependencies" jsonb DEFAULT '[]',
	"risks" jsonb DEFAULT '[]',
	"resources" jsonb DEFAULT '[]',
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"tier" text NOT NULL,
	"category" text NOT NULL,
	"specialization" text NOT NULL,
	"capabilities" jsonb DEFAULT '[]' NOT NULL,
	"skillset" jsonb DEFAULT '[]' NOT NULL,
	"task_types" jsonb DEFAULT '[]' NOT NULL,
	"system_prompt" text NOT NULL,
	"preferred_models" jsonb DEFAULT '["kimi", "anthropic", "openai"]' NOT NULL,
	"model_config" jsonb DEFAULT '{}',
	"coordination_pattern" text DEFAULT 'parallel' NOT NULL,
	"collaborates_with_agents" jsonb DEFAULT '[]',
	"depends_on_agents" jsonb DEFAULT '[]',
	"output_for_agents" jsonb DEFAULT '[]',
	"baseline_metrics" jsonb DEFAULT '{}',
	"performance_targets" jsonb DEFAULT '{}',
	"runtime_config" jsonb DEFAULT '{}',
	"resource_requirements" jsonb DEFAULT '{}',
	"workflow_patterns" jsonb DEFAULT '[]',
	"execution_context" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"is_available" boolean DEFAULT true,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_catalog_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "agent_communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" text NOT NULL,
	"from_agent_id" text NOT NULL,
	"from_instance_id" uuid,
	"to_agent_id" text NOT NULL,
	"to_instance_id" uuid,
	"message_type" text NOT NULL,
	"subject" text,
	"content" jsonb NOT NULL,
	"channel" text DEFAULT 'default',
	"session_id" text,
	"workflow_id" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"requires_response" boolean DEFAULT false,
	"response_to_id" uuid,
	"conversation_id" text,
	"sent_at" timestamp DEFAULT now(),
	"delivered_at" timestamp,
	"acknowledged_at" timestamp,
	"processed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"context" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_communications_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "agent_coordination" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coordination_id" text NOT NULL,
	"type" text NOT NULL,
	"strategy" text NOT NULL,
	"coordinator_agent_id" text,
	"participant_agents" jsonb DEFAULT '[]' NOT NULL,
	"rules" jsonb NOT NULL,
	"constraints" jsonb DEFAULT '{}',
	"priorities" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"state" jsonb DEFAULT '{}',
	"decisions_count" integer DEFAULT 0,
	"successful_decisions" integer DEFAULT 0,
	"average_decision_time" integer DEFAULT 0,
	"config" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_coordination_coordination_id_unique" UNIQUE("coordination_id")
);
--> statement-breakpoint
CREATE TABLE "agent_event_bus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_category" text NOT NULL,
	"source_agent_id" text,
	"source_instance_id" uuid,
	"payload" jsonb NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"channels" jsonb DEFAULT '[]',
	"subscribers" jsonb DEFAULT '[]',
	"status" text DEFAULT 'published' NOT NULL,
	"delivery_attempts" integer DEFAULT 0,
	"user_id" varchar,
	"session_id" text,
	"workflow_id" text,
	"trace_id" text,
	"timestamp" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_event_bus_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "agent_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"agent_type" text NOT NULL,
	"task_description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agent_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"custom_config" jsonb DEFAULT '{}',
	"runtime_overrides" jsonb DEFAULT '{}',
	"status" text DEFAULT 'initializing' NOT NULL,
	"health" text DEFAULT 'unknown' NOT NULL,
	"last_heartbeat" timestamp,
	"memory_usage_mb" integer DEFAULT 0,
	"cpu_usage_percent" numeric(5, 2) DEFAULT '0',
	"requests_handled" integer DEFAULT 0,
	"average_response_time" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '100',
	"error_count" integer DEFAULT 0,
	"session_id" text,
	"user_id" varchar,
	"organization_id" integer,
	"context" jsonb DEFAULT '{}',
	"short_term_memory" jsonb DEFAULT '{}',
	"current_task" text,
	"started_at" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now(),
	"stopped_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_instances_instance_id_unique" UNIQUE("instance_id")
);
--> statement-breakpoint
CREATE TABLE "agent_loading_system" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"agent_type" varchar(100) NOT NULL,
	"loading_strategy" varchar(50) DEFAULT 'on_demand',
	"memory_usage" integer,
	"cpu_usage" integer,
	"initialization_time" integer,
	"last_used" timestamp,
	"usage_frequency" integer DEFAULT 0,
	"keep_alive_time" integer DEFAULT 300,
	"dependencies" jsonb DEFAULT '[]',
	"resource_limits" jsonb DEFAULT '{}',
	"is_loaded" boolean DEFAULT false,
	"load_count" integer DEFAULT 0,
	"unload_count" integer DEFAULT 0,
	"average_session_time" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_loading_system_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "agent_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"instance_id" uuid,
	"user_id" varchar,
	"memory_type" text NOT NULL,
	"context" text NOT NULL,
	"scope" text NOT NULL,
	"content" jsonb NOT NULL,
	"embedding" jsonb,
	"importance" integer DEFAULT 5,
	"confidence" numeric(3, 2) DEFAULT '1.0',
	"strength" numeric(3, 2) DEFAULT '1.0',
	"access_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"neural_patterns" jsonb DEFAULT '{}',
	"associations" jsonb DEFAULT '[]',
	"expires_at" timestamp,
	"is_archived" boolean DEFAULT false,
	"session_id" text,
	"workflow_id" text,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_memory_memory_id_unique" UNIQUE("memory_id")
);
--> statement-breakpoint
CREATE TABLE "agent_monitoring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"instance_id" uuid,
	"task_id" text,
	"operation" text NOT NULL,
	"llm_provider" text,
	"llm_model" text,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"total_tokens" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"quality_score" numeric(3, 2),
	"hallucination_detected" boolean DEFAULT false,
	"factuality_score" numeric(3, 2),
	"coherence_score" numeric(3, 2),
	"cost" numeric(8, 6),
	"cost_currency" text DEFAULT 'USD',
	"input" jsonb,
	"output" jsonb,
	"success" boolean DEFAULT true,
	"error_type" text,
	"error_message" text,
	"error_details" jsonb,
	"user_id" varchar,
	"session_id" text,
	"workflow_id" text,
	"environment" text DEFAULT 'production',
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_monitoring_trace_id_unique" UNIQUE("trace_id")
);
--> statement-breakpoint
CREATE TABLE "agent_performance_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text,
	"instance_id" uuid,
	"user_id" varchar,
	"period_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0,
	"successful_requests" integer DEFAULT 0,
	"failed_requests" integer DEFAULT 0,
	"average_response_time" integer DEFAULT 0,
	"average_quality_score" numeric(3, 2),
	"hallucination_rate" numeric(5, 4),
	"factuality_rate" numeric(5, 4),
	"total_cost" numeric(8, 2),
	"average_cost_per_request" numeric(8, 6),
	"total_tokens_used" integer DEFAULT 0,
	"average_tokens_per_request" integer DEFAULT 0,
	"tasks_completed" integer DEFAULT 0,
	"average_task_duration" integer DEFAULT 0,
	"task_success_rate" numeric(5, 2) DEFAULT '0',
	"average_memory_usage" integer DEFAULT 0,
	"average_cpu_usage" numeric(5, 2) DEFAULT '0',
	"performance_data" jsonb DEFAULT '{}',
	"trends" jsonb DEFAULT '{}',
	"insights" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_agent_performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"value" real NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"session_id" text,
	"request_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_agent_policy_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar(255) NOT NULL,
	"policy_id" varchar(255) NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" varchar(255),
	"overrides" jsonb DEFAULT '{}'::jsonb,
	"exemptions" jsonb DEFAULT '[]'::jsonb,
	"last_evaluated" timestamp,
	"compliance_status" varchar(20) DEFAULT 'unknown'
);
--> statement-breakpoint
CREATE TABLE "agent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"agent_type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_task" text,
	"metadata" jsonb,
	"last_activity" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_agent_skill_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar(255) NOT NULL,
	"skill_id" varchar(255) NOT NULL,
	"proficiency_level" varchar(20) DEFAULT 'intermediate',
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" varchar(255),
	"validated_at" timestamp,
	"validation_status" varchar(20) DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "agent_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"instance_id" uuid,
	"assigned_by" text,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"context" jsonb DEFAULT '{}' NOT NULL,
	"input_data" jsonb DEFAULT '{}',
	"requirements" jsonb DEFAULT '{}',
	"constraints" jsonb DEFAULT '{}',
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"result" jsonb,
	"output_data" jsonb,
	"artifacts" jsonb DEFAULT '[]',
	"estimated_duration" integer,
	"actual_duration" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"quality_score" numeric(3, 2),
	"validation_results" jsonb,
	"feedback" text,
	"error_message" text,
	"error_details" jsonb,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"parent_task_id" text,
	"depends_on_tasks" jsonb DEFAULT '[]',
	"child_tasks" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_tasks_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "agent_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"roma_level" text NOT NULL,
	"system_prompt" text NOT NULL,
	"capabilities" jsonb DEFAULT '[]',
	"tool_ids" jsonb DEFAULT '[]',
	"model_preferences" jsonb DEFAULT '{}',
	"config_template" jsonb DEFAULT '{}',
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "wai_agent_version_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"version" varchar(50) NOT NULL,
	"previous_version" varchar(50),
	"change_type" varchar(50) NOT NULL,
	"change_description" text,
	"changed_by" varchar(255),
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"config_snapshot" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"rollback_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"personality" text DEFAULT 'helpful',
	"capabilities" jsonb DEFAULT '[]',
	"knowledge_base_id" integer,
	"prompt_template_id" integer,
	"api_endpoint" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" text DEFAULT '1.0',
	"usage" jsonb DEFAULT '{}',
	"performance" jsonb DEFAULT '{}',
	"integrations" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistants_enhanced" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"languages" jsonb DEFAULT '["English"]',
	"capabilities" jsonb DEFAULT '["Text"]',
	"rag_config" jsonb DEFAULT '{}',
	"voice_config" jsonb,
	"embedding" jsonb,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assistant_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"assistant_id" uuid NOT NULL,
	"total_conversations" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"satisfaction_score" numeric(5, 2) DEFAULT '0',
	"avg_response_time" numeric(8, 2) DEFAULT '0',
	"success_rate" numeric(5, 2) DEFAULT '0',
	"date" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assistant_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assistant_id" uuid NOT NULL,
	"version" text NOT NULL,
	"changes" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "avatar_3d_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"assistant_id" integer,
	"asset_type" varchar(50) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"metadata" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "avatar_3d_assistants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar(255) NOT NULL,
	"description" text,
	"avatar_config" jsonb NOT NULL,
	"personality_prompt" text,
	"knowledge_bases" jsonb DEFAULT '[]',
	"languages" jsonb DEFAULT '["en"]',
	"voice_profile" jsonb DEFAULT '{"provider": "elevenlabs", "voiceId": "default", "emotionRange": "full"}',
	"immersive_features" jsonb DEFAULT '["3d-avatar", "voice-synthesis", "spatial-audio"]',
	"llm_provider" text DEFAULT 'kimi-k2',
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"average_response_time" integer DEFAULT 0,
	"user_rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brand_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"size" text,
	"format" text,
	"dimensions" jsonb,
	"color_palette" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"version" text DEFAULT '1.0',
	"status" text DEFAULT 'pending' NOT NULL,
	"compliance" jsonb DEFAULT '{}',
	"usage" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"primary_color" text,
	"secondary_colors" jsonb DEFAULT '[]',
	"fonts" jsonb DEFAULT '[]',
	"guidelines" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"compliance" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_solutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"industry" varchar(100) NOT NULL,
	"business_size" varchar(50) NOT NULL,
	"features" jsonb DEFAULT '[]',
	"integrations" jsonb DEFAULT '[]',
	"configuration" jsonb DEFAULT '{}',
	"status" varchar(50) DEFAULT 'draft',
	"implementation_progress" integer DEFAULT 0,
	"estimated_implementation_time" integer,
	"actual_implementation_time" integer DEFAULT 0,
	"business_value" text,
	"expected_roi" integer,
	"actual_roi" integer,
	"kpi_metrics" jsonb DEFAULT '{}',
	"is_deployed" boolean DEFAULT false,
	"deployment_url" text,
	"deployment_environment" varchar(50) DEFAULT 'staging',
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"user_satisfaction_score" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" varchar,
	"agent_type" text,
	"content" jsonb NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"parent_message_id" integer,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"reactions" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"session_name" text,
	"type" text DEFAULT 'ai_chat' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"details" jsonb DEFAULT '{}',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'idle' NOT NULL,
	"permissions" jsonb DEFAULT '{}',
	"document_content" jsonb DEFAULT '{}',
	"version" jsonb DEFAULT '{}',
	"last_activity" timestamp DEFAULT now(),
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"platform" text NOT NULL,
	"metrics" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"aggregated_data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "content_analytics_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"platform" text NOT NULL,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"downloads" integer DEFAULT 0,
	"engagement_rate" text,
	"reach_data" jsonb DEFAULT '{}',
	"demographic_data" jsonb DEFAULT '{}',
	"performance_score" integer,
	"ai_insights" jsonb,
	"recorded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" varchar,
	"permissions" jsonb DEFAULT '["view", "comment"]',
	"role" text DEFAULT 'viewer',
	"invited_by" integer,
	"accepted_at" timestamp,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" varchar,
	"parent_id" integer,
	"comment" text NOT NULL,
	"attachments" jsonb DEFAULT '[]',
	"resolved" boolean DEFAULT false,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_id" uuid,
	"path" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"content" text,
	"url" text,
	"size" integer DEFAULT 0,
	"folder_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"author" text NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"quality" integer,
	"brand_voice" text,
	"language" text DEFAULT 'English',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" varchar NOT NULL,
	"content_type" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"prompt" text,
	"generated_content" jsonb,
	"metadata" jsonb DEFAULT '{}',
	"output_url" text,
	"processing_time" integer,
	"cost" integer,
	"quality" integer,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_publishing_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"version_id" integer,
	"published_by" integer,
	"published_to" jsonb NOT NULL,
	"publish_url" text,
	"publish_metadata" jsonb DEFAULT '{}',
	"status" text NOT NULL,
	"published_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_scheduling" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" varchar,
	"scheduled_for" timestamp NOT NULL,
	"publish_to" jsonb DEFAULT '[]',
	"publish_settings" jsonb DEFAULT '{}',
	"status" text DEFAULT 'scheduled',
	"published_at" timestamp,
	"error_log" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" varchar,
	"version" integer DEFAULT 1 NOT NULL,
	"content_type" text NOT NULL,
	"content_data" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"change_log" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "database_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"connection_string" text,
	"host" text,
	"port" integer,
	"database" text,
	"username" text,
	"status" text DEFAULT 'pending',
	"last_ping" timestamp,
	"connection_errors" jsonb DEFAULT '[]',
	"schema" jsonb DEFAULT '{}',
	"tables" jsonb DEFAULT '[]',
	"last_schema_sync" timestamp,
	"auto_sync" boolean DEFAULT false,
	"sync_rules" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"platform" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"url" text,
	"configuration" jsonb,
	"logs" text[],
	"created_at" timestamp DEFAULT now(),
	"deployed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "document_processing_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_path" text NOT NULL,
	"processing_type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"priority" integer DEFAULT 5,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "document_processing_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid NOT NULL,
	"extracted_text" text,
	"extracted_metadata" jsonb DEFAULT '{}',
	"processing_time_ms" integer,
	"success" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"version" text NOT NULL,
	"content" jsonb NOT NULL,
	"changes" jsonb DEFAULT '[]',
	"size" text,
	"status" text DEFAULT 'current' NOT NULL,
	"branches" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enterprise_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"credentials" jsonb,
	"auth_type" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"status" text DEFAULT 'pending',
	"last_sync" timestamp,
	"sync_errors" jsonb DEFAULT '[]',
	"config" jsonb DEFAULT '{}',
	"field_mappings" jsonb DEFAULT '{}',
	"sync_rules" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_registry" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"feature_type" text DEFAULT 'fullstack' NOT NULL,
	"has_database" boolean DEFAULT false,
	"database_tables" jsonb DEFAULT '[]',
	"has_api" boolean DEFAULT false,
	"api_endpoints" jsonb DEFAULT '[]',
	"has_frontend" boolean DEFAULT false,
	"frontend_components" jsonb DEFAULT '[]',
	"implementation_files" jsonb DEFAULT '[]',
	"status" text DEFAULT 'active' NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"registered_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "feature_registry_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"analysis" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"user_id" varchar,
	"session_id" varchar(255),
	"session_duration" integer,
	"level_completed" integer,
	"score" integer,
	"actions" jsonb DEFAULT '[]',
	"therapeutic_metrics" jsonb DEFAULT '{}',
	"learning_progress" jsonb DEFAULT '{}',
	"device_type" varchar(50),
	"platform" varchar(50),
	"location" varchar(100),
	"click_count" integer DEFAULT 0,
	"pause_count" integer DEFAULT 0,
	"quit_reason" varchar(100),
	"played_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"user_id" varchar NOT NULL,
	"asset_type" varchar(50) NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"asset_url" text NOT NULL,
	"file_size" integer,
	"dimensions" jsonb,
	"ai_provider" varchar(50),
	"generation_prompt" text,
	"metadata" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"game_type" varchar(50) NOT NULL,
	"target_demographic" jsonb DEFAULT '[]',
	"game_config" jsonb NOT NULL,
	"scene_data" jsonb DEFAULT '{}',
	"asset_library" jsonb DEFAULT '[]',
	"game_logic" jsonb DEFAULT '{}',
	"ai_providers" jsonb DEFAULT '{"graphics": "scenario", "audio": "elevenlabs", "music": "beatoven"}',
	"generation_prompts" jsonb DEFAULT '{}',
	"style_guide" jsonb DEFAULT '{}',
	"therapeutic_objectives" jsonb DEFAULT '[]',
	"educational_goals" jsonb DEFAULT '[]',
	"accessibility_features" jsonb DEFAULT '[]',
	"status" varchar(50) DEFAULT 'draft',
	"build_progress" integer DEFAULT 0,
	"last_build_at" timestamp,
	"is_published" boolean DEFAULT false,
	"published_url" text,
	"embed_code" text,
	"monetization_enabled" boolean DEFAULT false,
	"ad_networks" jsonb DEFAULT '[]',
	"tournament_enabled" boolean DEFAULT false,
	"play_count" integer DEFAULT 0,
	"average_session_time" integer DEFAULT 0,
	"user_rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_revenue" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"user_id" varchar NOT NULL,
	"revenue_type" varchar(50) NOT NULL,
	"ad_network" varchar(50),
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"transaction_id" varchar(255),
	"payment_status" varchar(50) DEFAULT 'completed',
	"platform_fee" integer DEFAULT 0,
	"net_amount" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"processed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"target_demographic" jsonb DEFAULT '[]',
	"thumbnail_url" text,
	"game_config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"max_participants" integer,
	"entry_fee" integer DEFAULT 0,
	"prize_pool" integer DEFAULT 0,
	"tournament_type" varchar(50) DEFAULT 'single-elimination',
	"status" varchar(50) DEFAULT 'upcoming',
	"rules" jsonb DEFAULT '{}',
	"leaderboard" jsonb DEFAULT '[]',
	"total_players" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"template_id" integer,
	"user_id" integer,
	"config" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"performance_metrics" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "github_repositories" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"github_repo_id" text NOT NULL,
	"repo_name" text NOT NULL,
	"repo_url" text NOT NULL,
	"clone_url" text NOT NULL,
	"default_branch" text DEFAULT 'main',
	"last_sync_at" timestamp,
	"sync_status" text DEFAULT 'pending',
	"sync_errors" jsonb DEFAULT '[]',
	"auto_sync" boolean DEFAULT true,
	"branches" jsonb DEFAULT '[]',
	"webhook_id" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "immersive_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"assistant_id" integer,
	"name" varchar(255) NOT NULL,
	"experience_type" varchar(50) NOT NULL,
	"scene_config" jsonb NOT NULL,
	"interaction_map" jsonb DEFAULT '{}',
	"spatial_elements" jsonb DEFAULT '[]',
	"voice_commands" jsonb DEFAULT '[]',
	"performance_metrics" jsonb DEFAULT '{"fps": 60, "renderTime": 16}',
	"deployment_targets" jsonb DEFAULT '["web"]',
	"webxr_support" boolean DEFAULT true,
	"game_engine_integration" jsonb DEFAULT '[]',
	"is_published" boolean DEFAULT false,
	"access_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kb_document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer DEFAULT 0,
	"embedding" jsonb,
	"metadata" jsonb DEFAULT '{}',
	"start_position" integer,
	"end_position" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kb_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_base_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"document_type" text NOT NULL,
	"file_path" text,
	"url" text,
	"metadata" jsonb DEFAULT '{}',
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'processing',
	"embeddings" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_accessed_at" timestamp,
	"word_count" integer DEFAULT 0,
	"character_count" integer DEFAULT 0,
	"language" text DEFAULT 'en',
	"checksum" text
);
--> statement-breakpoint
CREATE TABLE "kb_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_id" uuid,
	"embedding_model" text NOT NULL,
	"embedding" jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kimi_k2_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"api_key_encrypted" text NOT NULL,
	"api_key_hash" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"model_preferences" jsonb DEFAULT '{"model": "kimi-k2-instruct", "temperature": 0.6}',
	"cost_limits" jsonb DEFAULT '{"dailyLimit": 100, "monthlyLimit": 1000}',
	"usage_stats" jsonb DEFAULT '{"tokensUsed": 0, "costAccumulated": 0}',
	"agentic_features" jsonb DEFAULT '{"toolCalling": true, "autonomousExecution": true}',
	"multilingual_settings" jsonb DEFAULT '{"primaryLanguage": "en", "supportedLanguages": ["en", "hi", "ta", "te", "bn"]}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_bases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" integer NOT NULL,
	"organization_id" integer,
	"type" text DEFAULT 'personal' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}',
	"statistics" jsonb DEFAULT '{}',
	"permissions" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_indexed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "llm_cost_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"cost" numeric(10, 6) NOT NULL,
	"tokens_used" integer NOT NULL,
	"response_time" integer,
	"status" text DEFAULT 'success' NOT NULL,
	"user_id" varchar,
	"project_id" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "llm_provider_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"enabled" boolean DEFAULT false,
	"api_key" text,
	"models" jsonb DEFAULT '[]',
	"default_model" text,
	"priority" integer DEFAULT 10,
	"cost_per_token" numeric(10, 8) DEFAULT '0.00001',
	"daily_limit" numeric(10, 2) DEFAULT '100',
	"monthly_limit" numeric(10, 2) DEFAULT '3000',
	"alert_threshold" integer DEFAULT 80,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "llm_provider_config_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "llm_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"base_url" text,
	"api_key_required" boolean DEFAULT true NOT NULL,
	"models" jsonb DEFAULT '[]' NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"success_rate" numeric DEFAULT '99.00' NOT NULL,
	"cost_per_token" numeric,
	"description" text,
	"type" text DEFAULT 'language-model',
	"cost_tier" text DEFAULT 'medium',
	"documentation" text,
	"capabilities" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mcp_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer,
	"tool_id" integer,
	"server_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"execution_count" integer DEFAULT 0,
	"last_executed_at" timestamp,
	"config" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mcp_servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"protocol" text DEFAULT 'http' NOT NULL,
	"is_active" boolean DEFAULT true,
	"health_status" text DEFAULT 'unknown',
	"last_health_check" timestamp,
	"capabilities" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mcp_servers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mcp_tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"server_id" integer,
	"input_schema" jsonb NOT NULL,
	"output_schema" jsonb,
	"is_enabled" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"average_execution_time" integer,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mcp_tools_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"agent_type" text,
	"metric_type" text NOT NULL,
	"value" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"plan" text DEFAULT 'alpha' NOT NULL,
	"settings" jsonb DEFAULT '{}',
	"max_members" integer DEFAULT 5,
	"owner_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p0_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"milestone_id" text NOT NULL,
	"phase_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"target_date" timestamp,
	"actual_date" timestamp,
	"completion_percentage" integer DEFAULT 0,
	"quality_gates_passed" integer DEFAULT 0,
	"quality_gates_total" integer DEFAULT 0,
	"owner" text,
	"success_criteria" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"blockers" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "p0_milestones_milestone_id_unique" UNIQUE("milestone_id")
);
--> statement-breakpoint
CREATE TABLE "p0_progress_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metric_type" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"value" numeric(10, 2),
	"unit" text,
	"target" numeric(10, 2),
	"variance" numeric(10, 2),
	"trend" text,
	"details" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "p0_progress_metrics_metric_id_unique" UNIQUE("metric_id")
);
--> statement-breakpoint
CREATE TABLE "p0_quality_gates" (
	"id" serial PRIMARY KEY NOT NULL,
	"gate_id" text NOT NULL,
	"task_id" text,
	"milestone_id" text,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"required" boolean DEFAULT true,
	"checks" jsonb DEFAULT '[]',
	"thresholds" jsonb DEFAULT '{}',
	"results" jsonb DEFAULT '{}',
	"score" integer,
	"max_score" integer,
	"executed_at" timestamp,
	"executed_by" text,
	"failure_reason" text,
	"remediation_plan" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "p0_quality_gates_gate_id_unique" UNIQUE("gate_id")
);
--> statement-breakpoint
CREATE TABLE "p0_roadmap_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"start_date" timestamp,
	"target_end_date" timestamp,
	"actual_end_date" timestamp,
	"duration_weeks" integer,
	"completion_percentage" integer DEFAULT 0,
	"owner" text,
	"dependencies" jsonb DEFAULT '[]',
	"objectives" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"risks" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "p0_roadmap_phases_phase_id_unique" UNIQUE("phase_id")
);
--> statement-breakpoint
CREATE TABLE "p0_task_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"depends_on_task_id" text NOT NULL,
	"dependency_type" text DEFAULT 'finish_to_start' NOT NULL,
	"is_blocking" boolean DEFAULT true,
	"lead_time" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p0_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"milestone_id" text NOT NULL,
	"phase_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assignee" text,
	"estimated_hours" integer,
	"actual_hours" integer,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_date" timestamp,
	"completion_percentage" integer DEFAULT 0,
	"complexity" text DEFAULT 'medium',
	"technical_debt" boolean DEFAULT false,
	"quality_checks" jsonb DEFAULT '[]',
	"test_coverage" integer DEFAULT 0,
	"code_review_status" text,
	"architect_reviewed" boolean DEFAULT false,
	"blockers" jsonb DEFAULT '[]',
	"notes" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "p0_tasks_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"component" varchar(100) NOT NULL,
	"component_id" varchar(100),
	"value" text NOT NULL,
	"unit" varchar(20) NOT NULL,
	"threshold" text,
	"critical_threshold" text,
	"timestamp" timestamp DEFAULT now(),
	"tags" jsonb DEFAULT '{}',
	"environment" varchar(50) DEFAULT 'production'
);
--> statement-breakpoint
CREATE TABLE "wai_policy_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"policy_type" varchar(50) NOT NULL,
	"rules" jsonb NOT NULL,
	"enforcement" varchar(20) DEFAULT 'warn' NOT NULL,
	"scope" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"version" varchar(50) DEFAULT '1.0.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_policy_definitions_policy_id_unique" UNIQUE("policy_id")
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'collaborator' NOT NULL,
	"permissions" jsonb DEFAULT '["read", "comment"]',
	"invited_by" integer,
	"invited_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "project_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"tech_stack" jsonb DEFAULT '[]',
	"architecture" jsonb DEFAULT '{}',
	"features" jsonb DEFAULT '[]',
	"timeline" jsonb DEFAULT '[]',
	"cost" jsonb DEFAULT '{}',
	"risks" jsonb DEFAULT '[]',
	"dependencies" jsonb DEFAULT '[]',
	"complexity" text DEFAULT 'moderate' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"cpu" integer DEFAULT 0,
	"memory" integer DEFAULT 0,
	"storage" integer DEFAULT 0,
	"bandwidth" integer DEFAULT 0,
	"agents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"technologies" jsonb NOT NULL,
	"features" jsonb NOT NULL,
	"source_code" jsonb NOT NULL,
	"configuration" jsonb NOT NULL,
	"requirements" jsonb NOT NULL,
	"complexity" integer DEFAULT 3 NOT NULL,
	"estimated_time" text,
	"thumbnail" text,
	"screenshots" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"download_count" integer DEFAULT 0,
	"rating" integer DEFAULT 5,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_id" integer,
	"organization_id" integer,
	"created_by" varchar NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"requirements" jsonb,
	"analysis" jsonb,
	"action_plan" jsonb,
	"tech_stack" jsonb,
	"architecture" jsonb,
	"configuration" jsonb,
	"environment" jsonb,
	"deployment_config" jsonb,
	"progress" integer DEFAULT 0,
	"estimated_hours" integer,
	"actual_hours" integer DEFAULT 0,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"ai_context" jsonb,
	"chat_history" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"user_prompt_prefix" text,
	"response_format" text,
	"variables" jsonb DEFAULT '[]',
	"examples" jsonb DEFAULT '[]',
	"version" text DEFAULT '1.0',
	"category" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_provider_performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"model_id" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"value" real NOT NULL,
	"region" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "published_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"media_urls" jsonb DEFAULT '[]',
	"platforms" jsonb DEFAULT '[]',
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_time" timestamp,
	"published_time" timestamp,
	"analytics" jsonb DEFAULT '{}',
	"optimizations" jsonb DEFAULT '{}',
	"hashtags" jsonb DEFAULT '[]',
	"mentions" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rag_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"user_id" varchar NOT NULL,
	"turn" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rag_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_queries" integer DEFAULT 0,
	"active_sessions" integer DEFAULT 0,
	"average_response_time" integer,
	"average_quality_score" numeric(3, 2),
	"total_queries" integer DEFAULT 0,
	"successful_queries" integer DEFAULT 0,
	"failed_queries" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rag_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" text,
	"query" text NOT NULL,
	"knowledge_base_ids" jsonb DEFAULT '[]',
	"context" jsonb DEFAULT '{}',
	"options" jsonb DEFAULT '{}',
	"response" text,
	"sources" jsonb DEFAULT '[]',
	"confidence" numeric(3, 2),
	"quality_score" numeric(3, 2),
	"retrieval_time_ms" integer,
	"generation_time_ms" integer,
	"total_time_ms" integer,
	"strategy" text,
	"tokens_used" integer,
	"cost" numeric(8, 6),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roadmap_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"technology" varchar(100),
	"platform" varchar(100),
	"estimated_weeks" integer DEFAULT 1,
	"actual_weeks" integer,
	"status" varchar(50) DEFAULT 'planned',
	"priority" varchar(20) DEFAULT 'medium',
	"complexity" varchar(20) DEFAULT 'medium',
	"dependencies" jsonb DEFAULT '[]',
	"assigned_agents" jsonb DEFAULT '[]',
	"required_llms" jsonb DEFAULT '[]',
	"integration_targets" jsonb DEFAULT '[]',
	"testing_criteria" jsonb DEFAULT '[]',
	"performance_metrics" jsonb DEFAULT '{}',
	"implementation_notes" text,
	"blocking_issues" jsonb DEFAULT '[]',
	"completion_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roadmap_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer,
	"platform_id" varchar(100) NOT NULL,
	"integration_level" varchar(50) NOT NULL,
	"wai_components" jsonb DEFAULT '[]',
	"api_endpoints" jsonb DEFAULT '[]',
	"database_changes" jsonb DEFAULT '[]',
	"agent_enhancements" jsonb DEFAULT '[]',
	"llm_provider_changes" jsonb DEFAULT '[]',
	"user_flow_impact" jsonb DEFAULT '[]',
	"performance_impact" jsonb DEFAULT '{}',
	"integration_status" varchar(50) DEFAULT 'planned',
	"test_results" jsonb DEFAULT '{}',
	"rollback_plan" text,
	"integration_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roadmap_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"phase" varchar(50) NOT NULL,
	"quarter" varchar(10) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'planned',
	"priority" varchar(20) DEFAULT 'medium',
	"budget" integer,
	"actual_cost" integer DEFAULT 0,
	"progress_percentage" integer DEFAULT 0,
	"dependencies" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"risks" jsonb DEFAULT '[]',
	"milestones" jsonb DEFAULT '[]',
	"team_members" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "room_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"permissions" jsonb DEFAULT '{}',
	"cursor" jsonb,
	"last_seen" timestamp DEFAULT now(),
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sdlc_workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" text NOT NULL,
	"template_id" integer NOT NULL,
	"template_name" text NOT NULL,
	"project_id" integer,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" jsonb DEFAULT '{"completedSteps": 0, "totalSteps": 0, "currentStep": null, "estimatedCompletion": null}' NOT NULL,
	"current_step_id" text,
	"customizations" jsonb DEFAULT '{}',
	"outputs" jsonb DEFAULT '{}',
	"execution_log" jsonb DEFAULT '[]',
	"errors" jsonb DEFAULT '[]',
	"started_at" timestamp,
	"paused_at" timestamp,
	"completed_at" timestamp,
	"estimated_completion_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sdlc_workflow_executions_execution_id_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "sdlc_workflow_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"phase" text NOT NULL,
	"description" text NOT NULL,
	"complexity" text NOT NULL,
	"estimated_duration" integer NOT NULL,
	"team_size" text NOT NULL,
	"technologies" jsonb DEFAULT '[]' NOT NULL,
	"deliverables" jsonb DEFAULT '[]' NOT NULL,
	"prerequisites" jsonb DEFAULT '[]' NOT NULL,
	"success_criteria" jsonb DEFAULT '[]' NOT NULL,
	"risk_mitigation" jsonb DEFAULT '[]' NOT NULL,
	"steps" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"version" text DEFAULT '1.0',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"knowledge_base_id" uuid,
	"query" text NOT NULL,
	"result_count" integer DEFAULT 0,
	"clicked_results" jsonb DEFAULT '[]',
	"search_time_ms" integer,
	"search_method" text,
	"user_feedback" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wai_skill_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"required_capabilities" jsonb DEFAULT '[]'::jsonb,
	"validation_schema" jsonb DEFAULT '{}'::jsonb,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"conflicts" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"version" varchar(50) DEFAULT '1.0.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_skill_definitions_skill_id_unique" UNIQUE("skill_id")
);
--> statement-breakpoint
CREATE TABLE "social_platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"platform_user_id" text,
	"access_token" text,
	"refresh_token" text,
	"is_connected" boolean DEFAULT false,
	"permissions" jsonb DEFAULT '[]',
	"metrics" jsonb DEFAULT '{}',
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"price" text NOT NULL,
	"currency" text DEFAULT 'USD',
	"billing_cycle" text NOT NULL,
	"features" jsonb NOT NULL,
	"limits" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3B82F6',
	"icon" text DEFAULT 'folder',
	"organization_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"action_plan_id" integer,
	"category_id" integer,
	"agent_session_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"type" text DEFAULT 'development' NOT NULL,
	"assigned_to" integer,
	"assigned_agent" text,
	"created_by" varchar NOT NULL,
	"parent_task_id" integer,
	"dependencies" jsonb DEFAULT '[]',
	"blocked_by" jsonb DEFAULT '[]',
	"estimated_time" integer,
	"actual_time" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"due_date" timestamp,
	"tech_stack" jsonb DEFAULT '[]',
	"code_changes" jsonb,
	"test_results" jsonb,
	"deployment_info" jsonb,
	"result" jsonb,
	"feedback" text,
	"ai_analysis" jsonb,
	"quality_score" integer,
	"tags" jsonb DEFAULT '[]',
	"attachments" jsonb DEFAULT '[]',
	"notes" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" text NOT NULL,
	"key_name" text NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_hash" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_step" integer DEFAULT 1,
	"completed_steps" jsonb DEFAULT '[]',
	"plan_selected" boolean DEFAULT false,
	"api_keys_configured" boolean DEFAULT false,
	"first_project_created" boolean DEFAULT false,
	"profile_completed" boolean DEFAULT false,
	"invites_sent" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"permissions" jsonb DEFAULT '[]',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" text DEFAULT 'dark',
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"email_notifications" boolean DEFAULT true,
	"slack_notifications" boolean DEFAULT false,
	"webhook_url" text,
	"default_llm_provider" text DEFAULT 'openai',
	"max_concurrent_projects" integer DEFAULT 3,
	"preferences" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"password_hash" text,
	"status" text DEFAULT 'active',
	"first_name" text,
	"last_name" text,
	"salt" text,
	"google_id" text,
	"github_id" text,
	"replit_id" text,
	"avatar_url" text,
	"profile_image" text,
	"subscription_plan" text DEFAULT 'alpha' NOT NULL,
	"subscription_status" text DEFAULT 'trial' NOT NULL,
	"onboarding_completed" boolean DEFAULT false,
	"trial_expires_at" timestamp,
	"subscription_expires_at" timestamp,
	"permissions" jsonb DEFAULT '["project.create", "project.read"]'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp,
	"last_login_at" timestamp,
	"organization_id" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_replit_id_unique" UNIQUE("replit_id")
);
--> statement-breakpoint
CREATE TABLE "vector_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"dimension" integer NOT NULL,
	"metric" text DEFAULT 'cosine',
	"index_type" text DEFAULT 'hnsw',
	"metadata" jsonb DEFAULT '{}',
	"document_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vector_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"vector" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"document_reference" text,
	"namespace" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_agent_communication" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_agent_id" text NOT NULL,
	"to_agent_id" text NOT NULL,
	"message_type" text NOT NULL,
	"content" jsonb NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"session_id" text,
	"response_to_id" integer,
	"metadata" jsonb DEFAULT '{}',
	"sent_at" timestamp DEFAULT now(),
	"received_at" timestamp,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wai_agent_loading_system" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"agent_type" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'loaded' NOT NULL,
	"capabilities" jsonb DEFAULT '[]',
	"memory_usage_mb" integer,
	"cpu_usage_percent" numeric(5, 2),
	"requests_handled" integer DEFAULT 0,
	"average_response_time" integer,
	"last_activity" timestamp,
	"loaded_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}',
	CONSTRAINT "wai_agent_loading_system_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "wai_agent_registry_v9" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"category" text NOT NULL,
	"version" text DEFAULT '9.0.0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"capabilities" jsonb DEFAULT '[]',
	"expertise" jsonb DEFAULT '[]',
	"tools" jsonb DEFAULT '[]',
	"system_prompt" text,
	"performance" jsonb DEFAULT '{}',
	"self_healing_config" jsonb DEFAULT '{}',
	"quantum_capabilities" jsonb DEFAULT '[]',
	"real_time_processing" boolean DEFAULT true,
	"multi_modal_support" boolean DEFAULT false,
	"advanced_memory" jsonb DEFAULT '{}',
	"collaboration_protocols" jsonb DEFAULT '[]',
	"enterprise_features" jsonb DEFAULT '{}',
	"resource_requirements" jsonb DEFAULT '{}',
	"memory_usage_mb" integer,
	"cpu_usage_percent" numeric(5, 2),
	"requests_handled" integer DEFAULT 0,
	"average_response_time" integer,
	"success_rate" numeric(5, 2) DEFAULT '100.00',
	"last_activity" timestamp,
	"loaded_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_agent_registry_v9_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "wai_bmad_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"name" text NOT NULL,
	"asset_type" text NOT NULL,
	"organization_id" integer,
	"dependencies" jsonb DEFAULT '[]',
	"dependents" jsonb DEFAULT '[]',
	"asset_graph" jsonb DEFAULT '{}',
	"consistency_score" numeric(5, 2),
	"drift_detected" boolean DEFAULT false,
	"drift_metrics" jsonb DEFAULT '{}',
	"last_consistency_check" timestamp,
	"pre_render_enabled" boolean DEFAULT true,
	"pre_render_status" text DEFAULT 'pending',
	"pre_render_data" jsonb DEFAULT '{}',
	"continuity_score" numeric(5, 2),
	"continuity_reports" jsonb DEFAULT '[]',
	"business_continuity_impact" text,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_bmad_assets_asset_id_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "wai_bmad_coordination" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"coordination_id" text NOT NULL,
	"coordination_type" text NOT NULL,
	"participant_agents" jsonb DEFAULT '[]',
	"coordination_state" text DEFAULT 'initializing' NOT NULL,
	"task_distribution" jsonb DEFAULT '{}',
	"synchronization_points" jsonb DEFAULT '[]',
	"conflict_resolution" jsonb DEFAULT '{}',
	"performance_metrics" jsonb DEFAULT '{}',
	"quality_assurance" jsonb DEFAULT '{}',
	"execution_plan" jsonb DEFAULT '{}',
	"results" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_bmad_coordination_coordination_id_unique" UNIQUE("coordination_id")
);
--> statement-breakpoint
CREATE TABLE "wai_bmad_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"pattern_name" text NOT NULL,
	"pattern_type" text NOT NULL,
	"description" text,
	"pattern_definition" jsonb NOT NULL,
	"coordination_id" text,
	"created_by" varchar,
	"applicable_agents" jsonb DEFAULT '[]',
	"success_conditions" jsonb DEFAULT '{}',
	"failure_handling" jsonb DEFAULT '{}',
	"optimization_rules" jsonb DEFAULT '{}',
	"performance_metrics" jsonb DEFAULT '{}',
	"usage_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0.00',
	"average_execution_time" integer,
	"is_active" boolean DEFAULT true,
	"version" text DEFAULT '1.0.0',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_bmad_patterns_pattern_id_unique" UNIQUE("pattern_id")
);
--> statement-breakpoint
CREATE TABLE "wai_cam_clusters" (
	"id" serial PRIMARY KEY NOT NULL,
	"cluster_id" text NOT NULL,
	"cluster_name" text NOT NULL,
	"cluster_type" text NOT NULL,
	"description" text,
	"session_id" text,
	"user_id" varchar,
	"agent_id" text,
	"center_vector" jsonb DEFAULT '[]',
	"member_contexts" jsonb DEFAULT '[]',
	"cluster_metrics" jsonb DEFAULT '{}',
	"semantic_tags" jsonb DEFAULT '[]',
	"related_clusters" jsonb DEFAULT '[]',
	"access_patterns" jsonb DEFAULT '{}',
	"compression_rate" numeric(5, 2) DEFAULT '1.00',
	"relevance_score" numeric(5, 2) DEFAULT '0.00',
	"last_accessed" timestamp,
	"expiry_policy" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_cam_clusters_cluster_id_unique" UNIQUE("cluster_id")
);
--> statement-breakpoint
CREATE TABLE "wai_context_layers" (
	"id" serial PRIMARY KEY NOT NULL,
	"context_id" text NOT NULL,
	"session_id" text NOT NULL,
	"layer_type" text NOT NULL,
	"layer_level" integer NOT NULL,
	"context_data" jsonb DEFAULT '{}',
	"memory_type" text NOT NULL,
	"retention" jsonb DEFAULT '{}',
	"compression" jsonb DEFAULT '{}',
	"indexing" jsonb DEFAULT '{}',
	"relationships" jsonb DEFAULT '[]',
	"relevance_score" numeric(5, 2) DEFAULT '0.00',
	"access_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"expiry_date" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_context_layers_context_id_unique" UNIQUE("context_id")
);
--> statement-breakpoint
CREATE TABLE "wai_cost_optimizer" (
	"id" serial PRIMARY KEY NOT NULL,
	"optimization_id" text NOT NULL,
	"organization_id" integer,
	"optimization_goals" jsonb DEFAULT '{}',
	"constraints" jsonb DEFAULT '{}',
	"current_cost_analysis" jsonb DEFAULT '{}',
	"optimization_recommendations" jsonb DEFAULT '[]',
	"potential_savings" numeric(12, 2),
	"implemented_recommendations" jsonb DEFAULT '[]',
	"actual_savings" numeric(12, 2) DEFAULT '0.00',
	"auto_optimization_enabled" boolean DEFAULT false,
	"optimization_rules" jsonb DEFAULT '[]',
	"last_optimization_run" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_cost_optimizer_optimization_id_unique" UNIQUE("optimization_id")
);
--> statement-breakpoint
CREATE TABLE "wai_creative_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"capabilities" jsonb DEFAULT '[]',
	"specifications" jsonb DEFAULT '{}',
	"cost_structure" jsonb DEFAULT '{}',
	"processing_time" jsonb DEFAULT '{}',
	"quality_metrics" jsonb DEFAULT '{}',
	"output_formats" jsonb DEFAULT '[]',
	"input_requirements" jsonb DEFAULT '{}',
	"limitations" jsonb DEFAULT '{}',
	"api_endpoint" text,
	"authentication_method" text,
	"rate_limits" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_creative_models_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "wai_finops_budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"space_id" text,
	"budget_type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"period" text NOT NULL,
	"scope" jsonb DEFAULT '{}',
	"cost_filters" jsonb DEFAULT '{}',
	"alert_thresholds" jsonb DEFAULT '[50, 80, 95]',
	"notification_channels" jsonb DEFAULT '[]',
	"alert_history" jsonb DEFAULT '[]',
	"current_spend" numeric(12, 2) DEFAULT '0.00',
	"forecasted_spend" numeric(12, 2),
	"last_update_at" timestamp,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_finops_budgets_budget_id_unique" UNIQUE("budget_id")
);
--> statement-breakpoint
CREATE TABLE "wai_grpo_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"policy_name" text NOT NULL,
	"policy_type" text NOT NULL,
	"description" text,
	"training_job_id" text,
	"created_by" varchar,
	"target_agents" jsonb DEFAULT '[]',
	"policy_parameters" jsonb NOT NULL,
	"optimization_goals" jsonb DEFAULT '{}',
	"constraints" jsonb DEFAULT '{}',
	"reward_function" jsonb NOT NULL,
	"exploration_rate" numeric(5, 2) DEFAULT '0.10',
	"learning_rate" numeric(6, 4) DEFAULT '0.001',
	"discount_factor" numeric(5, 2) DEFAULT '0.95',
	"training_iterations" integer DEFAULT 0,
	"performance_metrics" jsonb DEFAULT '{}',
	"last_training_run" timestamp,
	"is_active" boolean DEFAULT true,
	"version" text DEFAULT '1.0.0',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_grpo_policies_policy_id_unique" UNIQUE("policy_id")
);
--> statement-breakpoint
CREATE TABLE "wai_grpo_training_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"training_type" text NOT NULL,
	"model_id" text,
	"base_model" text NOT NULL,
	"schedule_type" text DEFAULT 'manual',
	"cron_expression" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_config" jsonb DEFAULT '{}',
	"hyperparameters" jsonb DEFAULT '{}',
	"dataset_config" jsonb DEFAULT '{}',
	"canary_enabled" boolean DEFAULT true,
	"canary_percentage" integer DEFAULT 5,
	"canary_metrics" jsonb DEFAULT '{}',
	"canary_comparison_results" jsonb DEFAULT '{}',
	"rollback_threshold" numeric(5, 2) DEFAULT '95.00',
	"auto_rollback_enabled" boolean DEFAULT true,
	"rollback_plan" jsonb DEFAULT '{}',
	"training_metrics" jsonb DEFAULT '{}',
	"evaluation_results" jsonb DEFAULT '{}',
	"performance_comparison" jsonb DEFAULT '{}',
	"started_at" timestamp,
	"completed_at" timestamp,
	"deployed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_grpo_training_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "wai_incident_management" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" text NOT NULL,
	"category" text NOT NULL,
	"anomaly_class" text,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" integer,
	"organization_id" integer,
	"auto_retry_enabled" boolean DEFAULT true,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"circuit_breaker_triggered" boolean DEFAULT false,
	"early_exit_enabled" boolean DEFAULT true,
	"affected_services" jsonb DEFAULT '[]',
	"impact_scope" text,
	"business_impact" text,
	"resolution_steps" jsonb DEFAULT '[]',
	"root_cause" text,
	"prevention_measures" jsonb DEFAULT '[]',
	"detected_at" timestamp DEFAULT now(),
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_incident_management_incident_id_unique" UNIQUE("incident_id")
);
--> statement-breakpoint
CREATE TABLE "wai_india_pack_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"service_name" text NOT NULL,
	"service_type" text NOT NULL,
	"organization_id" integer,
	"supported_languages" jsonb DEFAULT '[]',
	"primary_language" text DEFAULT 'hindi',
	"language_models" jsonb DEFAULT '{}',
	"nlp_capabilities" jsonb DEFAULT '[]',
	"asr_models" jsonb DEFAULT '{}',
	"tts_voices" jsonb DEFAULT '{}',
	"whatsapp_business_account" text,
	"whatsapp_phone_number" text,
	"whatsapp_api_token" text,
	"whatsapp_templates" jsonb DEFAULT '[]',
	"message_journeys" jsonb DEFAULT '[]',
	"upi_provider_id" text,
	"upi_merchant_id" text,
	"upi_configuration" jsonb DEFAULT '{}',
	"payment_methods" jsonb DEFAULT '[]',
	"low_bandwidth_mode" boolean DEFAULT false,
	"compression_settings" jsonb DEFAULT '{}',
	"cache_configuration" jsonb DEFAULT '{}',
	"offline_capabilities" jsonb DEFAULT '{}',
	"timezone" text DEFAULT 'Asia/Kolkata',
	"currency" text DEFAULT 'INR',
	"region" text DEFAULT 'IN',
	"compliance_settings" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"health_metrics" jsonb DEFAULT '{}',
	"last_health_check" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_india_pack_services_service_id_unique" UNIQUE("service_id")
);
--> statement-breakpoint
CREATE TABLE "wai_llm_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"api_key_encrypted" text,
	"api_key_hash" text,
	"encryption_iv" text,
	"models" jsonb DEFAULT '[]',
	"capabilities" jsonb DEFAULT '[]',
	"cost_per_token" numeric(10, 6),
	"quality_score" numeric(3, 2),
	"latency_ms" integer,
	"max_tokens" integer,
	"metadata" jsonb DEFAULT '{}',
	"last_health_check" timestamp,
	"error_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_llm_providers_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "wai_llm_providers_v9" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"api_key_encrypted" text,
	"api_key_hash" text,
	"encryption_iv" text,
	"models" jsonb DEFAULT '[]',
	"capabilities" jsonb DEFAULT '[]',
	"cost_tier" text DEFAULT 'free' NOT NULL,
	"cost_per_token" numeric(12, 8),
	"quality_score" numeric(5, 2),
	"latency_ms" integer,
	"max_tokens" integer,
	"context_window" integer,
	"quantum_support" boolean DEFAULT false,
	"real_time_optimization" boolean DEFAULT true,
	"advanced_features" jsonb DEFAULT '[]',
	"deployment_regions" jsonb DEFAULT '["global"]',
	"rate_limit" jsonb DEFAULT '{}',
	"health_metrics" jsonb DEFAULT '{}',
	"last_health_check" timestamp,
	"error_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"total_requests" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_llm_providers_v9_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "wai_marketplace" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"short_description" text,
	"item_type" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"tags" jsonb DEFAULT '[]',
	"publisher_id" integer,
	"publisher_organization" integer,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"compatibility" jsonb DEFAULT '{}',
	"package_url" text,
	"documentation_url" text,
	"source_code_url" text,
	"demo_url" text,
	"screenshots" jsonb DEFAULT '[]',
	"pricing_model" text NOT NULL,
	"price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"billing_cycle" text,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"review_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"verification_status" text DEFAULT 'pending',
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"last_updated" timestamp,
	"requirements" jsonb DEFAULT '{}',
	"api_specification" jsonb DEFAULT '{}',
	"configuration_schema" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_marketplace_item_id_unique" UNIQUE("item_id")
);
--> statement-breakpoint
CREATE TABLE "wai_negotiation_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"negotiation_type" text NOT NULL,
	"initiator_agent_id" text NOT NULL,
	"workflow_execution_id" uuid,
	"user_id" varchar,
	"participant_agents" jsonb DEFAULT '[]',
	"negotiation_state" text DEFAULT 'initiated' NOT NULL,
	"proposals" jsonb DEFAULT '[]',
	"counter_proposals" jsonb DEFAULT '[]',
	"final_agreement" jsonb DEFAULT '{}',
	"voting_results" jsonb DEFAULT '{}',
	"negotiation_rules" jsonb DEFAULT '{}',
	"priority" integer DEFAULT 5,
	"timeout" integer DEFAULT 300,
	"metadata" jsonb DEFAULT '{}',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_negotiation_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "wai_observability_traces" (
	"id" serial PRIMARY KEY NOT NULL,
	"trace_id" text NOT NULL,
	"span_id" text NOT NULL,
	"parent_span_id" text,
	"operation_name" text NOT NULL,
	"organization_id" integer,
	"user_id" varchar,
	"session_id" text,
	"request_id" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"cost_usd" numeric(10, 6),
	"token_usage" jsonb DEFAULT '{}',
	"resource_usage" jsonb DEFAULT '{}',
	"inputs" jsonb DEFAULT '{}',
	"outputs" jsonb DEFAULT '{}',
	"dependencies" jsonb DEFAULT '[]',
	"lineage_graph" jsonb DEFAULT '{}',
	"status" text NOT NULL,
	"error_message" text,
	"error_stack" text,
	"health_signals" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '{}',
	"annotations" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_observability_traces_trace_id_unique" UNIQUE("trace_id")
);
--> statement-breakpoint
CREATE TABLE "wai_orchestration_requests_v9" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"project_id" text,
	"session_id" text NOT NULL,
	"request_type" text NOT NULL,
	"task" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"orchestration_mode" text DEFAULT 'auto' NOT NULL,
	"agent_enforcement" text DEFAULT 'strict' NOT NULL,
	"selected_agents" jsonb DEFAULT '[]',
	"selected_providers" jsonb DEFAULT '[]',
	"routing_decision" jsonb DEFAULT '{}',
	"bmad_coordination" jsonb,
	"context_layers" jsonb DEFAULT '[]',
	"parallel_execution" boolean DEFAULT false,
	"continuous_execution" boolean DEFAULT false,
	"quantum_optimization" boolean DEFAULT false,
	"result" jsonb,
	"intermediate_results" jsonb DEFAULT '[]',
	"components_used" jsonb DEFAULT '[]',
	"execution_plan" jsonb DEFAULT '{}',
	"execution_time_ms" integer,
	"total_cost" numeric(10, 6),
	"cost_breakdown" jsonb DEFAULT '{}',
	"tokens_used" integer,
	"quality_score" numeric(5, 2),
	"quality_metrics" jsonb DEFAULT '{}',
	"performance_metrics" jsonb DEFAULT '{}',
	"optimization_metrics" jsonb DEFAULT '{}',
	"error_message" text,
	"error_details" jsonb,
	"fallback_executed" boolean DEFAULT false,
	"fallback_chain" jsonb DEFAULT '[]',
	"user_feedback" jsonb,
	"audit_trail" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"routed_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wai_orchestration_requests_v7" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"request_type" text NOT NULL,
	"task" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"user_plan" text DEFAULT 'alpha' NOT NULL,
	"budget" text DEFAULT 'balanced',
	"enhanced_features" jsonb DEFAULT '{}',
	"cost_optimization_target" numeric(3, 2) DEFAULT '0.85',
	"accuracy_target" numeric(3, 2) DEFAULT '0.26',
	"ui_generation_context" jsonb DEFAULT '{}',
	"context" jsonb DEFAULT '{}',
	"required_components" jsonb DEFAULT '[]',
	"timeout" integer DEFAULT 30000,
	"metadata" jsonb DEFAULT '{}',
	"status" text DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"execution_time" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_orchestration_responses_v7" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"success" boolean NOT NULL,
	"result" jsonb,
	"components_used" jsonb DEFAULT '[]',
	"performance_metrics" jsonb DEFAULT '{}',
	"enhanced_results" jsonb DEFAULT '{}',
	"v7_metrics" jsonb DEFAULT '{}',
	"cost_reduction_achieved" numeric(5, 4),
	"accuracy_improvement" numeric(5, 4),
	"execution_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wai_performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_type" text NOT NULL,
	"component" text NOT NULL,
	"value" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"user_id" varchar,
	"request_id" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wai_pipelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"pipeline_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"project_id" integer,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"pipeline_type" text NOT NULL,
	"yaml_definition" text,
	"graph_definition" jsonb DEFAULT '{}',
	"steps" jsonb DEFAULT '[]',
	"release_channel" text DEFAULT 'development',
	"approval_status" text DEFAULT 'pending',
	"approved_by" integer,
	"approved_at" timestamp,
	"approval_comments" text,
	"triggers" jsonb DEFAULT '[]',
	"environment" jsonb DEFAULT '{}',
	"resources" jsonb DEFAULT '{}',
	"timeout" integer DEFAULT 3600,
	"retry_policy" jsonb DEFAULT '{}',
	"execution_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"average_execution_time" integer,
	"last_execution_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_pipelines_pipeline_id_unique" UNIQUE("pipeline_id")
);
--> statement-breakpoint
CREATE TABLE "wai_quantum_routing" (
	"id" serial PRIMARY KEY NOT NULL,
	"routing_id" text NOT NULL,
	"request_id" text NOT NULL,
	"routing_algorithm" text NOT NULL,
	"routing_decision" jsonb DEFAULT '{}',
	"selected_providers" jsonb DEFAULT '[]',
	"selected_agents" jsonb DEFAULT '[]',
	"optimization_criteria" jsonb DEFAULT '{}',
	"quantum_state" jsonb DEFAULT '{}',
	"probability_distribution" jsonb DEFAULT '{}',
	"fallback_chain" jsonb DEFAULT '[]',
	"routing_performance" jsonb DEFAULT '{}',
	"cost_optimization" jsonb DEFAULT '{}',
	"quality_metrics" jsonb DEFAULT '{}',
	"execution_time" integer,
	"total_cost" numeric(8, 4),
	"quality_score" numeric(5, 2),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "wai_quantum_routing_routing_id_unique" UNIQUE("routing_id")
);
--> statement-breakpoint
CREATE TABLE "wai_rbac_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"space_id" text,
	"role_type" text NOT NULL,
	"scope" text NOT NULL,
	"is_builtin" boolean DEFAULT false,
	"permissions" jsonb DEFAULT '[]',
	"resource_access" jsonb DEFAULT '{}',
	"api_permissions" jsonb DEFAULT '[]',
	"ui_permissions" jsonb DEFAULT '[]',
	"conditions" jsonb DEFAULT '{}',
	"ip_restrictions" jsonb DEFAULT '[]',
	"session_limits" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_rbac_roles_role_id_unique" UNIQUE("role_id")
);
--> statement-breakpoint
CREATE TABLE "wai_routing_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"priority" integer DEFAULT 50,
	"status" text DEFAULT 'active' NOT NULL,
	"optimization_goals" jsonb DEFAULT '{"cost": 30, "latency": 40, "quality": 30}',
	"cost_threshold" numeric(10, 4),
	"latency_threshold" integer,
	"quality_threshold" numeric(5, 2),
	"fallback_chain" jsonb DEFAULT '[]',
	"fallback_triggers" jsonb DEFAULT '{}',
	"safety_rules" jsonb DEFAULT '{}',
	"content_policies" jsonb DEFAULT '{}',
	"rights_protection" jsonb DEFAULT '{}',
	"carbon_footprint_limits" jsonb DEFAULT '{}',
	"allowed_regions" jsonb DEFAULT '["global"]',
	"compliance_requirements" jsonb DEFAULT '{}',
	"data_residency" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_routing_policies_policy_id_unique" UNIQUE("policy_id")
);
--> statement-breakpoint
CREATE TABLE "wai_sdk_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" text DEFAULT '9.0.0' NOT NULL,
	"bootstrap_status" text DEFAULT 'pending' NOT NULL,
	"configuration_hash" text NOT NULL,
	"enabled_features" jsonb DEFAULT '[]',
	"orchestration_mode" text DEFAULT 'mandatory' NOT NULL,
	"agent_enforcement_level" text DEFAULT 'strict' NOT NULL,
	"quantum_optimization" boolean DEFAULT true,
	"real_time_analytics" boolean DEFAULT true,
	"advanced_security" boolean DEFAULT true,
	"deployment_targets" jsonb DEFAULT '["production", "development"]',
	"bmad_coordination" boolean DEFAULT true,
	"continuous_execution" boolean DEFAULT true,
	"parallel_processing" boolean DEFAULT true,
	"cost_optimization" jsonb DEFAULT '{"enabled": true, "preferFreeModels": true, "costThreshold": 0.1}',
	"metadata" jsonb DEFAULT '{}',
	"last_bootstrap" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_sdk_configuration_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "wai_secrets_management" (
	"id" serial PRIMARY KEY NOT NULL,
	"secret_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"space_id" text,
	"secret_type" text NOT NULL,
	"classification" text NOT NULL,
	"encrypted_value" text,
	"kms_key_id" text NOT NULL,
	"encryption_algorithm" text DEFAULT 'AES-256-GCM',
	"access_policy" jsonb DEFAULT '{}',
	"allowed_roles" jsonb DEFAULT '[]',
	"allowed_services" jsonb DEFAULT '[]',
	"expires_at" timestamp,
	"rotation_policy" jsonb DEFAULT '{}',
	"last_rotated" timestamp,
	"auto_rotation_enabled" boolean DEFAULT false,
	"access_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"access_log" jsonb DEFAULT '[]',
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_secrets_management_secret_id_unique" UNIQUE("secret_id")
);
--> statement-breakpoint
CREATE TABLE "wai_studio_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"project_id" integer,
	"asset_type" text NOT NULL,
	"media_type" text,
	"file_format" text,
	"file_name" text,
	"file_path" text,
	"file_size" integer,
	"file_url" text,
	"thumbnail_url" text,
	"dimensions" jsonb DEFAULT '{}',
	"content_metadata" jsonb DEFAULT '{}',
	"quality_metrics" jsonb DEFAULT '{}',
	"rights_holder" text,
	"license_type" text NOT NULL,
	"license_details" jsonb DEFAULT '{}',
	"usage_rights" jsonb DEFAULT '{}',
	"expiration_date" timestamp,
	"watermark_enabled" boolean DEFAULT false,
	"watermark_config" jsonb DEFAULT '{}',
	"digital_fingerprint" text,
	"copyright_info" jsonb DEFAULT '{}',
	"version" text DEFAULT '1.0.0' NOT NULL,
	"parent_asset_id" text,
	"variants" jsonb DEFAULT '[]',
	"access_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"last_used" timestamp,
	"usage_history" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"categories" jsonb DEFAULT '[]',
	"collections" jsonb DEFAULT '[]',
	"status" text DEFAULT 'active' NOT NULL,
	"review_status" text DEFAULT 'pending',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_studio_assets_asset_id_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "wai_studio_blueprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"blueprint_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"short_description" text,
	"blueprint_type" text NOT NULL,
	"category" text NOT NULL,
	"industry" text,
	"use_case" text NOT NULL,
	"template_structure" jsonb DEFAULT '{}',
	"default_assets" jsonb DEFAULT '[]',
	"required_inputs" jsonb DEFAULT '[]',
	"configuration_schema" jsonb DEFAULT '{}',
	"workflow_steps" jsonb DEFAULT '[]',
	"automated_steps" jsonb DEFAULT '[]',
	"human_review_points" jsonb DEFAULT '[]',
	"technical_requirements" jsonb DEFAULT '{}',
	"output_specifications" jsonb DEFAULT '{}',
	"quality_standards" jsonb DEFAULT '{}',
	"required_services" jsonb DEFAULT '[]',
	"integrations" jsonb DEFAULT '[]',
	"estimated_cost" numeric(10, 2),
	"estimated_time" integer,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"popularity" integer DEFAULT 0,
	"usage_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"thumbnail" text,
	"screenshots" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_studio_blueprints_blueprint_id_unique" UNIQUE("blueprint_id")
);
--> statement-breakpoint
CREATE TABLE "wai_studio_experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"project_id" integer,
	"experiment_type" text NOT NULL,
	"hypothesis" text,
	"objectives" jsonb DEFAULT '[]',
	"variants" jsonb DEFAULT '[]',
	"traffic_split" jsonb DEFAULT '{}',
	"regression_type" text,
	"features" jsonb DEFAULT '[]',
	"target" text,
	"sample_size" integer,
	"confidence_level" numeric(5, 2) DEFAULT '95.00',
	"power_analysis" jsonb DEFAULT '{}',
	"primary_metrics" jsonb DEFAULT '[]',
	"secondary_metrics" jsonb DEFAULT '[]',
	"guardrail_metrics" jsonb DEFAULT '[]',
	"start_date" timestamp,
	"end_date" timestamp,
	"duration" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"results" jsonb DEFAULT '{}',
	"statistical_significance" boolean,
	"confidence_interval" jsonb DEFAULT '{}',
	"winner" text,
	"recommendation" text,
	"dashboard_config" jsonb DEFAULT '{}',
	"visualizations" jsonb DEFAULT '[]',
	"report_templates" jsonb DEFAULT '[]',
	"implementation_details" jsonb DEFAULT '{}',
	"rollout_plan" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_studio_experiments_experiment_id_unique" UNIQUE("experiment_id")
);
--> statement-breakpoint
CREATE TABLE "wai_studio_publishing" (
	"id" serial PRIMARY KEY NOT NULL,
	"publishing_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer,
	"project_id" integer,
	"publishing_type" text NOT NULL,
	"platforms" jsonb DEFAULT '[]',
	"social_platforms" jsonb DEFAULT '[]',
	"posting_schedule" jsonb DEFAULT '{}',
	"content_optimization" jsonb DEFAULT '{}',
	"hashtag_strategy" jsonb DEFAULT '{}',
	"storage_providers" jsonb DEFAULT '[]',
	"storage_configuration" jsonb DEFAULT '{}',
	"cdn_configuration" jsonb DEFAULT '{}',
	"cms_providers" jsonb DEFAULT '[]',
	"cms_configuration" jsonb DEFAULT '{}',
	"content_templates" jsonb DEFAULT '[]',
	"app_stores" jsonb DEFAULT '[]',
	"app_store_configuration" jsonb DEFAULT '{}',
	"review_guidelines" jsonb DEFAULT '{}',
	"publishing_rules" jsonb DEFAULT '[]',
	"automation_triggers" jsonb DEFAULT '[]',
	"approval_workflow" jsonb DEFAULT '{}',
	"preprocessing_steps" jsonb DEFAULT '[]',
	"format_conversion" jsonb DEFAULT '{}',
	"quality_checks" jsonb DEFAULT '[]',
	"analytics_integration" jsonb DEFAULT '{}',
	"tracking_configuration" jsonb DEFAULT '{}',
	"performance_metrics" jsonb DEFAULT '{}',
	"status" text DEFAULT 'draft' NOT NULL,
	"publishing_history" jsonb DEFAULT '[]',
	"last_published" timestamp,
	"rollback_configuration" jsonb DEFAULT '{}',
	"version_history" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_studio_publishing_publishing_id_unique" UNIQUE("publishing_id")
);
--> statement-breakpoint
CREATE TABLE "wai_tenancy_spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" integer NOT NULL,
	"parent_space_id" text,
	"space_type" text NOT NULL,
	"visibility" text DEFAULT 'private',
	"isolation" text DEFAULT 'soft',
	"resource_quotas" jsonb DEFAULT '{}',
	"usage_metrics" jsonb DEFAULT '{}',
	"billing_account" text,
	"compliance_profile" text,
	"security_level" text DEFAULT 'standard',
	"data_classification" text DEFAULT 'internal',
	"sso_provider_id" text,
	"sso_settings" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wai_tenancy_spaces_space_id_unique" UNIQUE("space_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_ai_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"founder_id" integer NOT NULL,
	"startup_id" integer,
	"title" text,
	"context" jsonb DEFAULT '{}',
	"status" text DEFAULT 'active' NOT NULL,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_ai_conversations_conversation_id_unique" UNIQUE("conversation_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_ai_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"content_type" text DEFAULT 'text',
	"provider" text,
	"model" text,
	"tokens_used" integer,
	"cost" numeric,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_ai_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"metric_type" text NOT NULL,
	"metric_name" text NOT NULL,
	"value" numeric NOT NULL,
	"previous_value" numeric,
	"change" numeric,
	"unit" text,
	"dimension" jsonb DEFAULT '{}',
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_application_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"criteria_scores" jsonb NOT NULL,
	"overall_score" integer NOT NULL,
	"strengths" jsonb DEFAULT '[]',
	"weaknesses" jsonb DEFAULT '[]',
	"recommendation" text NOT NULL,
	"comments" text,
	"is_ai_review" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" varchar NOT NULL,
	"cohort_id" integer NOT NULL,
	"founder_profile" jsonb NOT NULL,
	"startup_idea" jsonb NOT NULL,
	"team_composition" jsonb DEFAULT '[]',
	"market_analysis" jsonb DEFAULT '{}',
	"pitch_deck_url" text,
	"video_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"score" integer,
	"review_notes" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"submitted_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_applications_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_artifact_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"artifact_id" integer NOT NULL,
	"version_number" text NOT NULL,
	"change_type" text NOT NULL,
	"changes" jsonb DEFAULT '{}',
	"content" text,
	"file_url" text,
	"file_size" integer,
	"checksum" text,
	"created_by" varchar,
	"commit_message" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"artifact_type" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text,
	"file_url" text,
	"file_size" integer,
	"file_path" text,
	"mime_type" text,
	"version" text DEFAULT '1.0',
	"studio_id" text,
	"session_id" integer,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"is_public" boolean DEFAULT false,
	"downloads" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_automation_pipelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"pipeline_type" text NOT NULL,
	"pipeline_name" text NOT NULL,
	"provider" text,
	"status" text DEFAULT 'active' NOT NULL,
	"configuration" jsonb DEFAULT '{}',
	"triggers" jsonb DEFAULT '[]',
	"stages" jsonb DEFAULT '[]',
	"environment" text DEFAULT 'production',
	"is_enabled" boolean DEFAULT true,
	"last_run_at" timestamp,
	"success_rate" integer,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_code_repository" (
	"id" serial PRIMARY KEY NOT NULL,
	"artifact_id" integer NOT NULL,
	"repository" text,
	"branch" text DEFAULT 'main',
	"commit_hash" text,
	"file_structure" jsonb DEFAULT '{}',
	"tech_stack" jsonb DEFAULT '{}',
	"dependencies" jsonb DEFAULT '{}',
	"build_status" text,
	"test_coverage" integer,
	"lines_of_code" integer,
	"quality_metrics" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"program_type" text DEFAULT 'standard' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"application_deadline" timestamp NOT NULL,
	"max_startups" integer DEFAULT 20,
	"accepted_startups" integer DEFAULT 0,
	"status" text DEFAULT 'planning' NOT NULL,
	"curriculum" jsonb DEFAULT '[]',
	"mentors" jsonb DEFAULT '[]',
	"investors" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_cohorts_cohort_id_unique" UNIQUE("cohort_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_community_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"post_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"tags" jsonb DEFAULT '[]',
	"upvotes" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"published_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"status" text DEFAULT 'enrolled' NOT NULL,
	"last_accessed_at" timestamp,
	"completed_at" timestamp,
	"certificate_url" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_course_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"lesson_order" integer NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"content_url" text,
	"content" text,
	"duration" integer,
	"is_preview" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_course_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"module_order" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer,
	"is_preview" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"duration" integer,
	"instructor_name" text,
	"instructor_bio" text,
	"thumbnail_url" text,
	"trailer_url" text,
	"is_published" boolean DEFAULT false,
	"is_free" boolean DEFAULT true,
	"price" numeric,
	"enrollment_count" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"prerequisites" jsonb DEFAULT '[]',
	"learning_outcomes" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_courses_course_id_unique" UNIQUE("course_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance" integer NOT NULL,
	"description" text,
	"reference" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_demo_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"cohort_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_type" text DEFAULT 'virtual' NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"venue" text,
	"stream_url" text,
	"recording_url" text,
	"registration_required" boolean DEFAULT true,
	"max_attendees" integer,
	"registered_count" integer DEFAULT 0,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_demo_days_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"deployment_type" text NOT NULL,
	"environment" text NOT NULL,
	"provider" text NOT NULL,
	"region" text,
	"url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"version" text,
	"health_status" text DEFAULT 'unknown',
	"last_health_check" timestamp,
	"configuration" jsonb DEFAULT '{}',
	"resources" jsonb DEFAULT '{}',
	"metrics" jsonb DEFAULT '{}',
	"deployed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_design_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"artifact_id" integer NOT NULL,
	"asset_type" text NOT NULL,
	"figma_url" text,
	"preview_url" text,
	"design_system" jsonb DEFAULT '{}',
	"components" jsonb DEFAULT '[]',
	"color_palette" jsonb DEFAULT '[]',
	"typography" jsonb DEFAULT '{}',
	"accessibility_score" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_direct_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"attachments" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_direct_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"experiment_name" text NOT NULL,
	"experiment_type" text NOT NULL,
	"hypothesis" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"variants" jsonb DEFAULT '[]',
	"traffic_allocation" jsonb DEFAULT '{}',
	"success_metrics" jsonb DEFAULT '[]',
	"results" jsonb DEFAULT '{}',
	"winner" text,
	"confidence" numeric,
	"started_at" timestamp,
	"ended_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_file_upload_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"upload_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"chunk_size" integer NOT NULL,
	"checksum" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"storage_path" text,
	"uploaded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"user_id" varchar,
	"upload_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"chunk_size" integer DEFAULT 5242880,
	"total_chunks" integer NOT NULL,
	"uploaded_chunks" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"storage_provider" text NOT NULL,
	"storage_region" text,
	"storage_path" text,
	"storage_url" text,
	"checksum_md5" text,
	"checksum_sha256" text,
	"artifact_id" integer,
	"session_id" integer,
	"metadata" jsonb DEFAULT '{}',
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_file_uploads_upload_id_unique" UNIQUE("upload_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_forum_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"slug" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"post_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_forum_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wizards_forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"category_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"is_closed" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"upvotes" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"last_reply_at" timestamp,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_forum_posts_post_id_unique" UNIQUE("post_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_forum_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"reply_id" text NOT NULL,
	"post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"is_accepted_answer" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_forum_replies_reply_id_unique" UNIQUE("reply_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_founders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"founder_type" text DEFAULT 'solo' NOT NULL,
	"industry_experience" text,
	"technical_background" boolean DEFAULT false,
	"startup_stage" text DEFAULT 'idea' NOT NULL,
	"goals" jsonb DEFAULT '[]',
	"preferences" jsonb DEFAULT '{}',
	"completed_studios" jsonb DEFAULT '[]',
	"current_studio" text,
	"journey_progress" integer DEFAULT 0,
	"learning_profile" jsonb DEFAULT '{}',
	"achievements" jsonb DEFAULT '[]',
	"network_connections" jsonb DEFAULT '[]',
	"credits_balance" integer DEFAULT 100,
	"subscription_tier" text DEFAULT 'free',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_growth_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"users" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"revenue" numeric DEFAULT '0',
	"mrr" numeric DEFAULT '0',
	"churn_rate" numeric DEFAULT '0',
	"conversion_rate" numeric DEFAULT '0',
	"cac" numeric DEFAULT '0',
	"ltv" numeric DEFAULT '0',
	"growth_rate" numeric DEFAULT '0',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_industry_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"industry" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"features" jsonb DEFAULT '[]',
	"tech_stack" jsonb DEFAULT '{}',
	"compliance" jsonb DEFAULT '[]',
	"integrations" jsonb DEFAULT '[]',
	"estimated_deployment_days" integer NOT NULL,
	"complexity" text DEFAULT 'medium',
	"is_popular" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"blueprint_data" jsonb DEFAULT '{}',
	"code_templates" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"version" text DEFAULT '1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_industry_templates_template_id_unique" UNIQUE("template_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_investor_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"investor_id" integer NOT NULL,
	"connection_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"pitch_deck_url" text,
	"scheduled_meeting_date" timestamp,
	"outcome" text,
	"feedback" text,
	"next_steps" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_investor_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"investor_id" integer NOT NULL,
	"match_score" integer NOT NULL,
	"match_reasons" jsonb DEFAULT '[]',
	"industry_match" boolean DEFAULT false,
	"stage_match" boolean DEFAULT false,
	"geography_match" boolean DEFAULT false,
	"ai_generated_insights" text,
	"status" text DEFAULT 'suggested' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"investor_type" text NOT NULL,
	"firm_name" text,
	"fund_size" numeric,
	"check_size_min" numeric,
	"check_size_max" numeric,
	"investment_stage" jsonb DEFAULT '[]',
	"industries" jsonb DEFAULT '[]',
	"geographies" jsonb DEFAULT '[]',
	"portfolio" jsonb DEFAULT '[]',
	"expertise" jsonb DEFAULT '[]',
	"linkedin_url" text,
	"website_url" text,
	"bio" text,
	"is_accepting_pitches" boolean DEFAULT true,
	"response_time" integer,
	"deal_count" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_journey_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text NOT NULL,
	"event_description" text,
	"studio_name" text,
	"day_number" integer,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_lesson_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"time_spent" integer DEFAULT 0,
	"completed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_marketplace" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric NOT NULL,
	"currency" text DEFAULT 'USD',
	"preview_url" text,
	"download_url" text,
	"rating" real DEFAULT 0,
	"sales_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_mentor_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"from_role" text NOT NULL,
	"rating" integer NOT NULL,
	"helpfulness" integer,
	"communication" integer,
	"expertise" integer,
	"would_recommend" boolean DEFAULT true,
	"comments" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_mentor_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"mentor_id" integer NOT NULL,
	"match_score" integer NOT NULL,
	"match_reasons" jsonb DEFAULT '[]',
	"ai_generated_insights" text,
	"status" text DEFAULT 'suggested' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_mentor_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"match_id" integer NOT NULL,
	"startup_id" integer NOT NULL,
	"mentor_id" integer NOT NULL,
	"session_type" text DEFAULT 'video_call' NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"meeting_url" text,
	"agenda" text,
	"notes" text,
	"outcomes" jsonb DEFAULT '[]',
	"action_items" jsonb DEFAULT '[]',
	"status" text DEFAULT 'scheduled' NOT NULL,
	"recording_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_mentor_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_mentors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"mentor_type" text DEFAULT 'general' NOT NULL,
	"expertise" jsonb DEFAULT '[]',
	"industries" jsonb DEFAULT '[]',
	"years_experience" integer,
	"current_role" text,
	"company" text,
	"previous_experience" jsonb DEFAULT '[]',
	"bio" text,
	"linkedin_url" text,
	"availability" text DEFAULT 'available',
	"session_rate" numeric,
	"max_mentees" integer DEFAULT 5,
	"current_mentees" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"sessions_completed" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_orchestration_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"session_id" integer,
	"task_id" integer,
	"orchestration_id" text NOT NULL,
	"job_type" text NOT NULL,
	"workflow" text,
	"agents" jsonb DEFAULT '[]',
	"providers" jsonb DEFAULT '[]',
	"models" jsonb DEFAULT '[]',
	"status" text DEFAULT 'queued' NOT NULL,
	"priority" text DEFAULT 'medium',
	"inputs" jsonb DEFAULT '{}',
	"outputs" jsonb DEFAULT '{}',
	"progress" integer DEFAULT 0,
	"credits_used" integer DEFAULT 0,
	"tokens_used" integer DEFAULT 0,
	"cost" numeric DEFAULT '0',
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"available_at" timestamp DEFAULT now(),
	"backoff_multiplier" integer DEFAULT 2,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_pipeline_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pipeline_id" integer NOT NULL,
	"run_number" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"trigger_type" text,
	"branch" text,
	"commit_hash" text,
	"duration" integer,
	"logs" text,
	"error_message" text,
	"artifacts" jsonb DEFAULT '[]',
	"started_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_pitch_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" integer NOT NULL,
	"judge_name" text NOT NULL,
	"judge_role" text,
	"scores" jsonb NOT NULL,
	"overall_score" integer NOT NULL,
	"strengths" jsonb DEFAULT '[]',
	"improvements" jsonb DEFAULT '[]',
	"comments" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_pitches" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" text NOT NULL,
	"demo_day_id" integer NOT NULL,
	"startup_id" integer NOT NULL,
	"presentation_order" integer,
	"pitch_deck_url" text NOT NULL,
	"video_url" text,
	"live_stream_key" text,
	"pitch_duration" integer DEFAULT 5,
	"qa_duration" integer DEFAULT 3,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"view_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_pitches_pitch_id_unique" UNIQUE("pitch_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referred_id" integer,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_type" text,
	"reward_amount" integer,
	"reward_claimed" boolean DEFAULT false,
	"converted_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wizards_startups" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text,
	"target_market" text,
	"problem_statement" text,
	"proposed_solution" text,
	"current_phase" text DEFAULT 'ideation',
	"progress" integer DEFAULT 0,
	"credits_allocated" integer DEFAULT 1000,
	"credits_used" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_storage_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"provider_type" text NOT NULL,
	"display_name" text NOT NULL,
	"region" text,
	"bucket" text,
	"endpoint" text,
	"configuration" jsonb DEFAULT '{}',
	"credentials" jsonb DEFAULT '{}',
	"max_file_size" integer DEFAULT 104857600,
	"allowed_mime_types" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"quota" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_storage_providers_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_studio_deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"deliverable_type" text NOT NULL,
	"deliverable_name" text NOT NULL,
	"content" text,
	"content_type" text,
	"file_url" text,
	"artifact_id" integer,
	"version" text DEFAULT '1.0',
	"quality_score" integer,
	"is_approved" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_studio_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"studio_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"current_step" integer DEFAULT 1,
	"total_steps" integer DEFAULT 1,
	"progress" integer DEFAULT 0,
	"agents_used" jsonb DEFAULT '[]',
	"credits_consumed" integer DEFAULT 0,
	"quality_score" integer,
	"feedback" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_studio_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"task_type" text NOT NULL,
	"task_name" text NOT NULL,
	"task_description" text,
	"assigned_agents" jsonb DEFAULT '[]',
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium',
	"inputs" jsonb DEFAULT '{}',
	"outputs" jsonb DEFAULT '{}',
	"orchestration_id" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"credits_used" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"studio_id" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"color" text,
	"sequence" integer NOT NULL,
	"category" text NOT NULL,
	"estimated_days" integer NOT NULL,
	"day_range" text,
	"features" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"agents" jsonb DEFAULT '[]',
	"dependencies" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"version" text DEFAULT '1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wizards_studios_studio_id_unique" UNIQUE("studio_id")
);
--> statement-breakpoint
CREATE TABLE "wizards_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"plan" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly',
	"amount" numeric NOT NULL,
	"currency" text DEFAULT 'USD',
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_template_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"startup_id" integer NOT NULL,
	"template_id" text NOT NULL,
	"customizations" jsonb DEFAULT '{}',
	"deployment_status" text,
	"deployment_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wizards_usage_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"startup_id" integer,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"quantity" integer DEFAULT 1,
	"unit" text DEFAULT 'count',
	"cost" numeric,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_automation_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"complexity" text NOT NULL,
	"estimated_time" integer NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"triggers" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"config" jsonb DEFAULT '{}',
	"usage_count" integer DEFAULT 0,
	"rating" integer DEFAULT 5,
	"is_public" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" text NOT NULL,
	"template_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"triggered_by" text NOT NULL,
	"trigger_data" jsonb DEFAULT '{}',
	"current_step" integer DEFAULT 0,
	"total_steps" integer NOT NULL,
	"step_results" jsonb DEFAULT '[]',
	"errors" jsonb DEFAULT '[]',
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workflow_executions_execution_id_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_executions_v9" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" text NOT NULL,
	"pattern_id" text NOT NULL,
	"user_id" varchar,
	"organization_id" integer,
	"session_id" text,
	"input_data" jsonb NOT NULL,
	"config" jsonb DEFAULT '{}',
	"custom_parameters" jsonb DEFAULT '{}',
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" jsonb DEFAULT '{}',
	"current_step" text,
	"assigned_agents" jsonb DEFAULT '{}',
	"active_instances" jsonb DEFAULT '[]',
	"result" jsonb,
	"outputs" jsonb DEFAULT '{}',
	"artifacts" jsonb DEFAULT '[]',
	"execution_metrics" jsonb DEFAULT '{}',
	"quality_scores" jsonb DEFAULT '{}',
	"performance_data" jsonb DEFAULT '{}',
	"errors" jsonb DEFAULT '[]',
	"warnings" jsonb DEFAULT '[]',
	"recovery_actions" jsonb DEFAULT '[]',
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workflow_executions_v9_execution_id_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"coordination_type" text NOT NULL,
	"definition" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"agents" jsonb NOT NULL,
	"config" jsonb DEFAULT '{}',
	"parameters" jsonb DEFAULT '{}',
	"constraints" jsonb DEFAULT '{}',
	"estimated_duration" integer,
	"parallelism" integer DEFAULT 1,
	"resource_requirements" jsonb DEFAULT '{}',
	"success_criteria" jsonb DEFAULT '{}',
	"quality_gates" jsonb DEFAULT '[]',
	"performance_targets" jsonb DEFAULT '{}',
	"usage_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"average_duration" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workflow_patterns_pattern_id_unique" UNIQUE("pattern_id")
);
--> statement-breakpoint
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_from_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("from_agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_from_instance_id_agent_instances_id_fk" FOREIGN KEY ("from_instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_to_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("to_agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_to_instance_id_agent_instances_id_fk" FOREIGN KEY ("to_instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_coordination" ADD CONSTRAINT "agent_coordination_coordinator_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("coordinator_agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_coordination" ADD CONSTRAINT "agent_coordination_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_event_bus" ADD CONSTRAINT "agent_event_bus_source_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("source_agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_event_bus" ADD CONSTRAINT "agent_event_bus_source_instance_id_agent_instances_id_fk" FOREIGN KEY ("source_instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_event_bus" ADD CONSTRAINT "agent_event_bus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_instances" ADD CONSTRAINT "agent_instances_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_instances" ADD CONSTRAINT "agent_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_instances" ADD CONSTRAINT "agent_instances_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_instance_id_agent_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_monitoring" ADD CONSTRAINT "agent_monitoring_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_monitoring" ADD CONSTRAINT "agent_monitoring_instance_id_agent_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_monitoring" ADD CONSTRAINT "agent_monitoring_task_id_agent_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("task_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_monitoring" ADD CONSTRAINT "agent_monitoring_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_analytics" ADD CONSTRAINT "agent_performance_analytics_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_analytics" ADD CONSTRAINT "agent_performance_analytics_instance_id_agent_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_analytics" ADD CONSTRAINT "agent_performance_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_instance_id_agent_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."agent_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assistants" ADD CONSTRAINT "ai_assistants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_metrics" ADD CONSTRAINT "assistant_metrics_assistant_id_ai_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."ai_assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_versions" ADD CONSTRAINT "assistant_versions_assistant_id_ai_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."ai_assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_3d_assets" ADD CONSTRAINT "avatar_3d_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_3d_assets" ADD CONSTRAINT "avatar_3d_assets_assistant_id_avatar_3d_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."avatar_3d_assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_3d_assistants" ADD CONSTRAINT "avatar_3d_assistants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_assets" ADD CONSTRAINT "brand_assets_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_assets" ADD CONSTRAINT "brand_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_solutions" ADD CONSTRAINT "business_solutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_solutions" ADD CONSTRAINT "business_solutions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_activity" ADD CONSTRAINT "collaboration_activity_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_activity" ADD CONSTRAINT "collaboration_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_rooms" ADD CONSTRAINT "collaboration_rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_rooms" ADD CONSTRAINT "collaboration_rooms_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_analytics" ADD CONSTRAINT "content_analytics_content_id_published_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."published_content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_collaborators" ADD CONSTRAINT "content_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_collaborators" ADD CONSTRAINT "content_collaborators_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_comments" ADD CONSTRAINT "content_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_comments" ADD CONSTRAINT "content_comments_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_projects" ADD CONSTRAINT "content_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_publishing_history" ADD CONSTRAINT "content_publishing_history_version_id_content_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_publishing_history" ADD CONSTRAINT "content_publishing_history_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_scheduling" ADD CONSTRAINT "content_scheduling_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_connections" ADD CONSTRAINT "database_connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_connections" ADD CONSTRAINT "database_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_connections" ADD CONSTRAINT "database_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_processing_results" ADD CONSTRAINT "document_processing_results_queue_id_document_processing_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."document_processing_queue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_integrations" ADD CONSTRAINT "enterprise_integrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_integrations" ADD CONSTRAINT "enterprise_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_analytics" ADD CONSTRAINT "game_analytics_game_id_game_projects_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_analytics" ADD CONSTRAINT "game_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_assets" ADD CONSTRAINT "game_assets_game_id_game_projects_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_assets" ADD CONSTRAINT "game_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_projects" ADD CONSTRAINT "game_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_projects" ADD CONSTRAINT "game_projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_revenue" ADD CONSTRAINT "game_revenue_game_id_game_projects_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_revenue" ADD CONSTRAINT "game_revenue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_tournaments" ADD CONSTRAINT "game_tournaments_game_id_game_projects_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_tournaments" ADD CONSTRAINT "game_tournaments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_agents" ADD CONSTRAINT "generated_agents_template_id_agent_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."agent_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immersive_experiences" ADD CONSTRAINT "immersive_experiences_assistant_id_avatar_3d_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."avatar_3d_assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_document_chunks" ADD CONSTRAINT "kb_document_chunks_document_id_kb_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."kb_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_documents" ADD CONSTRAINT "kb_documents_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_documents" ADD CONSTRAINT "kb_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_embeddings" ADD CONSTRAINT "kb_embeddings_document_id_kb_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."kb_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_embeddings" ADD CONSTRAINT "kb_embeddings_chunk_id_kb_document_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."kb_document_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kimi_k2_configs" ADD CONSTRAINT "kimi_k2_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_cost_tracking" ADD CONSTRAINT "llm_cost_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_cost_tracking" ADD CONSTRAINT "llm_cost_tracking_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_connections" ADD CONSTRAINT "mcp_connections_tool_id_mcp_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."mcp_tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_connections" ADD CONSTRAINT "mcp_connections_server_id_mcp_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."mcp_servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_milestones" ADD CONSTRAINT "p0_milestones_phase_id_p0_roadmap_phases_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."p0_roadmap_phases"("phase_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_quality_gates" ADD CONSTRAINT "p0_quality_gates_task_id_p0_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."p0_tasks"("task_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_quality_gates" ADD CONSTRAINT "p0_quality_gates_milestone_id_p0_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."p0_milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_task_dependencies" ADD CONSTRAINT "p0_task_dependencies_task_id_p0_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."p0_tasks"("task_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_task_dependencies" ADD CONSTRAINT "p0_task_dependencies_depends_on_task_id_p0_tasks_task_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."p0_tasks"("task_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_tasks" ADD CONSTRAINT "p0_tasks_milestone_id_p0_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."p0_milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p0_tasks" ADD CONSTRAINT "p0_tasks_phase_id_p0_roadmap_phases_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."p0_roadmap_phases"("phase_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_plans" ADD CONSTRAINT "project_plans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_template_id_project_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "published_content" ADD CONSTRAINT "published_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_conversations" ADD CONSTRAINT "rag_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_queries" ADD CONSTRAINT "rag_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_features" ADD CONSTRAINT "roadmap_features_phase_id_roadmap_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."roadmap_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_integrations" ADD CONSTRAINT "roadmap_integrations_feature_id_roadmap_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."roadmap_features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdlc_workflow_executions" ADD CONSTRAINT "sdlc_workflow_executions_template_id_sdlc_workflow_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sdlc_workflow_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdlc_workflow_executions" ADD CONSTRAINT "sdlc_workflow_executions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdlc_workflow_executions" ADD CONSTRAINT "sdlc_workflow_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdlc_workflow_executions" ADD CONSTRAINT "sdlc_workflow_executions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdlc_workflow_templates" ADD CONSTRAINT "sdlc_workflow_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_platforms" ADD CONSTRAINT "social_platforms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_categories" ADD CONSTRAINT "task_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_task_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."task_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_agent_session_id_agent_sessions_id_fk" FOREIGN KEY ("agent_session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vector_index" ADD CONSTRAINT "vector_index_collection_id_vector_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."vector_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_bmad_assets" ADD CONSTRAINT "wai_bmad_assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_bmad_assets" ADD CONSTRAINT "wai_bmad_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_bmad_patterns" ADD CONSTRAINT "wai_bmad_patterns_coordination_id_wai_bmad_coordination_coordination_id_fk" FOREIGN KEY ("coordination_id") REFERENCES "public"."wai_bmad_coordination"("coordination_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_bmad_patterns" ADD CONSTRAINT "wai_bmad_patterns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_cam_clusters" ADD CONSTRAINT "wai_cam_clusters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_cam_clusters" ADD CONSTRAINT "wai_cam_clusters_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_cost_optimizer" ADD CONSTRAINT "wai_cost_optimizer_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_finops_budgets" ADD CONSTRAINT "wai_finops_budgets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_finops_budgets" ADD CONSTRAINT "wai_finops_budgets_space_id_wai_tenancy_spaces_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."wai_tenancy_spaces"("space_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_finops_budgets" ADD CONSTRAINT "wai_finops_budgets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_grpo_policies" ADD CONSTRAINT "wai_grpo_policies_training_job_id_wai_grpo_training_jobs_job_id_fk" FOREIGN KEY ("training_job_id") REFERENCES "public"."wai_grpo_training_jobs"("job_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_grpo_policies" ADD CONSTRAINT "wai_grpo_policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_grpo_training_jobs" ADD CONSTRAINT "wai_grpo_training_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_grpo_training_jobs" ADD CONSTRAINT "wai_grpo_training_jobs_model_id_wai_llm_providers_v9_provider_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."wai_llm_providers_v9"("provider_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_grpo_training_jobs" ADD CONSTRAINT "wai_grpo_training_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_incident_management" ADD CONSTRAINT "wai_incident_management_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_incident_management" ADD CONSTRAINT "wai_incident_management_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_india_pack_services" ADD CONSTRAINT "wai_india_pack_services_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_india_pack_services" ADD CONSTRAINT "wai_india_pack_services_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_marketplace" ADD CONSTRAINT "wai_marketplace_publisher_id_users_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_marketplace" ADD CONSTRAINT "wai_marketplace_publisher_organization_organizations_id_fk" FOREIGN KEY ("publisher_organization") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_negotiation_sessions" ADD CONSTRAINT "wai_negotiation_sessions_initiator_agent_id_agent_catalog_agent_id_fk" FOREIGN KEY ("initiator_agent_id") REFERENCES "public"."agent_catalog"("agent_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_negotiation_sessions" ADD CONSTRAINT "wai_negotiation_sessions_workflow_execution_id_workflow_executions_v9_id_fk" FOREIGN KEY ("workflow_execution_id") REFERENCES "public"."workflow_executions_v9"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_negotiation_sessions" ADD CONSTRAINT "wai_negotiation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_observability_traces" ADD CONSTRAINT "wai_observability_traces_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_observability_traces" ADD CONSTRAINT "wai_observability_traces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_orchestration_requests_v9" ADD CONSTRAINT "wai_orchestration_requests_v9_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_orchestration_requests_v7" ADD CONSTRAINT "wai_orchestration_requests_v7_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_orchestration_responses_v7" ADD CONSTRAINT "wai_orchestration_responses_v7_request_id_wai_orchestration_requests_v7_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."wai_orchestration_requests_v7"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_performance_metrics" ADD CONSTRAINT "wai_performance_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_pipelines" ADD CONSTRAINT "wai_pipelines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_pipelines" ADD CONSTRAINT "wai_pipelines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_pipelines" ADD CONSTRAINT "wai_pipelines_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_pipelines" ADD CONSTRAINT "wai_pipelines_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_rbac_roles" ADD CONSTRAINT "wai_rbac_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_rbac_roles" ADD CONSTRAINT "wai_rbac_roles_space_id_wai_tenancy_spaces_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."wai_tenancy_spaces"("space_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_rbac_roles" ADD CONSTRAINT "wai_rbac_roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_routing_policies" ADD CONSTRAINT "wai_routing_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_routing_policies" ADD CONSTRAINT "wai_routing_policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_secrets_management" ADD CONSTRAINT "wai_secrets_management_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_secrets_management" ADD CONSTRAINT "wai_secrets_management_space_id_wai_tenancy_spaces_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."wai_tenancy_spaces"("space_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_secrets_management" ADD CONSTRAINT "wai_secrets_management_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_assets" ADD CONSTRAINT "wai_studio_assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_assets" ADD CONSTRAINT "wai_studio_assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_assets" ADD CONSTRAINT "wai_studio_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_blueprints" ADD CONSTRAINT "wai_studio_blueprints_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_experiments" ADD CONSTRAINT "wai_studio_experiments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_experiments" ADD CONSTRAINT "wai_studio_experiments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_experiments" ADD CONSTRAINT "wai_studio_experiments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_publishing" ADD CONSTRAINT "wai_studio_publishing_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_publishing" ADD CONSTRAINT "wai_studio_publishing_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_studio_publishing" ADD CONSTRAINT "wai_studio_publishing_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_tenancy_spaces" ADD CONSTRAINT "wai_tenancy_spaces_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_tenancy_spaces" ADD CONSTRAINT "wai_tenancy_spaces_parent_space_id_wai_tenancy_spaces_space_id_fk" FOREIGN KEY ("parent_space_id") REFERENCES "public"."wai_tenancy_spaces"("space_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wai_tenancy_spaces" ADD CONSTRAINT "wai_tenancy_spaces_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_ai_conversations" ADD CONSTRAINT "wizards_ai_conversations_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_ai_conversations" ADD CONSTRAINT "wizards_ai_conversations_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_ai_messages" ADD CONSTRAINT "wizards_ai_messages_conversation_id_wizards_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."wizards_ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_analytics" ADD CONSTRAINT "wizards_analytics_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_application_reviews" ADD CONSTRAINT "wizards_application_reviews_application_id_wizards_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."wizards_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_application_reviews" ADD CONSTRAINT "wizards_application_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_applications" ADD CONSTRAINT "wizards_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_applications" ADD CONSTRAINT "wizards_applications_cohort_id_wizards_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."wizards_cohorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_applications" ADD CONSTRAINT "wizards_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_artifact_versions" ADD CONSTRAINT "wizards_artifact_versions_artifact_id_wizards_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."wizards_artifacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_artifact_versions" ADD CONSTRAINT "wizards_artifact_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_artifacts" ADD CONSTRAINT "wizards_artifacts_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_automation_pipelines" ADD CONSTRAINT "wizards_automation_pipelines_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_code_repository" ADD CONSTRAINT "wizards_code_repository_artifact_id_wizards_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."wizards_artifacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_community_posts" ADD CONSTRAINT "wizards_community_posts_author_id_wizards_founders_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_course_enrollments" ADD CONSTRAINT "wizards_course_enrollments_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_course_enrollments" ADD CONSTRAINT "wizards_course_enrollments_course_id_wizards_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."wizards_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_course_lessons" ADD CONSTRAINT "wizards_course_lessons_module_id_wizards_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."wizards_course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_course_modules" ADD CONSTRAINT "wizards_course_modules_course_id_wizards_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."wizards_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_credit_transactions" ADD CONSTRAINT "wizards_credit_transactions_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_demo_days" ADD CONSTRAINT "wizards_demo_days_cohort_id_wizards_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."wizards_cohorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_deployments" ADD CONSTRAINT "wizards_deployments_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_design_assets" ADD CONSTRAINT "wizards_design_assets_artifact_id_wizards_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."wizards_artifacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_direct_messages" ADD CONSTRAINT "wizards_direct_messages_sender_id_wizards_founders_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_direct_messages" ADD CONSTRAINT "wizards_direct_messages_recipient_id_wizards_founders_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_experiments" ADD CONSTRAINT "wizards_experiments_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_file_uploads" ADD CONSTRAINT "wizards_file_uploads_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_file_uploads" ADD CONSTRAINT "wizards_file_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_file_uploads" ADD CONSTRAINT "wizards_file_uploads_artifact_id_wizards_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."wizards_artifacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_file_uploads" ADD CONSTRAINT "wizards_file_uploads_session_id_wizards_studio_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."wizards_studio_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_forum_posts" ADD CONSTRAINT "wizards_forum_posts_category_id_wizards_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wizards_forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_forum_posts" ADD CONSTRAINT "wizards_forum_posts_author_id_wizards_founders_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_forum_replies" ADD CONSTRAINT "wizards_forum_replies_post_id_wizards_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."wizards_forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_forum_replies" ADD CONSTRAINT "wizards_forum_replies_author_id_wizards_founders_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_founders" ADD CONSTRAINT "wizards_founders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_growth_metrics" ADD CONSTRAINT "wizards_growth_metrics_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_investor_connections" ADD CONSTRAINT "wizards_investor_connections_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_investor_connections" ADD CONSTRAINT "wizards_investor_connections_investor_id_wizards_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."wizards_investors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_investor_matches" ADD CONSTRAINT "wizards_investor_matches_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_investor_matches" ADD CONSTRAINT "wizards_investor_matches_investor_id_wizards_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."wizards_investors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_investors" ADD CONSTRAINT "wizards_investors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_journey_timeline" ADD CONSTRAINT "wizards_journey_timeline_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_lesson_progress" ADD CONSTRAINT "wizards_lesson_progress_enrollment_id_wizards_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."wizards_course_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_lesson_progress" ADD CONSTRAINT "wizards_lesson_progress_lesson_id_wizards_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."wizards_course_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_marketplace" ADD CONSTRAINT "wizards_marketplace_seller_id_wizards_founders_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_feedback" ADD CONSTRAINT "wizards_mentor_feedback_session_id_wizards_mentor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."wizards_mentor_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_matches" ADD CONSTRAINT "wizards_mentor_matches_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_matches" ADD CONSTRAINT "wizards_mentor_matches_mentor_id_wizards_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."wizards_mentors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_sessions" ADD CONSTRAINT "wizards_mentor_sessions_match_id_wizards_mentor_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."wizards_mentor_matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_sessions" ADD CONSTRAINT "wizards_mentor_sessions_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentor_sessions" ADD CONSTRAINT "wizards_mentor_sessions_mentor_id_wizards_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."wizards_mentors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_mentors" ADD CONSTRAINT "wizards_mentors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_orchestration_jobs" ADD CONSTRAINT "wizards_orchestration_jobs_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_orchestration_jobs" ADD CONSTRAINT "wizards_orchestration_jobs_session_id_wizards_studio_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."wizards_studio_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_orchestration_jobs" ADD CONSTRAINT "wizards_orchestration_jobs_task_id_wizards_studio_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."wizards_studio_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_pipeline_runs" ADD CONSTRAINT "wizards_pipeline_runs_pipeline_id_wizards_automation_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."wizards_automation_pipelines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_pitch_feedback" ADD CONSTRAINT "wizards_pitch_feedback_pitch_id_wizards_pitches_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."wizards_pitches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_pitches" ADD CONSTRAINT "wizards_pitches_demo_day_id_wizards_demo_days_id_fk" FOREIGN KEY ("demo_day_id") REFERENCES "public"."wizards_demo_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_pitches" ADD CONSTRAINT "wizards_pitches_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_referrals" ADD CONSTRAINT "wizards_referrals_referrer_id_wizards_founders_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_referrals" ADD CONSTRAINT "wizards_referrals_referred_id_wizards_founders_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_startups" ADD CONSTRAINT "wizards_startups_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_studio_deliverables" ADD CONSTRAINT "wizards_studio_deliverables_session_id_wizards_studio_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."wizards_studio_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_studio_sessions" ADD CONSTRAINT "wizards_studio_sessions_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_studio_tasks" ADD CONSTRAINT "wizards_studio_tasks_session_id_wizards_studio_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."wizards_studio_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_subscriptions" ADD CONSTRAINT "wizards_subscriptions_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_template_usage" ADD CONSTRAINT "wizards_template_usage_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_usage_tracking" ADD CONSTRAINT "wizards_usage_tracking_founder_id_wizards_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."wizards_founders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wizards_usage_tracking" ADD CONSTRAINT "wizards_usage_tracking_startup_id_wizards_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."wizards_startups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_automation_templates" ADD CONSTRAINT "workflow_automation_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_template_id_workflow_automation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workflow_automation_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions_v9" ADD CONSTRAINT "workflow_executions_v9_pattern_id_workflow_patterns_pattern_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."workflow_patterns"("pattern_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions_v9" ADD CONSTRAINT "workflow_executions_v9_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions_v9" ADD CONSTRAINT "workflow_executions_v9_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_patterns" ADD CONSTRAINT "workflow_patterns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_catalog_tier" ON "agent_catalog" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_agent_catalog_category" ON "agent_catalog" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_agent_catalog_specialization" ON "agent_catalog" USING btree ("specialization");--> statement-breakpoint
CREATE INDEX "idx_agent_catalog_status" ON "agent_catalog" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_catalog_agent_id" ON "agent_catalog" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_from_agent" ON "agent_communications" USING btree ("from_agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_to_agent" ON "agent_communications" USING btree ("to_agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_session" ON "agent_communications" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_workflow" ON "agent_communications" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_status" ON "agent_communications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_priority" ON "agent_communications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_agent_comms_sent" ON "agent_communications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_agent_coordination_type" ON "agent_coordination" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_agent_coordination_coordinator" ON "agent_coordination" USING btree ("coordinator_agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_coordination_status" ON "agent_coordination" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_type" ON "agent_event_bus" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_category" ON "agent_event_bus" USING btree ("event_category");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_source_agent" ON "agent_event_bus" USING btree ("source_agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_severity" ON "agent_event_bus" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_timestamp" ON "agent_event_bus" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_user_id" ON "agent_event_bus" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_event_bus_session" ON "agent_event_bus" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_instances_agent_id" ON "agent_instances" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_instances_status" ON "agent_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_instances_health" ON "agent_instances" USING btree ("health");--> statement-breakpoint
CREATE INDEX "idx_agent_instances_user" ON "agent_instances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_instances_session" ON "agent_instances" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "agent_type_idx" ON "agent_loading_system" USING btree ("agent_type","is_loaded");--> statement-breakpoint
CREATE INDEX "loading_strategy_idx" ON "agent_loading_system" USING btree ("loading_strategy");--> statement-breakpoint
CREATE INDEX "usage_frequency_idx" ON "agent_loading_system" USING btree ("usage_frequency");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_agent_id" ON "agent_memory" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_instance_id" ON "agent_memory" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_user_id" ON "agent_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_type" ON "agent_memory" USING btree ("memory_type");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_context" ON "agent_memory" USING btree ("context");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_scope" ON "agent_memory" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_session" ON "agent_memory" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_importance" ON "agent_memory" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "idx_agent_memory_last_accessed" ON "agent_memory" USING btree ("last_accessed");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_agent_id" ON "agent_monitoring" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_instance_id" ON "agent_monitoring" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_task_id" ON "agent_monitoring" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_operation" ON "agent_monitoring" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_llm_provider" ON "agent_monitoring" USING btree ("llm_provider");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_success" ON "agent_monitoring" USING btree ("success");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_user_id" ON "agent_monitoring" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_session" ON "agent_monitoring" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_monitoring_start_time" ON "agent_monitoring" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_agent_perf_analytics_agent_id" ON "agent_performance_analytics" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_perf_analytics_instance_id" ON "agent_performance_analytics" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_agent_perf_analytics_user_id" ON "agent_performance_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_perf_analytics_period" ON "agent_performance_analytics" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "idx_agent_metrics_agent_id" ON "wai_agent_performance_metrics" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_metrics_type" ON "wai_agent_performance_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_agent_metrics_timestamp" ON "wai_agent_performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_agent_metrics_session" ON "wai_agent_performance_metrics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_policy_agent_id" ON "wai_agent_policy_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_policy_policy_id" ON "wai_agent_policy_assignments" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_agent_policy_compliance" ON "wai_agent_policy_assignments" USING btree ("compliance_status");--> statement-breakpoint
CREATE INDEX "idx_agent_skill_agent_id" ON "wai_agent_skill_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_skill_skill_id" ON "wai_agent_skill_assignments" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_agent_skill_status" ON "wai_agent_skill_assignments" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_agent_id" ON "agent_tasks" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_instance_id" ON "agent_tasks" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_status" ON "agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_priority" ON "agent_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_type" ON "agent_tasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_agent_tasks_created" ON "agent_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_version_agent_id" ON "wai_agent_version_history" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_version_version" ON "wai_agent_version_history" USING btree ("version");--> statement-breakpoint
CREATE INDEX "idx_agent_version_status" ON "wai_agent_version_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_version_changed_by" ON "wai_agent_version_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_assistant_metrics_assistant" ON "assistant_metrics" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "idx_assistant_metrics_date" ON "assistant_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_assistant_versions_assistant" ON "assistant_versions" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "session_message_idx" ON "chat_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "content_analytics_enhanced_idx" ON "content_analytics_enhanced" USING btree ("content_id","recorded_at");--> statement-breakpoint
CREATE INDEX "content_collab_idx" ON "content_collaborators" USING btree ("content_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_content_folders_parent" ON "content_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_content_items_folder" ON "content_items" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "idx_content_items_status" ON "content_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_content_items_type" ON "content_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "schedule_status_idx" ON "content_scheduling" USING btree ("scheduled_for","status");--> statement-breakpoint
CREATE INDEX "content_version_idx" ON "content_versions" USING btree ("content_id","version");--> statement-breakpoint
CREATE INDEX "idx_doc_processing_status" ON "document_processing_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_doc_processing_priority" ON "document_processing_queue" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_doc_processing_created" ON "document_processing_queue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_doc_results_queue" ON "document_processing_results" USING btree ("queue_id");--> statement-breakpoint
CREATE INDEX "idx_doc_results_success" ON "document_processing_results" USING btree ("success");--> statement-breakpoint
CREATE INDEX "idx_kb_chunks_document" ON "kb_document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_kb_chunks_index" ON "kb_document_chunks" USING btree ("chunk_index");--> statement-breakpoint
CREATE INDEX "idx_kb_documents_kb" ON "kb_documents" USING btree ("knowledge_base_id");--> statement-breakpoint
CREATE INDEX "idx_kb_documents_status" ON "kb_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_kb_documents_type" ON "kb_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_kb_documents_created_by" ON "kb_documents" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_kb_documents_updated" ON "kb_documents" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_kb_embeddings_document" ON "kb_embeddings" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_kb_embeddings_chunk" ON "kb_embeddings" USING btree ("chunk_id");--> statement-breakpoint
CREATE INDEX "idx_kb_embeddings_model" ON "kb_embeddings" USING btree ("embedding_model");--> statement-breakpoint
CREATE INDEX "idx_knowledge_bases_owner" ON "knowledge_bases" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_bases_org" ON "knowledge_bases" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_bases_type" ON "knowledge_bases" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_knowledge_bases_status" ON "knowledge_bases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "llm_providers_status_idx" ON "llm_providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "llm_providers_name_idx" ON "llm_providers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_p0_milestone_id" ON "p0_milestones" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "idx_p0_milestone_phase" ON "p0_milestones" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "idx_p0_milestone_status" ON "p0_milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_p0_milestone_category" ON "p0_milestones" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_p0_metric_id" ON "p0_progress_metrics" USING btree ("metric_id");--> statement-breakpoint
CREATE INDEX "idx_p0_metric_entity" ON "p0_progress_metrics" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_p0_metric_type" ON "p0_progress_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_p0_metric_timestamp" ON "p0_progress_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_p0_gate_id" ON "p0_quality_gates" USING btree ("gate_id");--> statement-breakpoint
CREATE INDEX "idx_p0_gate_task" ON "p0_quality_gates" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_p0_gate_milestone" ON "p0_quality_gates" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "idx_p0_gate_status" ON "p0_quality_gates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_p0_gate_category" ON "p0_quality_gates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_p0_phase_id" ON "p0_roadmap_phases" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "idx_p0_phase_status" ON "p0_roadmap_phases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_p0_phase_type" ON "p0_roadmap_phases" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_p0_dep_task" ON "p0_task_dependencies" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_p0_dep_depends_on" ON "p0_task_dependencies" USING btree ("depends_on_task_id");--> statement-breakpoint
CREATE INDEX "idx_p0_dep_status" ON "p0_task_dependencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_p0_task_id" ON "p0_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_p0_task_milestone" ON "p0_tasks" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "idx_p0_task_phase" ON "p0_tasks" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "idx_p0_task_status" ON "p0_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_p0_task_priority" ON "p0_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_p0_task_assignee" ON "p0_tasks" USING btree ("assignee");--> statement-breakpoint
CREATE INDEX "metric_component_idx" ON "performance_metrics" USING btree ("metric_type","component","timestamp");--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_policy_def_policy_id" ON "wai_policy_definitions" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_policy_def_type" ON "wai_policy_definitions" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "idx_policy_def_active" ON "wai_policy_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_policy_def_priority" ON "wai_policy_definitions" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "project_user_idx" ON "project_collaborators" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_project_plans_project" ON "project_plans" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_resources_project" ON "project_resources" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_provider_metrics_provider_id" ON "wai_provider_performance_metrics" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_provider_metrics_model_id" ON "wai_provider_performance_metrics" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_provider_metrics_type" ON "wai_provider_performance_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_provider_metrics_timestamp" ON "wai_provider_performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_rag_conversations_session" ON "rag_conversations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_rag_conversations_user" ON "rag_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_rag_conversations_timestamp" ON "rag_conversations" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_rag_metrics_timestamp" ON "rag_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_rag_queries_user" ON "rag_queries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_rag_queries_session" ON "rag_queries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_rag_queries_created" ON "rag_queries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_rag_queries_strategy" ON "rag_queries" USING btree ("strategy");--> statement-breakpoint
CREATE INDEX "phase_feature_idx" ON "roadmap_features" USING btree ("phase_id","status");--> statement-breakpoint
CREATE INDEX "technology_idx" ON "roadmap_features" USING btree ("technology");--> statement-breakpoint
CREATE INDEX "platform_idx" ON "roadmap_features" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "feature_platform_idx" ON "roadmap_integrations" USING btree ("feature_id","platform_id");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_user" ON "search_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_kb" ON "search_analytics" USING btree ("knowledge_base_id");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_timestamp" ON "search_analytics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_search_analytics_method" ON "search_analytics" USING btree ("search_method");--> statement-breakpoint
CREATE INDEX "idx_skill_def_skill_id" ON "wai_skill_definitions" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_skill_def_category" ON "wai_skill_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_skill_def_active" ON "wai_skill_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_project_status_idx" ON "tasks" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "task_assignee_idx" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "task_agent_idx" ON "tasks" USING btree ("assigned_agent");--> statement-breakpoint
CREATE INDEX "idx_user_api_keys_user" ON "user_api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_api_keys_provider" ON "user_api_keys" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "user_org_idx" ON "user_organizations" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_vector_collections_name" ON "vector_collections" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_vector_collections_dimension" ON "vector_collections" USING btree ("dimension");--> statement-breakpoint
CREATE INDEX "idx_vector_index_collection" ON "vector_index" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "idx_vector_index_namespace" ON "vector_index" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "idx_vector_index_document" ON "vector_index" USING btree ("document_reference");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_comm_session" ON "wai_agent_communication" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_comm_status" ON "wai_agent_communication" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_comm_sent" ON "wai_agent_communication" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_status" ON "wai_agent_loading_system" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_type" ON "wai_agent_loading_system" USING btree ("agent_type");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_activity" ON "wai_agent_loading_system" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_v9_id" ON "wai_agent_registry_v9" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_v9_tier" ON "wai_agent_registry_v9" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_v9_status" ON "wai_agent_registry_v9" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_v9_category" ON "wai_agent_registry_v9" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wai_agent_v9_activity" ON "wai_agent_registry_v9" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_asset_id" ON "wai_bmad_assets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_asset_type" ON "wai_bmad_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_consistency" ON "wai_bmad_assets" USING btree ("consistency_score");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_drift" ON "wai_bmad_assets" USING btree ("drift_detected");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_session" ON "wai_bmad_coordination" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_coordination" ON "wai_bmad_coordination" USING btree ("coordination_id");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_state" ON "wai_bmad_coordination" USING btree ("coordination_state");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_type" ON "wai_bmad_coordination" USING btree ("coordination_type");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_pattern_id" ON "wai_bmad_patterns" USING btree ("pattern_id");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_pattern_type" ON "wai_bmad_patterns" USING btree ("pattern_type");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_pattern_active" ON "wai_bmad_patterns" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_wai_bmad_pattern_success" ON "wai_bmad_patterns" USING btree ("success_rate");--> statement-breakpoint
CREATE INDEX "idx_wai_cam_cluster_id" ON "wai_cam_clusters" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "idx_wai_cam_cluster_type" ON "wai_cam_clusters" USING btree ("cluster_type");--> statement-breakpoint
CREATE INDEX "idx_wai_cam_cluster_relevance" ON "wai_cam_clusters" USING btree ("relevance_score");--> statement-breakpoint
CREATE INDEX "idx_wai_cam_cluster_accessed" ON "wai_cam_clusters" USING btree ("last_accessed");--> statement-breakpoint
CREATE INDEX "idx_wai_context_id" ON "wai_context_layers" USING btree ("context_id");--> statement-breakpoint
CREATE INDEX "idx_wai_context_session" ON "wai_context_layers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wai_context_layer" ON "wai_context_layers" USING btree ("layer_type");--> statement-breakpoint
CREATE INDEX "idx_wai_context_relevance" ON "wai_context_layers" USING btree ("relevance_score");--> statement-breakpoint
CREATE INDEX "idx_wai_context_accessed" ON "wai_context_layers" USING btree ("last_accessed");--> statement-breakpoint
CREATE INDEX "idx_wai_cost_opt_id" ON "wai_cost_optimizer" USING btree ("optimization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_cost_opt_org" ON "wai_cost_optimizer" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_creative_model" ON "wai_creative_models" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_wai_creative_type" ON "wai_creative_models" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_wai_creative_provider" ON "wai_creative_models" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_wai_creative_status" ON "wai_creative_models" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_budget_id" ON "wai_finops_budgets" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "idx_wai_budget_org" ON "wai_finops_budgets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_budget_period" ON "wai_finops_budgets" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_policy_id" ON "wai_grpo_policies" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_policy_type" ON "wai_grpo_policies" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_policy_active" ON "wai_grpo_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_policy_training" ON "wai_grpo_policies" USING btree ("last_training_run");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_job" ON "wai_grpo_training_jobs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_status" ON "wai_grpo_training_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_schedule" ON "wai_grpo_training_jobs" USING btree ("schedule_type");--> statement-breakpoint
CREATE INDEX "idx_wai_grpo_model" ON "wai_grpo_training_jobs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_wai_incident_id" ON "wai_incident_management" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_wai_incident_severity" ON "wai_incident_management" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_wai_incident_status" ON "wai_incident_management" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_incident_detected" ON "wai_incident_management" USING btree ("detected_at");--> statement-breakpoint
CREATE INDEX "idx_wai_india_service" ON "wai_india_pack_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_wai_india_type" ON "wai_india_pack_services" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "idx_wai_india_language" ON "wai_india_pack_services" USING btree ("primary_language");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_providers_status" ON "wai_llm_providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_providers_quality" ON "wai_llm_providers" USING btree ("quality_score");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_v9_provider" ON "wai_llm_providers_v9" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_v9_status" ON "wai_llm_providers_v9" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_v9_cost_tier" ON "wai_llm_providers_v9" USING btree ("cost_tier");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_v9_quality" ON "wai_llm_providers_v9" USING btree ("quality_score");--> statement-breakpoint
CREATE INDEX "idx_wai_llm_v9_type" ON "wai_llm_providers_v9" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_wai_marketplace_item" ON "wai_marketplace" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_wai_marketplace_type" ON "wai_marketplace" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "idx_wai_marketplace_category" ON "wai_marketplace" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wai_marketplace_publisher" ON "wai_marketplace" USING btree ("publisher_id");--> statement-breakpoint
CREATE INDEX "idx_wai_negotiation_session" ON "wai_negotiation_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wai_negotiation_type" ON "wai_negotiation_sessions" USING btree ("negotiation_type");--> statement-breakpoint
CREATE INDEX "idx_wai_negotiation_state" ON "wai_negotiation_sessions" USING btree ("negotiation_state");--> statement-breakpoint
CREATE INDEX "idx_wai_negotiation_initiator" ON "wai_negotiation_sessions" USING btree ("initiator_agent_id");--> statement-breakpoint
CREATE INDEX "idx_wai_trace_id" ON "wai_observability_traces" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "idx_wai_trace_span" ON "wai_observability_traces" USING btree ("span_id");--> statement-breakpoint
CREATE INDEX "idx_wai_trace_operation" ON "wai_observability_traces" USING btree ("operation_name");--> statement-breakpoint
CREATE INDEX "idx_wai_trace_time" ON "wai_observability_traces" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_user" ON "wai_orchestration_requests_v9" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_project" ON "wai_orchestration_requests_v9" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_session" ON "wai_orchestration_requests_v9" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_status" ON "wai_orchestration_requests_v9" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_created" ON "wai_orchestration_requests_v9" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_type" ON "wai_orchestration_requests_v9" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "idx_wai_orchestration_v9_priority" ON "wai_orchestration_requests_v9" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "wai_v7_user_type_idx" ON "wai_orchestration_requests_v7" USING btree ("user_id","request_type");--> statement-breakpoint
CREATE INDEX "wai_v7_status_idx" ON "wai_orchestration_requests_v7" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wai_v7_priority_idx" ON "wai_orchestration_requests_v7" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "wai_v7_response_request_idx" ON "wai_orchestration_responses_v7" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "wai_v7_response_success_idx" ON "wai_orchestration_responses_v7" USING btree ("success");--> statement-breakpoint
CREATE INDEX "idx_wai_performance_metrics_timestamp" ON "wai_performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_wai_performance_metrics_component" ON "wai_performance_metrics" USING btree ("component");--> statement-breakpoint
CREATE INDEX "idx_wai_performance_metrics_user" ON "wai_performance_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wai_pipeline_id" ON "wai_pipelines" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "idx_wai_pipeline_status" ON "wai_pipelines" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_pipeline_channel" ON "wai_pipelines" USING btree ("release_channel");--> statement-breakpoint
CREATE INDEX "idx_wai_quantum_routing" ON "wai_quantum_routing" USING btree ("routing_id");--> statement-breakpoint
CREATE INDEX "idx_wai_quantum_request" ON "wai_quantum_routing" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_wai_quantum_algorithm" ON "wai_quantum_routing" USING btree ("routing_algorithm");--> statement-breakpoint
CREATE INDEX "idx_wai_quantum_created" ON "wai_quantum_routing" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_wai_rbac_role" ON "wai_rbac_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_wai_rbac_org" ON "wai_rbac_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_rbac_scope" ON "wai_rbac_roles" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "idx_wai_routing_policy" ON "wai_routing_policies" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_wai_routing_status" ON "wai_routing_policies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_routing_priority" ON "wai_routing_policies" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_wai_sdk_project" ON "wai_sdk_configuration" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_wai_sdk_status" ON "wai_sdk_configuration" USING btree ("bootstrap_status");--> statement-breakpoint
CREATE INDEX "idx_wai_sdk_version" ON "wai_sdk_configuration" USING btree ("version");--> statement-breakpoint
CREATE INDEX "idx_wai_secret_id" ON "wai_secrets_management" USING btree ("secret_id");--> statement-breakpoint
CREATE INDEX "idx_wai_secret_org" ON "wai_secrets_management" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_secret_type" ON "wai_secrets_management" USING btree ("secret_type");--> statement-breakpoint
CREATE INDEX "idx_wai_asset_id" ON "wai_studio_assets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_wai_asset_type" ON "wai_studio_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "idx_wai_asset_project" ON "wai_studio_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_wai_asset_org" ON "wai_studio_assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_blueprint_id" ON "wai_studio_blueprints" USING btree ("blueprint_id");--> statement-breakpoint
CREATE INDEX "idx_wai_blueprint_type" ON "wai_studio_blueprints" USING btree ("blueprint_type");--> statement-breakpoint
CREATE INDEX "idx_wai_blueprint_category" ON "wai_studio_blueprints" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wai_blueprint_usage" ON "wai_studio_blueprints" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "idx_wai_experiment_id" ON "wai_studio_experiments" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "idx_wai_experiment_type" ON "wai_studio_experiments" USING btree ("experiment_type");--> statement-breakpoint
CREATE INDEX "idx_wai_experiment_status" ON "wai_studio_experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_experiment_project" ON "wai_studio_experiments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_wai_publishing_id" ON "wai_studio_publishing" USING btree ("publishing_id");--> statement-breakpoint
CREATE INDEX "idx_wai_publishing_type" ON "wai_studio_publishing" USING btree ("publishing_type");--> statement-breakpoint
CREATE INDEX "idx_wai_publishing_status" ON "wai_studio_publishing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wai_publishing_project" ON "wai_studio_publishing" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_wai_space_id" ON "wai_tenancy_spaces" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "idx_wai_space_org" ON "wai_tenancy_spaces" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_wai_space_parent" ON "wai_tenancy_spaces" USING btree ("parent_space_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_conversations_conversation_id" ON "wizards_ai_conversations" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_conversations_founder_id" ON "wizards_ai_conversations" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_conversations_startup_id" ON "wizards_ai_conversations" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_messages_message_id" ON "wizards_ai_messages" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_messages_conversation_id" ON "wizards_ai_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_ai_messages_role" ON "wizards_ai_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_wizards_analytics_startup_id" ON "wizards_analytics" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_analytics_metric_type" ON "wizards_analytics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_analytics_timestamp" ON "wizards_analytics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_wizards_reviews_application_id" ON "wizards_application_reviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_reviews_reviewer_id" ON "wizards_application_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_applications_application_id" ON "wizards_applications" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_applications_user_id" ON "wizards_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_applications_cohort_id" ON "wizards_applications" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_applications_status" ON "wizards_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifact_versions_artifact_id" ON "wizards_artifact_versions" USING btree ("artifact_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifact_versions_version" ON "wizards_artifact_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifacts_startup_id" ON "wizards_artifacts" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifacts_type" ON "wizards_artifacts" USING btree ("artifact_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifacts_category" ON "wizards_artifacts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wizards_artifacts_studio_id" ON "wizards_artifacts" USING btree ("studio_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pipelines_startup_id" ON "wizards_automation_pipelines" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pipelines_type" ON "wizards_automation_pipelines" USING btree ("pipeline_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_pipelines_status" ON "wizards_automation_pipelines" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_code_repo_artifact_id" ON "wizards_code_repository" USING btree ("artifact_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_cohorts_cohort_id" ON "wizards_cohorts" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_cohorts_status" ON "wizards_cohorts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_cohorts_start_date" ON "wizards_cohorts" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_wizards_community_author_id" ON "wizards_community_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_community_post_type" ON "wizards_community_posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_community_category" ON "wizards_community_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wizards_course_enrollments_founder_id" ON "wizards_course_enrollments" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_course_enrollments_course_id" ON "wizards_course_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_course_enrollments_status" ON "wizards_course_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_course_lessons_module_id" ON "wizards_course_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_course_modules_course_id" ON "wizards_course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_courses_course_id" ON "wizards_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_courses_category" ON "wizards_courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wizards_courses_is_published" ON "wizards_courses" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_wizards_credits_founder_id" ON "wizards_credit_transactions" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_credits_type" ON "wizards_credit_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_demo_days_event_id" ON "wizards_demo_days" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_demo_days_cohort_id" ON "wizards_demo_days" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_demo_days_event_date" ON "wizards_demo_days" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "idx_wizards_demo_days_status" ON "wizards_demo_days" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_deployments_startup_id" ON "wizards_deployments" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_deployments_environment" ON "wizards_deployments" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "idx_wizards_deployments_status" ON "wizards_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_design_assets_artifact_id" ON "wizards_design_assets" USING btree ("artifact_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_direct_messages_message_id" ON "wizards_direct_messages" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_direct_messages_sender_id" ON "wizards_direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_direct_messages_recipient_id" ON "wizards_direct_messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_direct_messages_is_read" ON "wizards_direct_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_wizards_experiments_startup_id" ON "wizards_experiments" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_experiments_status" ON "wizards_experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_experiments_type" ON "wizards_experiments" USING btree ("experiment_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_upload_chunks_upload_id" ON "wizards_file_upload_chunks" USING btree ("upload_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_upload_chunks_upload_chunk" ON "wizards_file_upload_chunks" USING btree ("upload_id","chunk_index");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_uploads_upload_id" ON "wizards_file_uploads" USING btree ("upload_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_uploads_startup_id" ON "wizards_file_uploads" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_uploads_status" ON "wizards_file_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_file_uploads_storage_provider" ON "wizards_file_uploads" USING btree ("storage_provider");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_categories_slug" ON "wizards_forum_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_posts_post_id" ON "wizards_forum_posts" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_posts_category_id" ON "wizards_forum_posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_posts_author_id" ON "wizards_forum_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_replies_reply_id" ON "wizards_forum_replies" USING btree ("reply_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_replies_post_id" ON "wizards_forum_replies" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_forum_replies_author_id" ON "wizards_forum_replies" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_founders_user_id" ON "wizards_founders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_founders_stage" ON "wizards_founders" USING btree ("startup_stage");--> statement-breakpoint
CREATE INDEX "idx_wizards_founders_tier" ON "wizards_founders" USING btree ("subscription_tier");--> statement-breakpoint
CREATE INDEX "idx_wizards_growth_metrics_startup_id" ON "wizards_growth_metrics" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_growth_metrics_date" ON "wizards_growth_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_wizards_templates_template_id" ON "wizards_industry_templates" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_templates_industry" ON "wizards_industry_templates" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "idx_wizards_templates_complexity" ON "wizards_industry_templates" USING btree ("complexity");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_connections_startup_id" ON "wizards_investor_connections" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_connections_investor_id" ON "wizards_investor_connections" USING btree ("investor_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_connections_status" ON "wizards_investor_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_matches_startup_id" ON "wizards_investor_matches" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_matches_investor_id" ON "wizards_investor_matches" USING btree ("investor_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_matches_score" ON "wizards_investor_matches" USING btree ("match_score");--> statement-breakpoint
CREATE INDEX "idx_wizards_investor_matches_status" ON "wizards_investor_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_investors_user_id" ON "wizards_investors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_investors_type" ON "wizards_investors" USING btree ("investor_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_investors_verified" ON "wizards_investors" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "idx_wizards_journey_startup_id" ON "wizards_journey_timeline" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_journey_event_type" ON "wizards_journey_timeline" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_lesson_progress_enrollment_id" ON "wizards_lesson_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_lesson_progress_lesson_id" ON "wizards_lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_marketplace_seller_id" ON "wizards_marketplace" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_marketplace_item_type" ON "wizards_marketplace" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_marketplace_category" ON "wizards_marketplace" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_feedback_session_id" ON "wizards_mentor_feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_matches_startup_id" ON "wizards_mentor_matches" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_matches_mentor_id" ON "wizards_mentor_matches" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_matches_status" ON "wizards_mentor_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_sessions_session_id" ON "wizards_mentor_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_sessions_match_id" ON "wizards_mentor_sessions" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_sessions_status" ON "wizards_mentor_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentor_sessions_scheduled_date" ON "wizards_mentor_sessions" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentors_user_id" ON "wizards_mentors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentors_type" ON "wizards_mentors" USING btree ("mentor_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_mentors_availability" ON "wizards_mentors" USING btree ("availability");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_startup_id" ON "wizards_orchestration_jobs" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_session_id" ON "wizards_orchestration_jobs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_orchestration_id" ON "wizards_orchestration_jobs" USING btree ("orchestration_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_status" ON "wizards_orchestration_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_job_type" ON "wizards_orchestration_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_orch_jobs_available_at" ON "wizards_orchestration_jobs" USING btree ("available_at");--> statement-breakpoint
CREATE INDEX "idx_wizards_pipeline_runs_pipeline_id" ON "wizards_pipeline_runs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pipeline_runs_status" ON "wizards_pipeline_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_pitch_feedback_pitch_id" ON "wizards_pitch_feedback" USING btree ("pitch_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pitches_pitch_id" ON "wizards_pitches" USING btree ("pitch_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pitches_demo_day_id" ON "wizards_pitches" USING btree ("demo_day_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_pitches_startup_id" ON "wizards_pitches" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_referrals_referrer_id" ON "wizards_referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_referrals_code" ON "wizards_referrals" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_wizards_referrals_status" ON "wizards_referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_storage_providers_provider_id" ON "wizards_storage_providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_storage_providers_type" ON "wizards_storage_providers" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_storage_providers_is_active" ON "wizards_storage_providers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_wizards_deliverables_session_id" ON "wizards_studio_deliverables" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_deliverables_type" ON "wizards_studio_deliverables" USING btree ("deliverable_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_sessions_startup_id" ON "wizards_studio_sessions" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_sessions_studio_id" ON "wizards_studio_sessions" USING btree ("studio_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_sessions_status" ON "wizards_studio_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_tasks_session_id" ON "wizards_studio_tasks" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_tasks_status" ON "wizards_studio_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_tasks_type" ON "wizards_studio_tasks" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "idx_wizards_studios_studio_id" ON "wizards_studios" USING btree ("studio_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_studios_category" ON "wizards_studios" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_wizards_studios_sequence" ON "wizards_studios" USING btree ("sequence");--> statement-breakpoint
CREATE INDEX "idx_wizards_subscriptions_founder_id" ON "wizards_subscriptions" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_subscriptions_plan" ON "wizards_subscriptions" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "idx_wizards_subscriptions_status" ON "wizards_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wizards_template_usage_startup_id" ON "wizards_template_usage" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_template_usage_template_id" ON "wizards_template_usage" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_usage_founder_id" ON "wizards_usage_tracking" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_usage_startup_id" ON "wizards_usage_tracking" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_wizards_usage_resource_type" ON "wizards_usage_tracking" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "idx_workflow_exec_v9_pattern" ON "workflow_executions_v9" USING btree ("pattern_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_exec_v9_status" ON "workflow_executions_v9" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_workflow_exec_v9_user" ON "workflow_executions_v9" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_exec_v9_session" ON "workflow_executions_v9" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_exec_v9_created" ON "workflow_executions_v9" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_workflow_patterns_type" ON "workflow_patterns" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_workflow_patterns_coordination" ON "workflow_patterns" USING btree ("coordination_type");--> statement-breakpoint
CREATE INDEX "idx_workflow_patterns_status" ON "workflow_patterns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_workflow_patterns_created_by" ON "workflow_patterns" USING btree ("created_by");