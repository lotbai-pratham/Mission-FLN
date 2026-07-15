import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { HIERARCHY_DATA } from './prisma/hierarchy-data'; 
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow Next.js frontend
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// -- ADMIN DATA --

app.get('/api/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      include: { projectOffice: { include: { division: true } } }
    });
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/data', async (req, res) => {
  try {
    await prisma.assessment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.school.deleteMany();
    await prisma.projectOffice.deleteMany();
    await prisma.division.deleteMany();
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

app.post('/api/upload-data', async (req, res) => {
  try {
    let divCount = 0, poCount = 0, schoolCount = 0;
    const existingDivisions = await prisma.division.findMany();
    const existingPOs = await prisma.projectOffice.findMany();
    const existingSchools = await prisma.school.findMany({ select: { udiseCode: true } });

    const divMap = new Map(existingDivisions.map(d => [d.name, d.id]));
    const poMap = new Map(existingPOs.map(p => [`${p.name}__${p.divisionId}`, p.id]));
    const schoolSet = new Set(existingSchools.map(s => s.udiseCode));

    for (const [divName, pos] of Object.entries(HIERARCHY_DATA)) {
      if (!divMap.has(divName)) {
        const div = await prisma.division.create({ data: { name: divName } });
        divMap.set(divName, div.id);
        divCount++;
      }
      const divId = divMap.get(divName)!;

      for (const [poName, schools] of Object.entries(pos as any)) {
        const poKey = `${poName}__${divId}`;
        if (!poMap.has(poKey)) {
          const po = await prisma.projectOffice.create({ data: { name: poName, divisionId: divId } });
          poMap.set(poKey, po.id);
          poCount++;
        }
        const poId = poMap.get(poKey)!;

        const newSchools = (schools as any[]).filter(s => !schoolSet.has(s.udise));
        if (newSchools.length > 0) {
          await prisma.school.createMany({
            data: newSchools.map(s => ({ name: s.name, udiseCode: s.udise, projectOfficeId: poId })),
            skipDuplicates: true,
          });
          newSchools.forEach(s => schoolSet.add(s.udise));
          schoolCount += newSchools.length;
        }
      }
    }
    res.json({ success: true, message: 'Data uploaded successfully', divCount, poCount, schoolCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
});

app.post('/api/schools/cleanup', async (req, res) => {
  try {
    const validUdiseCodes = new Set<string>();
    Object.values(HIERARCHY_DATA).forEach((pos: any) => {
      Object.values(pos).forEach((schools: any) => {
        schools.forEach((s: any) => validUdiseCodes.add(s.udise));
      });
    });

    const allSchools = await prisma.school.findMany({ select: { id: true, udiseCode: true } });
    const invalidSchoolIds = allSchools
      .filter(s => !validUdiseCodes.has(s.udiseCode))
      .map(s => s.id);

    if (invalidSchoolIds.length === 0) return res.json({ count: 0 });

    await prisma.assessment.deleteMany({ where: { student: { schoolId: { in: invalidSchoolIds } } } });
    await prisma.student.deleteMany({ where: { schoolId: { in: invalidSchoolIds } } });
    const result = await prisma.school.deleteMany({ where: { id: { in: invalidSchoolIds } } });

    res.json({ count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cleanup schools' });
  }
});

// -- USERS AND ROLES --

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { sessions: true } },
        school: { select: { id: true, name: true } },
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/role', async (req, res) => {
  try {
    const { userId, role } = req.body;
    await prisma.user.update({ where: { id: userId }, data: { role } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

app.put('/api/users/school', async (req, res) => {
  try {
    const { userId, schoolId } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { schoolId: schoolId || null },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign school' });
  }
});

// -- CREDENTIALS --

function transliterateDevanagari(str: string): string {
  let s = str
    .replace(/क्ष/g, 'ksh').replace(/ज्ञ/g, 'dny')
    .replace(/त्र/g, 'tr').replace(/श्र/g, 'shr');

  const consonants: Record<string, string> = {
    'क':'k', 'ख':'kh','ग':'g', 'घ':'gh','ङ':'ng',
    'च':'ch','छ':'chh','ज':'j', 'झ':'jh','ञ':'n',
    'ट':'t', 'ठ':'th','ड':'d', 'ढ':'dh','ण':'n',
    'त':'t', 'थ':'th','द':'d', 'ध':'dh','न':'n',
    'प':'p', 'फ':'ph','ब':'b', 'भ':'bh','म':'m',
    'य':'y', 'र':'r', 'ल':'l', 'व':'v', 'श':'sh',
    'ष':'sh','स':'s', 'ह':'h', 'ळ':'l',
  };
  const vowels: Record<string, string> = {
    'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo',
    'ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऋ':'ru','ऍ':'e',
  };
  const matras: Record<string, string | null> = {
    'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo',
    'े':'e','ै':'ai','ो':'o','ौ':'au','ृ':'ru',
    'ं':'n','ँ':'n','ः':'h','्':null,
  };
  const digits: Record<string, string> = {
    '०':'0','१':'1','२':'2','३':'3','४':'4',
    '५':'5','६':'6','७':'7','८':'8','९':'9',
  };

  const chars = [...s];
  let result = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === undefined) continue;
    const next = chars[i + 1];
    if (ch in consonants) {
      result += consonants[ch];
      const nextIsMatra = next !== undefined && next in matras;
      if (!nextIsMatra) result += 'a'; 
    } else if (ch in matras) {
      const v = matras[ch];
      if (v !== null) result += v;
    } else if (ch in vowels) {
      result += vowels[ch];
    } else if (ch in digits) {
      result += digits[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

function toSlug(str: string): string {
  return transliterateDevanagari(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '.');
}

app.post('/api/users/generate-logins', async (req, res) => {
  try {
    const DEFAULT_PASSWORD = "Pratham@2025";
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const schools = await prisma.school.findMany({ include: { projectOffice: true } });

    const data = schools.map(school => ({
      email: `${toSlug(school.projectOffice.name)}.${toSlug(school.name)}@flnhub.in`,
      name: school.name,
      role: "user",
      schoolId: school.id,
      passwordHash,
    }));

    const result = await prisma.user.createMany({ data, skipDuplicates: true });
    res.json({ created: result.count, skipped: schools.length - result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate logins' });
  }
});

app.delete('/api/users/logins', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await prisma.user.deleteMany({
      where: { id: { in: ids }, email: { endsWith: '@flnhub.in' } },
    });
    res.json({ deleted: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete logins' });
  }
});

app.get('/api/users/credentials', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { passwordHash: { not: null } },
      include: { 
        school: { include: { projectOffice: true } },
        projectOffice: true,
        division: true
      },
      orderBy: { email: 'asc' },
    });

    const data = users.map((u: any) => {
      let locationLevel = "State";
      if (u.school) locationLevel = `School: ${u.school.name}`;
      else if (u.projectOffice) locationLevel = `PO: ${u.projectOffice.name}`;
      else if (u.division) locationLevel = `Div: ${u.division.name}`;

      return {
        id: u.id,
        po: u.school?.projectOffice?.name ?? u.projectOffice?.name ?? u.division?.name ?? 'State',
        school: u.school?.name ?? 'N/A',
        email: u.email,
        password: 'Pratham@2025',
        role: u.role,
        locationLevel
      };
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

app.post('/api/users/custom-login', async (req, res) => {
  try {
    const { email, password, role, level, targetId } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return res.status(400).json({ error: "Email cannot be empty" });
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const userData: any = {
      email: trimmedEmail,
      name: "Custom Login",
      role: role,
      passwordHash,
    };

    if (level === "school" && targetId) userData.schoolId = targetId;
    else if (level === "project_office" && targetId) userData.projectOfficeId = targetId;
    else if (level === "division" && targetId) userData.divisionId = targetId;

    await prisma.user.create({ data: userData });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create custom login' });
  }
});

app.put('/api/users/email', async (req, res) => {
  try {
    const { userId, newEmail } = req.body;
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return res.status(400).json({ error: 'Email cannot be empty' });
    const existing = await prisma.user.findUnique({ where: { email: trimmed } });
    if (existing && existing.id !== userId) return res.status(400).json({ error: 'Email already in use' });
    
    await prisma.user.update({ where: { id: userId }, data: { email: trimmed } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

app.listen(port, () => {
  console.log(`Backend API Server running on http://localhost:${port}`);
});
