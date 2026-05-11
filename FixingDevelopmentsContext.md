# FLN Hub — Development Context
**Saved:** 2026-04-09  
**Repo:** https://github.com/Vikas-pixel-bot/fln-tracker  
**Live:** https://fln-tracker-seven.vercel.app  
**Stack:** Next.js 16.2.2 (App Router), Prisma ORM, PostgreSQL (Supabase), NextAuth v5, Tailwind CSS, Recharts

---

## What's Fully Built & Deployed

| Feature | Status | Key Files |
|---|---|---|
| Auth (Google + Credentials, admin/school roles) | ✅ | `auth.ts`, `proxy.ts`, `app/signin/page.tsx` |
| 497 Maharashtra schools, full hierarchy | ✅ | `prisma/hierarchy-data.ts` |
| Dashboard — Level Trends (% per term, class filter) | ✅ | `app/DashboardClient.tsx` |
| Dashboard — Term Overview (% / # toggle) | ✅ | `app/DashboardClient.tsx` |
| Progress Trajectory tab — REMOVED | ✅ | — |
| Student profiles + assessments | ✅ | `app/students/` |
| Admin: bulk upload, data table, settings | ✅ | `app/admin/` |
| School login generator (Devanagari transliteration) | ✅ | `app/actions.ts` → `generateSchoolLogins` |
| School login page: inline edit, multi-select delete | ✅ | `app/admin/logins/LoginsClient.tsx` |
| PWA + offline sync | ✅ | `public/sw.js`, `lib/offline-queue.ts` |
| 18 single-player literacy/numeracy games | ✅ | `components/games/` |
| 9 single-player simulations | ✅ | `components/simulations/` |
| 6 x 2v2 battle games (CompetitiveArena pattern) | ✅ | `components/simulations/LetterFlash`, `WordRace`, `SentenceFill`, `MathDuel`, `NumberRace`, `PlaceValueBattle` |
| BattleMatchmaker (school/class/level UI) | ✅ | `components/simulations/BattleMatchmaker.tsx` |
| BattleRecord schema + matchmaker actions | ✅ | `prisma/schema.prisma`, `app/actions.ts` |
| BattleMatchmaker session wiring (FIXED) | ✅ | `app/resources/simulations/page.tsx` |
| `battleSubject` field on all battle items (FIXED) | ✅ | `app/resources/simulations/page.tsx` |
| pedagogy.md — full TaRL/ASER reference | ✅ | `pedagogy.md` |

---

## Known Issues / Next Steps

### High Priority
1. **`onGameEnd` in CompetitiveArena never triggers DB recording**
   - File: `components/simulations/CompetitiveArena.tsx`
   - The `onGameEnd` callback is accepted as a prop but never called in the finished state
   - Fix: Call `onGameEnd(winner, scores)` when game ends inside CompetitiveArena
   - This is what actually writes results to `BattleRecord` table

2. **Orphaned `components/battle/` folder (5 files)**
   - Files: `AksharOlakh.tsx`, `ShabdaVachan.tsx`, `VakyaPurna.tsx`, `MathDuel.tsx`, `NumberRace.tsx`
   - These are old 5-round pattern components, NOT wired to simulations page, NOT using CompetitiveArena, NOT recording to DB
   - Fix: Delete the entire `components/battle/` folder

### Medium Priority (Pedagogy Improvements)
3. **Traffic light color scheme on game cards**
   - CLAUDE.md mandates: Red=Beginner, Orange=Progress, Green=Mastered
   - Currently not applied anywhere in simulations page
   - Fix: Color-code sidebar items and active game header by ASER level

4. **Level labels are not pedagogically clear**
   - Currently: "Level: Word" or "Lvl: 10-99"
   - Should say: "Level 2 — Word Reading" with a one-line description for teachers
   - Reference: `pedagogy.md` Section 2 for all level definitions

5. **No teacher instructions inside games**
   - Teachers need a brief "How to run this" tip per game
   - Fix: Add a collapsible teacher tip panel in the main game area

6. **No 90-minute daily flow guide visible to teachers**
   - CLAUDE.md USP 3: Individual → Group Game → 2v2 Battle
   - Teachers don't see this structure anywhere in the UI
   - Possible fix: Add a "Today's Session" guide on the resources page or home

### Low Priority
7. **`isAdmin` hardcoded on `simulations/page.tsx` — FIXED**
   - Already resolved in last session

8. **Implementation Sessions model in schema but no UI**
   - `ImplementationSession` model exists in Prisma
   - `app/actions/implementation.ts` has actions
   - No UI to trigger them from simulations page

---

## Critical Architecture Notes

### Session Object
```typescript
session.user.role       // "admin" | "user"
session.user.schoolId   // string | null (school-scoped teachers have this)
session.user.id         // string
```
Always use `(session?.user as any)?.schoolId` since NextAuth's default User type doesn't include schoolId.

### Battle Flow
1. Teacher selects a Battle game in sidebar → BattleMatchmaker modal opens
2. Matchmaker fetches `getMatchCandidates(schoolId, classNum, subject, level)` — students whose **latest assessment** is at that level
3. Auto-picks 2 students, teacher can override manually
4. `onMatchComplete(p1, p2, schoolId, classNum)` → sets `battleContext` state
5. Game component receives `{ player1: p1, player2: p2, schoolId, classNum }` as props
6. CompetitiveArena wraps the game, handles timer + scoring
7. **GAP: `onGameEnd` → `recordBattleResult()` not yet wired**

### Matchmaker Logic
- `getMatchCandidates` in `app/actions.ts` queries students by latest assessment level
- Admin sees school dropdown (all 497 schools)
- School teacher sees their own school only (no dropdown)
- Class selector: 1–8

### Login Generation
- Format: `poname.schoolname@flnhub.in` / `Pratham@2025`
- `toSlug()` includes Devanagari → Roman transliteration (`transliterateDevanagari()`)
- Uses `createMany({ skipDuplicates: true })` for bulk speed (3 queries for 497 schools)
- Existing logins can be edited inline on `/admin/logins`
- Multi-select delete available

### Dashboard
- **Level Trends tab**: % normalised per term (Baseline/Midline/Endline), class filter, literacy/numeracy toggle
- **Term Overview tab**: % / # toggle (all 3 charts respond — Literacy, Numeracy, Operations)
- Progress Trajectory tab removed

### Prisma Schema Models
`Division → ProjectOffice → School → Student → Assessment`  
`BattleRecord` (player1Id, player2Id, winnerId, gameSlug, subject, level, classNum, schoolId)  
`User` (role, schoolId, passwordHash)  
`SystemSetting`, `ImplementationSession`

### Deployment
- Vercel (auto-deploy on push to main, repo must be **public** for Hobby plan)
- Supabase PostgreSQL (aws-1-ap-south-1 pooler)
- EPERM on `prisma generate` locally (Windows DLL lock) — harmless, Vercel builds clean
- No Co-Authored-By in commits (breaks Vercel Hobby plan collaboration check)

---

## Files Changed This Session
- `app/DashboardClient.tsx` — removed cohort tab, % toggle for Term Overview
- `app/actions.ts` — Devanagari transliteration, createMany login gen, deleteSchoolLogins, getMatchCandidates, recordBattleResult, updateLoginEmail
- `app/admin/logins/LoginsClient.tsx` — inline edit, multi-select delete
- `app/api/admin/credentials/route.ts` — added id field
- `prisma/schema.prisma` — added BattleRecord, updated Student/School relations
- `app/resources/simulations/page.tsx` — battleSubject field, useSession wiring
- `pedagogy.md` — created (TaRL methodology reference)
- `FixingDevelopmentsContext.md` — this file
