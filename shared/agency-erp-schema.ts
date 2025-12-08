import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { marketingVerticals } from "./market360-schema";

export const brandStatuses = ["onboarding", "active", "paused", "churned"] as const;
export const servicePackageTypes = ["full_service", "partial", "project_based", "retainer"] as const;
export const invoiceStatuses = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export const paymentMethods = ["bank_transfer", "upi", "card", "cheque", "cash"] as const;
export const communicationTypes = ["email", "call", "meeting", "whatsapp", "note"] as const;
export const projectStatuses = ["planning", "in_progress", "review", "completed", "on_hold"] as const;
export const taskPriorities = ["low", "medium", "high", "urgent"] as const;
export const userRoles = ["admin", "account_manager", "content_creator", "analyst", "brand_owner", "brand_viewer"] as const;

export const brands = pgTable("erp_brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  gstin: varchar("gstin", { length: 20 }),
  pan: varchar("pan", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("India"),
  pincode: varchar("pincode", { length: 20 }),
  status: varchar("status", { length: 50 }).default("onboarding"),
  onboardingProgress: integer("onboarding_progress").default(0),
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("INR"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata"),
  primaryLanguage: varchar("primary_language", { length: 50 }).default("en"),
  targetLanguages: jsonb("target_languages").default('["en", "hi"]'),
  targetRegions: jsonb("target_regions").default('["India"]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("brands_status_idx").on(table.status),
  industryIdx: index("brands_industry_idx").on(table.industry),
}));

export const brandGuidelines = pgTable("erp_brand_guidelines", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  logoUrl: varchar("logo_url", { length: 512 }),
  logoVariants: jsonb("logo_variants").default('{}'),
  primaryColor: varchar("primary_color", { length: 20 }),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  accentColor: varchar("accent_color", { length: 20 }),
  colorPalette: jsonb("color_palette").default('[]'),
  primaryFont: varchar("primary_font", { length: 100 }),
  secondaryFont: varchar("secondary_font", { length: 100 }),
  fontStyles: jsonb("font_styles").default('{}'),
  toneOfVoice: text("tone_of_voice"),
  brandPersonality: jsonb("brand_personality").default('[]'),
  targetAudience: text("target_audience"),
  audiencePersonas: jsonb("audience_personas").default('[]'),
  competitorBrands: jsonb("competitor_brands").default('[]'),
  keyMessages: jsonb("key_messages").default('[]'),
  dosDonts: jsonb("dos_donts").default('{}'),
  socialHandles: jsonb("social_handles").default('{}'),
  brandAssets: jsonb("brand_assets").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("guidelines_brand_idx").on(table.brandId),
}));

export const brandContacts = pgTable("erp_brand_contacts", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 100 }),
  department: varchar("department", { length: 100 }),
  isPrimary: boolean("is_primary").default(false),
  isDecisionMaker: boolean("is_decision_maker").default(false),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  brandIdx: index("contacts_brand_idx").on(table.brandId),
  emailIdx: index("contacts_email_idx").on(table.email),
}));

export const servicePackages = pgTable("erp_service_packages", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  packageType: varchar("package_type", { length: 50 }).default("full_service"),
  verticals: jsonb("verticals").default('[]'),
  monthlyRetainer: numeric("monthly_retainer", { precision: 12, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  slaConfig: jsonb("sla_config").default('{}'),
  deliverables: jsonb("deliverables").default('[]'),
  kpis: jsonb("kpis").default('[]'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("packages_brand_idx").on(table.brandId),
  activeIdx: index("packages_active_idx").on(table.isActive),
}));

export const contracts = pgTable("erp_contracts", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  packageId: integer("package_id").references(() => servicePackages.id),
  contractNumber: varchar("contract_number", { length: 50 }),
  title: varchar("title", { length: 255 }),
  value: numeric("value", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("INR"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  renewalDate: date("renewal_date"),
  autoRenewal: boolean("auto_renewal").default(false),
  status: varchar("status", { length: 50 }).default("draft"),
  documentUrl: varchar("document_url", { length: 512 }),
  terms: jsonb("terms").default('{}'),
  signedByClient: boolean("signed_by_client").default(false),
  signedByAgency: boolean("signed_by_agency").default(false),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("contracts_brand_idx").on(table.brandId),
  statusIdx: index("contracts_status_idx").on(table.status),
}));

export const invoices = pgTable("erp_invoices", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  contractId: integer("contract_id").references(() => contracts.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("18"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  lineItems: jsonb("line_items").default('[]'),
  notes: text("notes"),
  termsConditions: text("terms_conditions"),
  cgst: numeric("cgst", { precision: 12, scale: 2 }),
  sgst: numeric("sgst", { precision: 12, scale: 2 }),
  igst: numeric("igst", { precision: 12, scale: 2 }),
  hsn: varchar("hsn", { length: 20 }),
  placeOfSupply: varchar("place_of_supply", { length: 100 }),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("invoices_brand_idx").on(table.brandId),
  statusIdx: index("invoices_status_idx").on(table.status),
  invoiceNumberIdx: index("invoices_number_idx").on(table.invoiceNumber),
}));

export const payments = pgTable("erp_payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  paymentDate: timestamp("payment_date").notNull(),
  bankDetails: jsonb("bank_details").default('{}'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  invoiceIdx: index("payments_invoice_idx").on(table.invoiceId),
  brandIdx: index("payments_brand_idx").on(table.brandId),
}));

export const communicationLogs = pgTable("erp_communication_logs", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  contactId: integer("contact_id").references(() => brandContacts.id),
  type: varchar("type", { length: 50 }).notNull(),
  channel: varchar("channel", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  attachments: jsonb("attachments").default('[]'),
  direction: varchar("direction", { length: 20 }).default("outbound"),
  recordingUrl: varchar("recording_url", { length: 512 }),
  duration: integer("duration"),
  loggedBy: varchar("logged_by", { length: 255 }),
  occurredAt: timestamp("occurred_at").notNull(),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  brandIdx: index("comm_brand_idx").on(table.brandId),
  typeIdx: index("comm_type_idx").on(table.type),
  occurredIdx: index("comm_occurred_idx").on(table.occurredAt),
}));

export const projects = pgTable("erp_projects", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  vertical: varchar("vertical", { length: 50 }),
  status: varchar("status", { length: 50 }).default("planning"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  progress: integer("progress").default(0),
  assignedTo: jsonb("assigned_to").default('[]'),
  tags: jsonb("tags").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("projects_brand_idx").on(table.brandId),
  statusIdx: index("projects_status_idx").on(table.status),
}));

export const projectMilestones = pgTable("erp_project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 50 }).default("pending"),
  deliverables: jsonb("deliverables").default('[]'),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("milestones_project_idx").on(table.projectId),
}));

export const tasks = pgTable("erp_tasks", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id),
  projectId: integer("project_id").references(() => projects.id),
  campaignId: integer("campaign_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assigneeId: varchar("assignee_id", { length: 255 }),
  assigneeName: varchar("assignee_name", { length: 255 }),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: numeric("estimated_hours", { precision: 6, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 6, scale: 2 }),
  tags: jsonb("tags").default('[]'),
  checklist: jsonb("checklist").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("tasks_brand_idx").on(table.brandId),
  projectIdx: index("tasks_project_idx").on(table.projectId),
  statusIdx: index("tasks_status_idx").on(table.status),
  assigneeIdx: index("tasks_assignee_idx").on(table.assigneeId),
}));

export const brandAnalytics = pgTable("erp_brand_analytics", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  vertical: varchar("vertical", { length: 50 }),
  period: varchar("period", { length: 20 }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  metrics: jsonb("metrics").default('{}'),
  kpis: jsonb("kpis").default('{}'),
  insights: jsonb("insights").default('[]'),
  roi: numeric("roi", { precision: 8, scale: 2 }),
  spend: numeric("spend", { precision: 12, scale: 2 }),
  revenue: numeric("revenue", { precision: 14, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  brandIdx: index("analytics_brand_idx").on(table.brandId),
  periodIdx: index("analytics_period_idx").on(table.periodStart, table.periodEnd),
}));

export const reports = pgTable("erp_reports", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }),
  config: jsonb("config").default('{}'),
  filters: jsonb("filters").default('{}'),
  schedule: jsonb("schedule").default('{}'),
  lastGeneratedAt: timestamp("last_generated_at"),
  outputUrl: varchar("output_url", { length: 512 }),
  recipients: jsonb("recipients").default('[]'),
  isTemplate: boolean("is_template").default(false),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  brandIdx: index("reports_brand_idx").on(table.brandId),
}));

export const agencyUsers = pgTable("erp_agency_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("content_creator"),
  department: varchar("department", { length: 100 }),
  avatar: varchar("avatar", { length: 512 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  permissions: jsonb("permissions").default('[]'),
  assignedBrands: jsonb("assigned_brands").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
}));

export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandGuidelinesSchema = createInsertSchema(brandGuidelines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandContactSchema = createInsertSchema(brandContacts).omit({ id: true, createdAt: true });
export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgencyUserSchema = createInsertSchema(agencyUsers).omit({ id: true, createdAt: true, updatedAt: true });

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type BrandGuidelines = typeof brandGuidelines.$inferSelect;
export type InsertBrandGuidelines = z.infer<typeof insertBrandGuidelinesSchema>;
export type BrandContact = typeof brandContacts.$inferSelect;
export type InsertBrandContact = z.infer<typeof insertBrandContactSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type AgencyUser = typeof agencyUsers.$inferSelect;
export type InsertAgencyUser = z.infer<typeof insertAgencyUserSchema>;
