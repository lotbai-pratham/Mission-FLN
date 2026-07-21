const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const imageMapping = [
  {
    titleContains: "Shiksha Mitra",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\shiksha_mitra_1784620311839.png",
    destName: "shiksha_mitra.png"
  },
  {
    titleContains: "Result Comparison",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\fln_result_1784620323887.png",
    destName: "fln_result.png"
  },
  {
    titleContains: "Intensive Catch",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\intensive_catchup_1784620334753.png",
    destName: "intensive_catchup.png"
  },
  {
    titleContains: "Ranking",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\po_ranking_1784620352181.png",
    destName: "po_ranking.png"
  },
  {
    titleContains: "School Profile",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\school_profile_1784620364926.png",
    destName: "school_profile.png"
  },
  {
    titleContains: "Teacher Assessment",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\teacher_assessment_1784620374245.png",
    destName: "teacher_assessment.png"
  },
  {
    titleContains: "Focused FLN",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\focused_fln_pilot_1784620387750.png",
    destName: "focused_fln_pilot.png"
  },
  {
    titleContains: "Summer Camp",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\summer_camp_fln_1784620400124.png",
    destName: "summer_camp_fln.png"
  },
  {
    titleContains: "Dahanu",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\dahanu_po_1784620410926.png",
    destName: "dahanu_po.png"
  },
  {
    titleContains: "Annual Planning",
    source: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\5dd96be0-72cb-4948-82aa-296372aded55\\annual_planning_1784620421856.png",
    destName: "annual_planning.png"
  }
];

async function main() {
  const publicDashboardsDir = path.join(__dirname, '..', 'public', 'dashboards');
  
  if (!fs.existsSync(publicDashboardsDir)) {
    fs.mkdirSync(publicDashboardsDir, { recursive: true });
  }

  const dashboards = await prisma.externalDashboard.findMany();

  for (const mapping of imageMapping) {
    if (fs.existsSync(mapping.source)) {
      const destPath = path.join(publicDashboardsDir, mapping.destName);
      fs.copyFileSync(mapping.source, destPath);
      console.log(`Copied ${mapping.destName}`);

      const dbRecord = dashboards.find(d => d.title.includes(mapping.titleContains));
      if (dbRecord) {
        await prisma.externalDashboard.update({
          where: { id: dbRecord.id },
          data: { imageUrl: `/dashboards/${mapping.destName}` }
        });
        console.log(`Updated DB for ${dbRecord.title}`);
      }
    } else {
      console.log(`Source not found: ${mapping.source}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
