const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialDashboards = [
  {
    title: "FLN Assessment Dashboard 1-4",
    description: "Detailed analytics for Foundational Literacy and Numeracy assessments for classes 1 to 4.",
    linkUrl: "https://example.com/fln-1-4",
    order: 1,
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Catch-up Progress Dashboard 5-7",
    description: "Tracking the progress of students in catch-up programs for classes 5 to 7.",
    linkUrl: "https://example.com/catch-up-5-7",
    order: 2,
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "FLN Camp by Volunteers",
    description: "Metrics and impact tracking for community-driven FLN volunteer camps.",
    linkUrl: "https://example.com/fln-camps",
    order: 3,
    imageUrl: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Shiksha Mitra Visit Dashboard",
    description: "Monitoring school visits and observations made by Shiksha Mitras.",
    linkUrl: "https://example.com/shiksha-mitra",
    order: 4,
    imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Monthly School Planning Dashboard",
    description: "Strategic monthly planning metrics, schedules, and implementation status for schools.",
    linkUrl: "https://example.com/monthly-planning",
    order: 5,
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "School Profiling Dashboard",
    description: "Comprehensive demographic and infrastructural profiling data for all tribal schools.",
    linkUrl: "https://example.com/school-profiling",
    order: 6,
    imageUrl: "https://images.unsplash.com/photo-1510531704581-5b28709ec685?q=80&w=800&auto=format&fit=crop"
  }
];

async function main() {
  console.log("Seeding initial dashboards...");
  for (const db of initialDashboards) {
    await prisma.externalDashboard.create({
      data: db
    });
  }
  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
