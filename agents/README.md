# Paperclip Agent Instruction Files

This directory contains the extracted instruction files for all Paperclip agents in the Fenix Alliance organization.

These files were extracted from the Paperclip instance at:
`C:\Users\PC\.paperclip\instances\default\companies\87ab9199-552c-4082-877a-03cbdd70a27e\agents\`

## Purpose

Extracting these files into the repository allows:
- Editing agent instructions in VS Code
- Version control of agent configurations
- Easy comparison and sharing of agent setups
- Better collaboration on agent design

## Agent Directory

| Agent ID | Role | Reports To | Instruction Files |
|----------|------|------------|-------------------|
| `6e8b465c-1126-4add-b041-393340df1e4c` | **CEO** (Daniel Lozano Navas) | - | AGENTS.md, HEARTBEAT.md, RESUME.md, SOUL.md, TOOLS.md |
| `991d45d9-a9df-46e6-988b-1a21df1a2129` | **CTO** (Chief Technology Officer) | CEO | AGENTS.md |
| `869e07ec-39a5-4f46-8979-7d2ca9bf5b58` | **CMO** (Chief Marketing Officer) | CEO | AGENTS.md |
| `c467b987-6264-40a3-8f0a-1f2323f9e29a` | **CFO** (Chief Financial Officer) | CEO | AGENTS.md |
| `fbc8bb09-6165-4195-9806-7e5d9900cdcc` | **COO** (Chief Operating Officer) | CEO | AGENTS.md |
| `69ccf493-0649-4ba1-9436-0b52e007859c` | **CPO** (Chief Product Officer) | CEO | AGENTS.md |
| `a65b81f9-57d8-4412-b8d3-44bb9f45762b` | **VP of Engineering** | CTO | AGENTS.md |
| `198cb758-9b3c-44df-901d-ea52704af900` | **DevOps Lead** | CTO | AGENTS.md |
| `998e427c-98eb-4ba7-9601-6277c93fd3f9` | **Growth Manager** | CMO | AGENTS.md |
| `75af1a98-e2cd-48e1-95f1-13e0f873f4a0` | **Technical Evangelist** | - | AGENTS.md, SOUL.md |
| `172f1ca7-d11b-4910-a88b-d7355b11bd90` | **Chief of Learning** | CEO | AGENTS.md |
| `69379b12-c157-47ae-9257-afa24c9654de` | **Support Manager** | COO | AGENTS.md |

## Instruction File Types

### AGENTS.md
The primary instruction file defining the agent's role, responsibilities, decision-making framework, and operating model. Present for all agents.

### HEARTBEAT.md
Defines the agent's continuous operation loop, periodic checks, and autonomous behaviors. Currently only used by the CEO agent.

### RESUME.md
Contains context about ongoing work, recent decisions, and state that should persist across sessions. Currently only used by the CEO agent.

### SOUL.md
Defines the agent's personality, communication style, and behavioral patterns. Currently used by CEO and Technical Evangelist agents.

### TOOLS.md
Documents the tools and capabilities available to the agent and how to use them effectively. Currently only used by the CEO agent.

## Organizational Hierarchy

```
CEO (Daniel Lozano Navas)
├── CTO (Chief Technology Officer)
│   ├── VP of Engineering
│   └── DevOps Lead
├── CMO (Chief Marketing Officer)
│   └── Growth Manager
├── CFO (Chief Financial Officer)
├── COO (Chief Operating Officer)
│   └── Support Manager
├── CPO (Chief Product Officer)
└── Chief of Learning

Technical Evangelist (independent)
```

## Synchronization

To sync changes back to the Paperclip instance, copy the modified files from this directory back to:
`C:\Users\PC\.paperclip\instances\default\companies\87ab9199-552c-4082-877a-03cbdd70a27e\agents\{agent-id}\instructions\`

**Note:** Changes to instruction files in this repository do NOT automatically update the running Paperclip agents. You must manually sync the files or implement an automated sync process.

## Last Extracted

**Date:** 2026-06-12
**Source:** Paperclip instance at `C:\Users\PC\.paperclip\instances\default\companies\87ab9199-552c-4082-877a-03cbdd70a27e\agents\`
**Total Agents:** 12
