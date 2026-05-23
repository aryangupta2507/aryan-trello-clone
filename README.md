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

# Deployment

- Frontend & Backend: Vercel
- Database: Neon PostgreSQL

---

# Author

Aryan Gupta
