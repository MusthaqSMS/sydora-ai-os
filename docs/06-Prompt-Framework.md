# Sydora AI Platform – Prompt Engineering Framework

Version: 1.0

---

# Purpose

This document defines the universal prompt standard used by every AI agent in Sydora AI Platform.

Every AI agent must follow the same structure to ensure consistency, quality, maintainability, and scalability.

---

# Universal Prompt Structure

Every AI prompt contains the following sections:

1. Identity
2. Mission
3. Role
4. Responsibilities
5. Inputs
6. Outputs
7. Context
8. Knowledge Sources
9. Memory Scope
10. Tools
11. Constraints
12. Decision Rules
13. Standard Operating Procedure (SOP)
14. Response Format
15. Quality Checklist
16. Error Handling
17. Escalation Rules
18. Examples
19. Model Configuration
20. Version Control

---

# Identity

Example

Agent Name

Keyword Research AI

Department

SEO

Reports To

SEO Director AI

---

# Mission

One sentence describing the objective.

Example

Generate the highest quality keyword research for any business.

---

# Responsibilities

Example

- Analyze business
- Research competitors
- Find keywords
- Cluster keywords
- Search intent analysis
- Opportunity scoring

---

# Inputs

Business Name

Website

Industry

Target Country

Target City

Language

Competitors

Goals

Budget

---

# Outputs

Keyword Report

Topic Clusters

Search Intent

Difficulty

Content Opportunities

Recommendations

---

# Context

The agent always receives:

Organization Context

↓

Client Context

↓

Project Context

↓

Task Context

---

# Knowledge Sources

Internal SOPs

Templates

Brand Guidelines

Client History

Previous Reports

Industry Knowledge

Documentation

---

# Memory Scope

Read

Global Memory

Organization Memory

Client Memory

Project Memory

Write

Task Memory

Execution Log

---

# Tools

Google Search

Supabase

RAG Engine

Internal APIs

Future MCP Servers

---

# Constraints

Never invent facts

Never modify client data

Follow SEO best practices

Respect brand voice

Cite sources where possible

Escalate uncertain decisions

---

# Decision Rules

If confidence >95%

↓

Proceed automatically

If confidence 70–95%

↓

Flag for QA

If confidence <70%

↓

Escalate

---

# Standard Operating Procedure

Step 1

Understand request

↓

Step 2

Collect context

↓

Step 3

Retrieve knowledge

↓

Step 4

Execute task

↓

Step 5

Validate output

↓

Step 6

Return structured result

---

# Response Format

Summary

Detailed Analysis

Recommendations

Priority

Next Steps

Confidence Score

---

# Quality Checklist

Grammar

Accuracy

Completeness

Brand Compliance

SEO Compliance

Formatting

No Hallucinations

---

# Error Handling

Missing Inputs

↓

Request Information

Tool Failure

↓

Retry

Low Confidence

↓

Escalate

Unexpected Error

↓

Log + Notify

---

# Escalation Rules

Specialist AI

↓

Director AI

↓

CEO AI

↓

Human

---

# Prompt Example

Role

SEO Keyword Research Specialist

Task

Research keywords for a hotel in Chennai.

Output

Clustered keyword report with search intent.

---

# Model Configuration

Preferred Model

Gemini

Fallback

GPT

Future

Claude

Open Models

---

# Version Control

Prompt Version

Owner

Updated Date

Change Log

Approval Status

---

# Prompt Design Principles

- Modular
- Reusable
- Deterministic
- Observable
- Secure
- Human-in-the-loop
- Context Aware
- Memory Driven
- Tool Driven
- Scalable

---

End of Document