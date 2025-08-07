# systemPatterns.md

This document outlines the system architecture, key technical decisions, design patterns in use, component relationships, and critical implementation paths.

**System Architecture:**

- Next.js 15 app directory structure
- Modular React components for UI and logic
- File-based routing for sales, purchases, customers, and stock modules

**Key Technical Decisions:**

- Use of TanStack Table for editable, interactive tables
- Radix UI and custom components for consistent, accessible UI
- TypeScript for type safety and maintainability

**Design Patterns:**

- Separation of concerns via hooks, UI, and data models
- Reusable combobox and input components
- Centralized types for products and invoices

**Component Relationships:**

- DataTable and InputTable components orchestrate invoice editing
- AppCombobox and Checkbox are shared across modules
- Hooks provide data fetching and state management
