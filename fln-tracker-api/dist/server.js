"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const hierarchy_data_1 = require("./prisma/hierarchy-data");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Allow Next.js frontend
    credentials: true
}));
app.use(express_1.default.json());
// --- ROUTES ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// -- ADMIN DATA --
app.get('/api/schools', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schools = yield prisma.school.findMany({
            orderBy: { name: 'asc' },
            include: { projectOffice: { include: { division: true } } }
        });
        res.json(schools);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.delete('/api/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.assessment.deleteMany();
        yield prisma.student.deleteMany();
        yield prisma.school.deleteMany();
        yield prisma.projectOffice.deleteMany();
        yield prisma.division.deleteMany();
        res.json({ success: true, message: 'All data cleared' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
}));
app.post('/api/upload-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let divCount = 0, poCount = 0, schoolCount = 0;
        const existingDivisions = yield prisma.division.findMany();
        const existingPOs = yield prisma.projectOffice.findMany();
        const existingSchools = yield prisma.school.findMany({ select: { udiseCode: true } });
        const divMap = new Map(existingDivisions.map(d => [d.name, d.id]));
        const poMap = new Map(existingPOs.map(p => [`${p.name}__${p.divisionId}`, p.id]));
        const schoolSet = new Set(existingSchools.map(s => s.udiseCode));
        for (const [divName, pos] of Object.entries(hierarchy_data_1.HIERARCHY_DATA)) {
            if (!divMap.has(divName)) {
                const div = yield prisma.division.create({ data: { name: divName } });
                divMap.set(divName, div.id);
                divCount++;
            }
            const divId = divMap.get(divName);
            for (const [poName, schools] of Object.entries(pos)) {
                const poKey = `${poName}__${divId}`;
                if (!poMap.has(poKey)) {
                    const po = yield prisma.projectOffice.create({ data: { name: poName, divisionId: divId } });
                    poMap.set(poKey, po.id);
                    poCount++;
                }
                const poId = poMap.get(poKey);
                const newSchools = schools.filter(s => !schoolSet.has(s.udise));
                if (newSchools.length > 0) {
                    yield prisma.school.createMany({
                        data: newSchools.map(s => ({ name: s.name, udiseCode: s.udise, projectOfficeId: poId })),
                        skipDuplicates: true,
                    });
                    newSchools.forEach(s => schoolSet.add(s.udise));
                    schoolCount += newSchools.length;
                }
            }
        }
        res.json({ success: true, message: 'Data uploaded successfully', divCount, poCount, schoolCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload data' });
    }
}));
app.post('/api/schools/cleanup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validUdiseCodes = new Set();
        Object.values(hierarchy_data_1.HIERARCHY_DATA).forEach((pos) => {
            Object.values(pos).forEach((schools) => {
                schools.forEach((s) => validUdiseCodes.add(s.udise));
            });
        });
        const allSchools = yield prisma.school.findMany({ select: { id: true, udiseCode: true } });
        const invalidSchoolIds = allSchools
            .filter(s => !validUdiseCodes.has(s.udiseCode))
            .map(s => s.id);
        if (invalidSchoolIds.length === 0)
            return res.json({ count: 0 });
        yield prisma.assessment.deleteMany({ where: { student: { schoolId: { in: invalidSchoolIds } } } });
        yield prisma.student.deleteMany({ where: { schoolId: { in: invalidSchoolIds } } });
        const result = yield prisma.school.deleteMany({ where: { id: { in: invalidSchoolIds } } });
        res.json({ count: result.count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cleanup schools' });
    }
}));
// -- USERS AND ROLES --
app.get('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { sessions: true } },
                school: { select: { id: true, name: true } },
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
app.put('/api/users/role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        yield prisma.user.update({ where: { id: userId }, data: { role } });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
}));
app.put('/api/users/school', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, schoolId } = req.body;
        yield prisma.user.update({
            where: { id: userId },
            data: { schoolId: schoolId || null },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign school' });
    }
}));
// -- CREDENTIALS --
function transliterateDevanagari(str) {
    let s = str
        .replace(/क्ष/g, 'ksh').replace(/ज्ञ/g, 'dny')
        .replace(/त्र/g, 'tr').replace(/श्र/g, 'shr');
    const consonants = {
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
        'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
        'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
        'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l',
    };
    const vowels = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
        'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ru', 'ऍ': 'e',
    };
    const matras = {
        'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
        'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ru',
        'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': null,
    };
    const digits = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    };
    const chars = [...s];
    let result = '';
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === undefined)
            continue;
        const next = chars[i + 1];
        if (ch in consonants) {
            result += consonants[ch];
            const nextIsMatra = next !== undefined && next in matras;
            if (!nextIsMatra)
                result += 'a';
        }
        else if (ch in matras) {
            const v = matras[ch];
            if (v !== null)
                result += v;
        }
        else if (ch in vowels) {
            result += vowels[ch];
        }
        else if (ch in digits) {
            result += digits[ch];
        }
        else {
            result += ch;
        }
    }
    return result;
}
function toSlug(str) {
    return transliterateDevanagari(str)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, '')
        .trim()
        .replace(/\s+/g, '.');
}
app.post('/api/users/generate-logins', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const DEFAULT_PASSWORD = "Pratham@2025";
        const passwordHash = yield bcryptjs_1.default.hash(DEFAULT_PASSWORD, 10);
        const schools = yield prisma.school.findMany({ include: { projectOffice: true } });
        const data = schools.map(school => ({
            email: `${toSlug(school.projectOffice.name)}.${toSlug(school.name)}@flnhub.in`,
            name: school.name,
            role: "user",
            schoolId: school.id,
            passwordHash,
        }));
        const result = yield prisma.user.createMany({ data, skipDuplicates: true });
        res.json({ created: result.count, skipped: schools.length - result.count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate logins' });
    }
}));
app.delete('/api/users/logins', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        const result = yield prisma.user.deleteMany({
            where: { id: { in: ids }, email: { endsWith: '@flnhub.in' } },
        });
        res.json({ deleted: result.count });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete logins' });
    }
}));
app.get('/api/users/credentials', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            where: { passwordHash: { not: null } },
            include: {
                school: { include: { projectOffice: true } },
                projectOffice: true,
                division: true
            },
            orderBy: { email: 'asc' },
        });
        const data = users.map((u) => {
            var _a, _b, _c, _d, _e;
            var _f, _g, _h, _j;
            let locationLevel = "State";
            if (u.school)
                locationLevel = `School: ${u.school.name}`;
            else if (u.projectOffice)
                locationLevel = `PO: ${u.projectOffice.name}`;
            else if (u.division)
                locationLevel = `Div: ${u.division.name}`;
            return {
                id: u.id,
                po: (_h = (_g = (_f = (_b = (_a = u.school) === null || _a === void 0 ? void 0 : _a.projectOffice) === null || _b === void 0 ? void 0 : _b.name) !== null && _f !== void 0 ? _f : (_c = u.projectOffice) === null || _c === void 0 ? void 0 : _c.name) !== null && _g !== void 0 ? _g : (_d = u.division) === null || _d === void 0 ? void 0 : _d.name) !== null && _h !== void 0 ? _h : 'State',
                school: (_j = (_e = u.school) === null || _e === void 0 ? void 0 : _e.name) !== null && _j !== void 0 ? _j : 'N/A',
                email: u.email,
                password: 'Pratham@2025',
                role: u.role,
                locationLevel
            };
        });
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
}));
app.post('/api/users/custom-login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, level, targetId } = req.body;
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail)
            return res.status(400).json({ error: "Email cannot be empty" });
        const existing = yield prisma.user.findUnique({ where: { email: trimmedEmail } });
        if (existing)
            return res.status(400).json({ error: "Email already in use" });
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const userData = {
            email: trimmedEmail,
            name: "Custom Login",
            role: role,
            passwordHash,
        };
        if (level === "school" && targetId)
            userData.schoolId = targetId;
        else if (level === "project_office" && targetId)
            userData.projectOfficeId = targetId;
        else if (level === "division" && targetId)
            userData.divisionId = targetId;
        yield prisma.user.create({ data: userData });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create custom login' });
    }
}));
app.put('/api/users/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, newEmail } = req.body;
        const trimmed = newEmail.trim().toLowerCase();
        if (!trimmed)
            return res.status(400).json({ error: 'Email cannot be empty' });
        const existing = yield prisma.user.findUnique({ where: { email: trimmed } });
        if (existing && existing.id !== userId)
            return res.status(400).json({ error: 'Email already in use' });
        yield prisma.user.update({ where: { id: userId }, data: { email: trimmed } });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update email' });
    }
}));
app.listen(port, () => {
    console.log(`Backend API Server running on http://localhost:${port}`);
});
