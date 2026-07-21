# Sydora AI Platform – Database Design

Version: 1.0
Status: Architecture
Author: Sydora Digital

---

# Purpose

This document defines the enterprise database architecture for Sydora AI Platform.

The database is designed to support:

- Multi-tenant SaaS
- AI Workforce
- CRM
- Marketing Operations
- Knowledge Base (RAG)
- Workflow Automation
- Reporting
- Billing
- Future AI Expansion

---

# Database Engine

Database

PostgreSQL (Supabase)

Architecture

Multi-Tenant

Primary Key

UUID

Security

Row Level Security (RLS)

Storage

Supabase Storage

Authentication

Supabase Auth

---

# Database Principles

Every table must:

- Use UUID Primary Keys
- Include timestamps
- Support audit logging
- Support soft delete
- Support multi-tenancy
- Use foreign keys
- Be API friendly

---

# Standard Columns

Every business table should contain:

| Column | Type | Description |
|----------|------|-------------|
| id | UUID | Primary Key |
| organization_id | UUID | Organization Owner |
| created_at | Timestamp | Created Date |
| updated_at | Timestamp | Updated Date |
| created_by | UUID | Created By |
| updated_by | UUID | Updated By |
| is_active | Boolean | Active Status |
| is_deleted | Boolean | Soft Delete |

---

# Module 1

## Organizations

Purpose

Represents agencies using Sydora AI Platform.

Main Tables

- organizations
- organization_settings
- organization_branding

Relationships

Organization

↓

Users

↓

Clients

↓

Projects

---

# Module 2

## Users

Purpose

Stores every platform user.

Tables

- users
- roles
- permissions
- user_roles
- user_sessions

Roles

- Super Admin
- Owner
- Manager
- Employee
- Client

---

# Module 3

## CRM

Tables

- clients
- client_contacts
- client_addresses
- client_notes
- projects
- tasks
- milestones

Relationships

Client

↓

Projects

↓

Tasks

↓

Reports

---

# Module 4

## AI Workforce

Purpose

Stores every AI employee.

Tables

- ai_departments
- ai_agents
- ai_skills
- ai_tools
- ai_prompts
- ai_prompt_versions
- ai_memories
- ai_logs

Relationships

Department

↓

Agent

↓

Prompt

↓

Memory

↓

Logs

---

# Module 5

## AI Conversations

Tables

- conversations
- messages
- ai_requests
- ai_responses
- conversation_memory

---

# Module 6

## Knowledge Base

Purpose

Central knowledge for every AI Agent.

Tables

- knowledge
- sops
- templates
- brand_guidelines
- playbooks
- case_studies
- faqs

---

# Module 7

## SEO

Tables

- seo_projects
- keywords
- keyword_rankings
- backlinks
- technical_audits
- local_seo

---

# Module 8

## Google Ads

Tables

- ads_accounts
- campaigns
- ad_groups
- keywords_ads
- ads
- conversions

---

# Module 9

## Content

Tables

- blogs
- landing_pages
- email_campaigns
- social_posts
- video_scripts

---

# Module 10

## Reports

Tables

- reports
- report_sections
- dashboards
- report_templates

---

# Module 11

## Workflow Engine

Tables

- workflows
- workflow_steps
- approvals
- automation_logs

---

# Module 12

## Integrations

Tables

- integrations
- api_credentials
- webhooks

Supported

- Google Ads
- GA4
- Search Console
- Meta
- LinkedIn
- Gmail
- Google Drive
- Zoho CRM
- WhatsApp

---

# Module 13

## File Storage

Tables

- folders
- files
- attachments

Storage

Supabase Storage

---

# Module 14

## Notifications

Tables

- notifications
- notification_settings

---

# Module 15

## Billing

Tables

- subscriptions
- invoices
- payments

---

# Module 16

## Audit

Tables

- audit_logs
- activity_logs
- login_history

---

# Index Strategy

Index

- organization_id
- client_id
- project_id
- ai_agent_id
- created_at
- status

Composite Indexes

- organization_id + client_id
- organization_id + project_id
- project_id + status

---

# Row Level Security

Every table must use RLS.

Policy

Users only access data belonging to their organization.

Clients only access their own projects.

Employees access assigned resources.

Super Admin bypasses restrictions.

---

# Naming Conventions

Tables

snake_case

Columns

snake_case

Primary Keys

id

Foreign Keys

entity_id

Booleans

is_active

is_deleted

Dates

created_at

updated_at

---

# Estimated Database Size

| Module | Tables |
|---------|--------|
| Platform | 3 |
| Users | 5 |
| CRM | 7 |
| AI Workforce | 8 |
| AI Conversations | 5 |
| Knowledge | 7 |
| SEO | 6 |
| Google Ads | 6 |
| Content | 5 |
| Reports | 4 |
| Workflow | 4 |
| Integrations | 3 |
| Storage | 3 |
| Notifications | 2 |
| Billing | 3 |
| Audit | 3 |

Total Estimated Tables

74

---

# Future Expansion

Future modules

- Marketplace
- AI Model Registry
- Voice Agents
- Image Generation
- Video Generation
- AI Training
- Plugin Store
- API Marketplace

---

# Database Goals

- Enterprise Ready
- Multi Tenant
- AI First
- Secure
- Scalable
- High Performance
- Modular
- API Ready
- Future Proof

---

# Implementation Roadmap

Phase 1

Core Platform

Phase 2

CRM

Phase 3

AI Workforce

Phase 4

Knowledge Base

Phase 5

Marketing Modules

Phase 6

Automation

Phase 7

Reporting

Phase 8

Billing

Phase 9

Marketplace

---

# End of Document