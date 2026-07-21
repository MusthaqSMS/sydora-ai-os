# Sydora AI Platform – Entity Relationship

Version: 1.0
Status: Draft
Author: Sydora Digital

---

# Purpose

This document defines how every business entity within Sydora AI Platform is related.

It serves as the blueprint for:

- Database Design
- API Design
- AI Agent Communication
- Workflow Engine
- Access Control
- Reporting

---

# Multi-Tenant Architecture

```
Platform
    │
    └── Organizations
            │
            ├── Users
            ├── Clients
            ├── AI Agents
            ├── Knowledge
            ├── Templates
            ├── Workflows
            ├── Reports
            ├── Integrations
            └── Billing
```

Every organization has completely isolated data.

---

# Organization Relationships

```
Organization

├── Users

├── Clients

├── Projects

├── AI Agents

├── Knowledge

├── Templates

├── Workflows

├── Integrations

└── Reports
```

One Organization

↓

Many Users

↓

Many Clients

↓

Many Projects

---

# User Relationships

```
User

├── Role

├── Assigned Projects

├── Assigned Tasks

├── Notifications

├── Activity Logs

└── AI Conversations
```

One User

↓

Many Tasks

↓

Many Notifications

↓

Many Conversations

---

# Client Relationships

```
Client

├── Contacts

├── Projects

├── Files

├── Campaigns

├── Reports

├── Conversations

└── Brand Assets
```

One Client

↓

Many Projects

↓

Many Campaigns

↓

Many Reports

---

# Project Relationships

```
Project

├── Tasks

├── Files

├── Reports

├── Campaigns

├── AI Requests

├── Conversations

├── Deliverables

└── Timeline
```

One Project

↓

Many Tasks

↓

Many Reports

↓

Many Deliverables

---

# AI Agent Relationships

```
AI Agent

├── Department

├── Prompt

├── Memory

├── Skills

├── Tools

├── Knowledge

├── Logs

├── KPIs

└── Versions
```

One AI Agent

↓

Many Conversations

↓

Many Tasks

↓

Many Logs

---

# Prompt Relationships

```
Prompt

├── AI Agent

├── Version

├── Variables

├── Examples

└── Guardrails
```

One Prompt

↓

Many Versions

---

# Knowledge Relationships

```
Knowledge

├── SOPs

├── Templates

├── Brand Guidelines

├── Playbooks

├── Case Studies

├── FAQs

└── Documents
```

Knowledge can be shared by multiple AI Agents.

---

# Workflow Relationships

```
Workflow

├── Trigger

├── Actions

├── Conditions

├── Approvals

├── Notifications

└── Logs
```

One Workflow

↓

Many Executions

---

# Campaign Relationships

```
Campaign

├── Keywords

├── Ads

├── Landing Pages

├── Budget

├── Performance

└── Reports
```

One Campaign

↓

Many Keywords

↓

Many Reports

---

# Report Relationships

```
Report

├── Project

├── Client

├── Campaign

├── AI Agent

├── Generated Date

└── Attachments
```

One Project

↓

Many Reports

---

# Memory Relationships

```
Global Memory

↓

Organization Memory

↓

Client Memory

↓

Project Memory

↓

Conversation Memory
```

Every AI Agent reads memory from the appropriate level.

---

# Conversation Relationships

```
Conversation

├── User

├── Client

├── Project

├── AI Agent

├── Messages

└── Attachments
```

One Conversation

↓

Many Messages

---

# Integration Relationships

```
Integration

├── Google Analytics

├── Search Console

├── Google Ads

├── Meta Ads

├── Gmail

├── Google Drive

├── Zoho CRM

├── WhatsApp

└── Webhooks
```

One Organization

↓

Many Integrations

---

# File Relationships

```
Files

├── Client

├── Project

├── Report

├── Conversation

└── Knowledge
```

Files can belong to multiple business entities through references.

---

# Audit Relationships

```
Audit Log

├── User

├── AI Agent

├── Action

├── Entity

├── Timestamp

└── Status
```

Every important system action is recorded.

---

# Complete Entity Map

```
Platform
│
└── Organization
    │
    ├── Users
    │      ├── Roles
    │      ├── Permissions
    │      ├── Notifications
    │      └── Activity Logs
    │
    ├── Clients
    │      ├── Contacts
    │      ├── Projects
    │      │      ├── Tasks
    │      │      ├── Campaigns
    │      │      ├── Reports
    │      │      ├── Files
    │      │      ├── Conversations
    │      │      └── Deliverables
    │      │
    │      └── Brand Assets
    │
    ├── AI Agents
    │      ├── Prompts
    │      ├── Skills
    │      ├── Memory
    │      ├── Tools
    │      ├── Logs
    │      └── Versions
    │
    ├── Knowledge
    │      ├── SOPs
    │      ├── Templates
    │      ├── Playbooks
    │      ├── Brand Guidelines
    │      └── Case Studies
    │
    ├── Workflows
    │
    ├── Reports
    │
    ├── Integrations
    │
    ├── Billing
    │
    └── Audit Logs
```

---

# Database Design Principles

- Multi-tenant architecture
- UUID primary keys
- Foreign key relationships
- Soft delete where appropriate
- Audit logging
- Version control
- AI-first architecture
- Scalable design
- Modular entities
- API-ready schema

---

# Next Document

03C-Database.md

This document will define:

- Complete SQL schema
- Tables
- Columns
- Relationships
- Indexes
- Constraints
- Row Level Security (RLS)
- Performance optimization

---

End of Document