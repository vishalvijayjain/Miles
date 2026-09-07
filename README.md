# Miles — Personal Work Tracker

A production-ready, full-stack, responsive personal work-item tracking application inspired by Jira ticket management, Kanban boards, and positive momentum analysis.

Designed from the ground up with **cross-device cloud persistence**, supporting up to **5 independent profiles/workspaces** with complete data isolation, date tracking with automated extension calculations, blocker management, real-time derived metrics, and clean repository-pattern architecture. Accessible seamlessly across **Desktop, iPhone, and Tablet**.

---

## 🌟 Key Features

* **Multi-Profile Isolation**:
  * Up to 5 independent profiles/workspaces (e.g., Personal, Client Projects, Open Source, Study).
  * Create, rename, and delete profiles (with confirmation safeguards).
  * Strict profile data isolation: every ticket belongs to exactly one `profileId`.
  * Sequential ticket IDs generated per profile (`TASK-001`, `TASK-002`, etc.).

* **Jira-Style Ticket Management**:
  * **Required fields**: Auto-generated Ticket ID, Title, Status (`To Do`, `In Progress`, `Closed`).
  * **Optional metadata**: Priority (`Low`, `Medium`, `High`, `Critical`), Type (`Task`, `Bug`, `Improvement`, `Personal`, `Other`), Start Date, Target End Date, Extension Period, Revised End Date, Blockers, Notes, Tags.
  * Form validation: Title required, target end date cannot precede start date, safe character limits.

* **Kanban Board**:
  * Three status columns: **To Do**, **In Progress**, **Closed**.
  * **HTML5 Drag-and-Drop**: Smooth drag-and-drop movement with drop zone indicators.
  * **Accessible non-drag alternative**: Quick status dropdown on each card and within the detail modal.
  * Bi-directional movement (`To Do ↔ In Progress ↔ Closed`).
  * Instant optimistic UI updates with automatic rollback on persistence failure.

* **Date, Extension & Overdue Logic**:
  * **Original Target Date** vs **Revised Deadline**.
  * Automatically calculates `Revised End Date = Original End Date + Extension Period (Days)`.
  * Visual indicators for extended items (`+Xd Extended`).
  * **Overdue calculation**: `Status != Closed AND Effective End Date < Today`.
  * Closed items are never marked overdue.

* **Blocker Management**:
  * Add, edit, and remove active blockers on any work item.
  * High-visibility badge and warning banner with the blocker description on cards and dashboards.

* **Dashboard & Derived Statistics**:
  * Real-time derived metrics: Total, To Do, In Progress, Closed, Blocked, Overdue, Extended, and Completion Rate %.
  * Interactive KPI cards: click any metric to filter the workspace instantly.
  * Focus watchlists: Active Blockers, Overdue items, Extended deadlines, and Recently updated items.

* **Search, Filtering & Sorting**:
  * Search by Ticket ID, Title, Description, Blockers, or Tags in real time.
  * Multi-dimensional filtering by Status, Priority, Type, Blocked, Overdue, and Extended.
  * Sorting by Priority, Deadline, Start Date, Creation Date, Updated Date, or Ticket ID.

* **Theming & Accessibility**:
  * Built-in Light Mode and Dark Mode with persistent user settings.
  * High-contrast color palettes adhering to WCAG AA guidelines.
  * Keyboard navigation, ARIA modal dialogs, and touch-friendly responsive layouts.

* **Demo Data Utility**:
  * One-click "Load Demo Data" button to seed realistic tickets showcasing bugs with blockers, extended tasks, and overdue work.
  * "Clear All Tickets" option to easily reset the current profile.

---

## 🏛️ Architecture & SOLID Principles

The application strictly adheres to the Dependency Inversion Principle, decoupling the UI and business logic from the underlying storage technology:

```text
┌─────────────────────────────────────────────────────────┐
│                     UI Components                       │
│  (Header, KanbanBoard, DashboardView, TicketModal, etc.)│
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│             Application State (React Context)           │
│        (Optimistic updates, state synchronization)      │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                 Services / Business Logic               │
│      (TicketService, ProfileService, SettingsService)   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                  Repository Interfaces                  │
│   (ITicketRepository, IProfileRepository, ISettingsRepo)│
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                 Storage Adapter Interface               │
│                     (IStorageAdapter)                   │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
┌─────────────▼─────────────┐ ┌─────────────▼─────────────┐
│   LocalStorageAdapter     │ │   CloudDatabaseAdapter    │
│  (Active Default Adapter) │ │ (Future Supabase/Postgres)│
└───────────────────────────┘ └───────────────────────────┘
```

### Decoupled Storage Layer

The UI never directly calls `localStorage`, `IndexedDB`, or cloud APIs. Instead:
- All operations call `TicketService` / `ProfileService`.
- Services call `TicketRepository` / `ProfileRepository`.
- Repositories interact with the generic `IStorageAdapter` interface:

```typescript
export interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### Swapping to a Cloud Database (e.g., Supabase / Firebase / Postgres)

To switch the storage backend to a cloud database, simply:
1. Create a class implementing `IStorageAdapter` (e.g., `CloudDatabaseAdapter.ts`).
2. Pass the new instance to the repositories in `src/context/AppContext.tsx`:
   ```typescript
   const cloudAdapter = new CloudDatabaseAdapter({ /* config */ });
   const profileRepo = new ProfileRepository(cloudAdapter);
   const ticketRepo = new TicketRepository(cloudAdapter);
   const settingsRepo = new SettingsRepository(cloudAdapter);
   ```
3. **Zero changes** are needed in UI components, modals, filters, or services!

---

## 📁 Project Structure

```text
src/
├── types/
│   └── index.ts                 # Strongly typed models (Ticket, Profile, Settings, etc.)
├── storage/
│   ├── IStorageAdapter.ts       # Generic asynchronous storage interface
│   └── LocalStorageAdapter.ts   # Safe, namespaced browser storage adapter
├── repositories/
│   ├── IProfileRepository.ts    # Profile repository contract
│   ├── ProfileRepository.ts     # Profile repository implementation
│   ├── ITicketRepository.ts     # Ticket repository contract
│   ├── TicketRepository.ts      # Profile-isolated ticket repository implementation
│   ├── ISettingsRepository.ts   # Settings repository contract
│   └── SettingsRepository.ts    # Settings repository implementation
├── services/
│   ├── ProfileService.ts        # Workspace business logic (5 profiles limit, validation)
│   ├── TicketService.ts         # Ticket business logic, ID generation, validation, stats
│   └── SettingsService.ts       # Preferences and active workspace coordination
├── utils/
│   ├── dateUtils.ts             # Date formatting, revised deadline, & overdue calculations
│   └── demoData.ts              # Sample ticket generator for realistic prototyping
├── context/
│   └── AppContext.tsx           # React Context state engine & optimistic update handler
├── components/
│   ├── common/
│   │   ├── Badge.tsx            # Priority, Status, Type, Blocker, & Extension badges
│   │   ├── Button.tsx           # Accessible buttons with variants and loading states
│   │   ├── Input.tsx            # Accessible styled input component
│   │   ├── Select.tsx           # Accessible select dropdown component
│   │   ├── Modal.tsx            # Accessible modal dialog with Escape & backdrop trap
│   │   ├── ConfirmDialog.tsx    # Deletion confirmation dialog
│   │   └── Toast.tsx            # Non-blocking status notification system
│   ├── layout/
│   │   ├── Header.tsx           # App header, workspace dropdown, navigation tabs, theme toggle
│   │   └── ProfileModal.tsx     # Workspace management (create, rename, delete)
│   ├── kanban/
│   │   ├── KanbanBoard.tsx      # Kanban container with filter integration
│   │   ├── KanbanColumn.tsx     # Column drop targets (To Do, In Progress, Closed)
│   │   └── KanbanCard.tsx       # Interactive card with drag handle & quick-action menu
│   ├── dashboard/
│   │   └── DashboardView.tsx    # Metric KPI cards, progress bar, blocker watchlist
│   └── tickets/
│       ├── FilterBar.tsx        # Search, status/priority filters, toggles, & sorting
│       ├── TicketModal.tsx      # Create, edit, and inspect ticket modal
│       └── TicketListView.tsx   # Comprehensive tabular list view
├── App.tsx                      # Root application layout
├── main.tsx                     # React DOM entry point
└── index.css                    # Tailwind CSS imports and dark mode configuration
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js 18+ or 20+
* npm or yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <REPO_NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory if you plan to integrate third-party cloud services:

```env
# Optional cloud database or API configuration
# CLOUD_DB_URL=
# CLOUD_DB_API_KEY=
```

See `.env.example` for reference.

---

## 🛠️ Build & Lint

To verify TypeScript types and build the production bundle:

```bash
# Typecheck
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

The production output is generated in the `dist/` directory.

---

## 🚀 Vercel Deployment

This project is configured out of the box for zero-config deployment on Vercel:

1. **Push to GitHub**:
   Push your repository to GitHub using the Google AI Studio export workflow or git CLI.

2. **Import into Vercel**:
   * Navigate to [vercel.com/new](https://vercel.com/new).
   * Select your GitHub repository.
   * Framework Preset: **Vite**.
   * Root Directory: `./`.
   * Build Command: `npm run build` (or leave default).
   * Output Directory: `dist` (or leave default).

3. **Deploy**:
   Click **Deploy**. Your Kanban tracker will be live globally in seconds!

---

## 🔮 Future Extensibility

* **Cloud Sync**: Swap `LocalStorageAdapter` for `CloudDatabaseAdapter` (Supabase, Firebase, or PostgreSQL).
* **Multi-User Authentication**: Add user sign-in (OAuth / Firebase Auth) while retaining workspace separation.
* **Activity & Audit History**: Log status changes, comments, and file attachments per ticket.
* **Export / Import**: JSON or CSV backup and import per workspace.

---

## 📄 License

Apache-2.0
