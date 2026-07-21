const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dashboards = [
  {
    title: "Shiksha Mitra Visit Dashboard",
    description: "Shows which school have been visited by shiksha mitra when, how many times and help us track school level support given by Shiksha Mitra to schools.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiMTVlOWI4NjYtYjhjOS00NGU5LWI0ZDMtN2UxZjgwMzM2MTU0IiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 1,
    imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "FLN Result Comparison Dashboard",
    description: "Developed to see the learning gains upto P.O level from 2024 to 2026 in comparative manner for each year across baseline, midline and endline.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiOTlmOWI2MmMtMGNhMy00ZGU1LTk1YjItZWQ3NjdiMTdiNGUyIiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 2,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Intensive Catch-up Dashboard",
    description: "For grades 5-7 catchup course on FLN was developed to make students improove FN proficiency for grades 5,6,7 before moving into grade wise curricula. The Intensive focused imlementation was done for 34 schools. This Dashboard is for the pilot.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiYjk5YWRmN2YtNTA3NC00ZDQ3LWEzZjItYzEzMGRjMDQyOTNhIiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 3,
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "P.O Ranking Dashboard",
    description: "This dashboard shows the support provided by the P.O's to implement the program qualitatively and quantitatively completing the required visits, meetinfgs and milestones.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiM2NmNWM3NzctNTJkMC00Mjc2LWJiMTItZDcwNzk1NTQzYTJjIiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 4,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "School Profile Dashboard",
    description: "To maintain and see school level enrollment data, availibility of staff and technical assessts. Done in 2025.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiM2Y5MDc2YjktOGE5Zi00OTY4LWE3YjAtMTVhNTIwZTk4NjAwIiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 5,
    imageUrl: "https://images.unsplash.com/photo-1510531704581-5b28709ec685?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Teacher Assessment Dashboard",
    description: "For assessments conducted by teachers in baseline of 2025, for this year assessments have been started once completed the data will be changed to 2026.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiOThhNTA3ZmItMjBjYS00ZDA3LWE5YTAtMGY0NGIxYWY2ZmM0IiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 6,
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Focused FLN Pilot",
    description: "Focused FLN pilot where volunteers were trained and deployed by Pratham to foculy work on FLN with selected schools in a 40 day camp mode. To see how daily activities reshape the students.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiZjhmNWM1Y2MtZmM3Ny00ZGE2LTgxZDItOTYwNjI1NjlmMjEyIiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 7,
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Summer Camp FLN Dashboard",
    description: "In april & may Pratham team conducted summer camps on FLN in communities. Based on the studnts engaged during the camp the data is showsn in dashbaords.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiODZiMWE1ZGYtYTMzOS00NDNiLWI3YmEtMGQ4NTI1YjRmNmY4IiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 8,
    imageUrl: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Dahanu P.O Specific Dashboard",
    description: "Dahanu being the project office with highest teacher assessment on record, We have created a seperte dashboard for the project officer to review school wise changes and progress. We aim other Project offices enhance their assessment coverage so similar support can be provided to them.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiMDRlNDcyN2ItMWU4Yi00MDU4LTkzYWQtODlmZDA0NjY2ZDg0IiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 9,
    imageUrl: "https://images.unsplash.com/photo-1571260899304-4250708f0591?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Annual Planning Dashboard",
    description: "Dashboard covers the annual planning given by the department on monthly basis activities are final and in the schedule. The dashboard checks the monthly basis engagement and completion of activities given on state wide level.",
    linkUrl: "https://app.powerbi.com/view?r=eyJrIjoiYjZjYzNkZTctMzFkNi00NjQzLWJjNWEtY2Q1MWQzMjNlYzY2IiwidCI6IjNlNTVmYWQ3LTMxODAtNGRhYi1iNDA0LWRkY2Q5ZDg0N2I2ZCJ9",
    order: 10,
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
  }
];

async function main() {
  console.log("Deleting old dashboards...");
  await prisma.externalDashboard.deleteMany({});
  
  console.log("Seeding new actual dashboards...");
  for (const db of dashboards) {
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
