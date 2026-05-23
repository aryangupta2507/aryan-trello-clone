# Aryan Trello Clone

A fullstack Trello-style project management application inspired by Trello’s UI and workflow management system. Built using Next.js, Prisma ORM, PostgreSQL, and TypeScript.

---

## Features

### Board Management
- Create boards
- View boards with lists and cards

### Lists Management
- Create, edit, and delete lists
- Drag and drop list reordering

### Cards Management
- Create cards
- Edit card title and description
- Drag and drop cards between lists
- Reorder cards within a list
- Archive cards

### Card Details
- Labels support
- Due dates
- Checklist with progress tracking
- Member assignment
- Comments system
- Card covers

### Search & Filters
- Search cards by title
- Filter by:
  - Labels
  - Members
  - Due dates

### Additional Features
- Responsive Trello-inspired UI
- PostgreSQL integration
- Seeded demo data
- Smooth drag-and-drop interactions

---

# Tech Stack

## Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Next.js Server Actions
- Prisma ORM

## Database
- PostgreSQL (Neon)

## Drag and Drop
- dnd-kit

---

# Database Schema

The database schema was designed manually using Prisma ORM with proper relational mapping between:

- Boards
- Lists
- Cards
- Members
- Labels
- Checklist Items
- Comments

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/aryangupta2507/aryan-trello-clone.git
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_postgresql_connection_string"
```

## 4. Run Prisma Migration

```bash
npx prisma migrate dev
```

## 5. Seed Database

```bash
npx prisma db seed
```

## 6. Start Development Server

```bash
npm run dev
```

---
## Screenshots

### Dashboard
<img width="1915" height="970" alt="dashboard png" src="https://github.com/user-attachments/assets/c1f3b758-4dd4-4c81-aa27-a5befbc3ce90" />

### Board Management
<img width="1911" height="946" alt="board-view png" src="https://github.com/user-attachments/assets/e8daff76-04a6-4444-b9ba-0d9685f3a8c6" />

### Drag and Drop Functionality
<img width="1914" height="942" alt="drag-drop png" src="https://github.com/user-attachments/assets/063ac9d0-36d0-427d-ab84-1b254c6fcc2f" />

### Card Details Modal
<img width="1918" height="971" alt="card-modal png" src="https://github.com/user-attachments/assets/6bdd57f8-57bb-44e6-b1a3-1d23706ff5f3" />

### Filters Section
<img width="1907" height="942" alt="filters png" src="https://github.com/user-attachments/assets/2d5263f2-8c7e-4d00-9538-4bb1aaf1f148" />

# Deployment

- Frontend & Backend: Vercel
- Database: Neon PostgreSQL

---

# Author

Aryan Gupta
