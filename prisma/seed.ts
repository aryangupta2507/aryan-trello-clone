import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Cleaning up database...");
  await prisma.activity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.list.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.member.deleteMany({});

  console.log("Database cleaned.");

  // 1. Create Members
  console.log("Creating members...");

  const aryan = await prisma.member.create({
    data: {
      name: "Aryan Gupta",
      email: "aryan@example.com",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=039be5",
    },
  });

  const advika = await prisma.member.create({
    data: {
      name: "Advika Tiwari",
      email: "advika@example.com",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=8b5cf6",
    },
  });

  const rishi = await prisma.member.create({
    data: {
      name: "Rishi Soni",
      email: "rishi@example.com",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=RS&backgroundColor=10b981",
    },
  });

  console.log("Created 3 members.");

  // 2. Create Boards
  console.log("Creating sample board...");
  const board = await prisma.board.create({
    data: {
      title: "Project Alpha Roadmap",
      background: "from-blue-600 to-indigo-900",
      members: {
        connect: [{ id: aryan.id }, { id: advika.id }, { id: rishi.id }],
      },
    },
  });

  console.log(`Created board: ${board.title} (${board.id})`);

  // 3. Create Labels for this Board
  console.log("Creating board labels...");
  const labelHigh = await prisma.label.create({
    data: { title: "High Priority", color: "#ef4444", boardId: board.id },
  });
  const labelInReview = await prisma.label.create({
    data: { title: "In Review", color: "#eab308", boardId: board.id },
  });
  const labelCompleted = await prisma.label.create({
    data: { title: "Completed", color: "#22c55e", boardId: board.id },
  });
  const labelDesign = await prisma.label.create({
    data: { title: "Design", color: "#a855f7", boardId: board.id },
  });
  const labelMarketing = await prisma.label.create({
    data: { title: "Marketing", color: "#3b82f6", boardId: board.id },
  });

  console.log("Created board labels.");

  // 4. Create Lists
  console.log("Creating lists...");
  const listTodo = await prisma.list.create({
    data: { title: "To Do", position: 1000.0, boardId: board.id },
  });

  const listInProgress = await prisma.list.create({
    data: { title: "In Progress", position: 2000.0, boardId: board.id },
  });

  const listInReview = await prisma.list.create({
    data: { title: "In Review", position: 3000.0, boardId: board.id },
  });

  const listDone = await prisma.list.create({
    data: { title: "Done", position: 4000.0, boardId: board.id },
  });

  console.log("Created 4 lists.");

  // 5. Create Cards
  console.log("Creating cards...");

  // To Do List Cards
  const card1 = await prisma.card.create({
    data: {
      title: "Design Landing Page UI/UX",
      description:
        "Create hi-fi prototypes for the new landing page, focusing on conversion rates and responsiveness. We need sections for Hero, Features, Testimonials, and Pricing.",
      position: 1000.0,
      listId: listTodo.id,
      coverColor: "#a855f7", // purple cover
      labels: { connect: [{ id: labelDesign.id }, { id: labelHigh.id }] },
      members: { connect: [{ id: advika.id }, { id: aryan.id }] },
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: "Write blog post about launch",
      description:
        "Draft a 1000-word launch announcement highlighting the core features, team journey, and pricing model. Publish on Dev.to and Medium.",
      position: 2000.0,
      listId: listTodo.id,
      labels: { connect: [{ id: labelMarketing.id }] },
      members: { connect: [{ id: rishi.id }] },
    },
  });

  // In Progress List Cards
  const card3 = await prisma.card.create({
    data: {
      title: "Integrate Prisma Database Layer",
      description:
        "Set up schema.prisma and migrations. Configure connections for SQLite (dev) and PostgreSQL (prod). Make sure cascading deletes and proper indexes are verified.",
      position: 1000.0,
      listId: listInProgress.id,
      coverColor: "#3b82f6", // blue cover
      labels: { connect: [{ id: labelHigh.id }] },
      members: { connect: [{ id: aryan.id }] },
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    },
  });

  const card4 = await prisma.card.create({
    data: {
      title: "Set up Zustand global store",
      description:
        "Set up workspace states in Zustand, including support for optimistic UI updates during list and card drag-and-drop operations.",
      position: 2000.0,
      listId: listInProgress.id,
      members: { connect: [{ id: aryan.id }, { id: rishi.id }] },
    },
  });

  // In Review List Cards
  const card5 = await prisma.card.create({
    data: {
      title: "Implement drag-and-drop mechanics",
      description:
        "Integrate `@dnd-kit/core` and `@dnd-kit/sortable` inside lists and cards. Make sure smooth movement and placeholder alignments match Trello's UX.",
      position: 1000.0,
      listId: listInReview.id,
      labels: { connect: [{ id: labelInReview.id }] },
      members: { connect: [{ id: rishi.id }] },
    },
  });

  // Done List Cards
  const card6 = await prisma.card.create({
    data: {
      title: "Project Initialization",
      description:
        "Successfully bootstrap Next.js 15 app, add Tailwind CSS, install packages, and structure scalable folder trees.",
      position: 1000.0,
      listId: listDone.id,
      dueComplete: true,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      labels: { connect: [{ id: labelCompleted.id }] },
      members: { connect: [{ id: aryan.id }] },
    },
  });

  console.log("Created 6 cards.");

  // 6. Create Checklist Items
  console.log("Creating checklists...");
  await prisma.checklistItem.create({
    data: {
      title: "Create low-fidelity wireframes",
      isCompleted: true,
      cardId: card1.id,
    },
  });
  await prisma.checklistItem.create({
    data: {
      title: "Conduct user feedback session",
      isCompleted: false,
      cardId: card1.id,
    },
  });
  await prisma.checklistItem.create({
    data: {
      title: "Deliver Figma high-fidelity link",
      isCompleted: false,
      cardId: card1.id,
    },
  });

  await prisma.checklistItem.create({
    data: {
      title: "Initialize Prisma Client in src/lib/db.ts",
      isCompleted: true,
      cardId: card3.id,
    },
  });
  await prisma.checklistItem.create({
    data: {
      title: "Draft schema.prisma with relation links",
      isCompleted: true,
      cardId: card3.id,
    },
  });
  await prisma.checklistItem.create({
    data: {
      title: "Run local SQLite migrations",
      isCompleted: true,
      cardId: card3.id,
    },
  });
  await prisma.checklistItem.create({
    data: {
      title: "Seed database with mock information",
      isCompleted: false,
      cardId: card3.id,
    },
  });

  console.log("Created checklist items.");

  // 7. Create Comments
  console.log("Creating comments...");
  await prisma.comment.create({
    data: {
      text: "Advika, let's keep the conversion-focused Hero section near the top.",
      cardId: card1.id,
      memberId: aryan.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  await prisma.comment.create({
    data: {
      text: "Sure Aryan! I've started the wireframes already.",
      cardId: card1.id,
      memberId: advika.id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  await prisma.comment.create({
    data: {
      text: "Zustand is working nicely with devtools. Ready to integrate with dnd-kit.",
      cardId: card4.id,
      memberId: rishi.id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    },
  });

  console.log("Created comments.");

  // 8. Create Activity Logs
  console.log("Creating activity log entries...");
  await prisma.activity.create({
    data: { text: "created this board", boardId: board.id, memberId: aryan.id },
  });
  await prisma.activity.create({
    data: {
      text: "added Advika Tiwari to Project Alpha Roadmap",
      boardId: board.id,
      memberId: aryan.id,
    },
  });
  await prisma.activity.create({
    data: {
      text: "created card 'Design Landing Page UI/UX'",
      boardId: board.id,
      cardId: card1.id,
      memberId: aryan.id,
    },
  });
  await prisma.activity.create({
    data: {
      text: "assigned Advika Tiwari to 'Design Landing Page UI/UX'",
      boardId: board.id,
      cardId: card1.id,
      memberId: aryan.id,
    },
  });
  await prisma.activity.create({
    data: {
      text: "moved Integrations to In Progress",
      boardId: board.id,
      cardId: card3.id,
      memberId: aryan.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
