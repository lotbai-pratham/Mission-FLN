"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePoints } from "@/lib/points-store";
import GameHeader from "@/components/games/GameHeader";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sounds";
import { Sparkles, Trophy, RotateCcw, X, LogOut, Star } from "lucide-react";

// ─── Matra Categories ─────────────────────────────────────────────────────────
const CATS = [
  {
    label: "अ", name: "शुद्ध",
    bg: "bg-orange-400", border: "border-orange-600", text: "text-white",
    pool: ["क","ख","ग","घ","च","छ","ज","झ","ट","ठ","ड","त","थ","द","न","प","फ","ब","म","र","ल","व","स","ह"],
  },
  {
    label: "आ", name: "आ-मात्रा",
    bg: "bg-red-400", border: "border-red-600", text: "text-white",
    pool: ["का","खा","गा","घा","चा","जा","झा","ता","था","दा","ना","पा","फा","बा","मा","रा","ला","वा","सा","हा"],
  },
  {
    label: "इ", name: "इ-मात्रा",
    bg: "bg-sky-500", border: "border-sky-700", text: "text-white",
    pool: ["कि","खि","गि","चि","जि","ति","थि","दि","नि","पि","बि","मि","रि","लि","वि","सि","हि"],
  },
  {
    label: "ई", name: "ई-मात्रा",
    bg: "bg-violet-500", border: "border-violet-700", text: "text-white",
    pool: ["की","खी","गी","ची","जी","ती","थी","दी","नी","पी","बी","मी","री","ली","वी","सी","ही"],
  },
  {
    label: "उ", name: "उ-मात्रा",
    bg: "bg-emerald-500", border: "border-emerald-700", text: "text-white",
    pool: ["कु","खु","गु","चु","जु","तु","थु","दु","नु","पु","बु","मु","रु","लु","वु","सु","हु"],
  },
  {
    label: "ए", name: "ए-मात्रा",
    bg: "bg-yellow-400", border: "border-yellow-600", text: "text-gray-900",
    pool: ["के","खे","गे","चे","जे","ते","थे","दे","ने","पे","बे","मे","रे","ले","वे","से","हे"],
  },
  {
    label: "ओ", name: "ओ-मात्रा",
    bg: "bg-pink-500", border: "border-pink-700", text: "text-white",
    pool: ["को","खो","गो","चो","जो","तो","थो","दो","नो","पो","बो","मो","रो","लो","वो","सो","हो"],
  },
] as const;

const ROWS = 7, COLS = 6, MOVES_START = 25;
type CatIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Cell {
  id: number;
  syl: string;
  cat: CatIdx;
  r: number;
  c: number;
  targetR: number;
  power: 'striped-row' | 'striped-col' | 'color-bomb' | null;
  matched?: boolean;
}

let uid = 1;
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function rndCat(avoid = -1): CatIdx {
  let c = Math.floor(Math.random() * CATS.length) as CatIdx;
  while (c === avoid) c = Math.floor(Math.random() * CATS.length) as CatIdx;
  return c;
}

function rndCell(avoid = -1): Omit<Cell, 'r' | 'c' | 'targetR'> {
  const cat = rndCat(avoid);
  const pool = CATS[cat].pool as readonly string[];
  return {
    id: uid++,
    syl: pool[Math.floor(Math.random() * pool.length)],
    cat,
    power: null
  };
}

function safeCell(g: (Omit<Cell, 'r' | 'c' | 'targetR'> | null)[][], r: number, c: number): Omit<Cell, 'r' | 'c' | 'targetR'> {
  let cell = rndCell();
  for (let i = 0; i < 30; i++) {
    const hMatch = c >= 2 && g[r][c - 1]?.cat === cell.cat && g[r][c - 2]?.cat === cell.cat;
    const vMatch = r >= 2 && g[r - 1]?.[c]?.cat === cell.cat && g[r - 2]?.[c]?.cat === cell.cat;
    if (!hMatch && !vMatch) return cell;
    cell = rndCell();
  }
  return cell;
}

function mkGrid2D(): Omit<Cell, 'r' | 'c' | 'targetR'>[][] {
  const g: (Omit<Cell, 'r' | 'c' | 'targetR'> | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      g[r][c] = safeCell(g, r, c);
  return g as Omit<Cell, 'r' | 'c' | 'targetR'>[][];
}

function mkInitialFlatGrid(): Cell[] {
  const g2d = mkGrid2D();
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        ...g2d[r][c],
        r,
        c,
        targetR: r
      } as Cell);
    }
  }
  return cells;
}

// ─── Match & Explosion Resolvers ─────────────────────────────────────────────

function resolveExplosions(grid: Cell[][], initiallyMatched: Set<number>): Set<number> {
  const allMatchedIds = new Set<number>(initiallyMatched);
  let newlyMatched = Array.from(initiallyMatched);
  
  while (newlyMatched.length > 0) {
    const nextBatch: number[] = [];
    for (const id of newlyMatched) {
      let found: Cell | null = null;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]?.id === id) {
            found = grid[r][c];
            break;
          }
        }
        if (found) break;
      }
      
      if (found && found.power) {
        if (found.power === 'striped-row') {
          const row = found.r;
          for (let col = 0; col < COLS; col++) {
            const cell = grid[row][col];
            if (cell && !allMatchedIds.has(cell.id)) {
              allMatchedIds.add(cell.id);
              nextBatch.push(cell.id);
            }
          }
        } else if (found.power === 'striped-col') {
          const col = found.c;
          for (let row = 0; row < ROWS; row++) {
            const cell = grid[row][col];
            if (cell && !allMatchedIds.has(cell.id)) {
              allMatchedIds.add(cell.id);
              nextBatch.push(cell.id);
            }
          }
        } else if (found.power === 'color-bomb') {
          const row = found.r;
          const col = found.c;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const cell = grid[nr][nc];
                if (cell && !allMatchedIds.has(cell.id)) {
                  allMatchedIds.add(cell.id);
                  nextBatch.push(cell.id);
                }
              }
            }
          }
        }
      }
    }
    newlyMatched = nextBatch;
  }
  
  return allMatchedIds;
}

function findMatches2D(grid: Cell[][]): Set<number> {
  const matchedIds = new Set<number>();
  
  // Horizontal matches scan
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS - 2) {
      const cell = grid[r][c];
      if (cell && grid[r][c + 1] && grid[r][c + 2] &&
          cell.cat === grid[r][c + 1].cat &&
          cell.cat === grid[r][c + 2].cat) {
        let e = c + 2;
        while (e + 1 < COLS && grid[r][e + 1] && grid[r][e + 1].cat === cell.cat) {
          e++;
        }
        for (let i = c; i <= e; i++) {
          matchedIds.add(grid[r][i].id);
        }
        c = e + 1;
      } else {
        c++;
      }
    }
  }

  // Vertical matches scan
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS - 2) {
      const cell = grid[r][c];
      if (cell && grid[r + 1][c] && grid[r + 2][c] &&
          cell.cat === grid[r + 1][c].cat &&
          cell.cat === grid[r + 2][c].cat) {
        let e = r + 2;
        while (e + 1 < ROWS && grid[e + 1][c] && grid[e + 1][c].cat === cell.cat) {
          e++;
        }
        for (let i = r; i <= e; i++) {
          matchedIds.add(grid[i][c].id);
        }
        r = e + 1;
      } else {
        r++;
      }
    }
  }

  if (matchedIds.size > 0) {
    return resolveExplosions(grid, matchedIds);
  }

  return matchedIds;
}

interface PowerUpSpawn {
  r: number;
  c: number;
  cat: CatIdx;
  power: 'striped-row' | 'striped-col' | 'color-bomb';
  syl: string;
}

function checkPowerUpSpawns(grid: Cell[][], clearedIds: Set<number>): PowerUpSpawn[] {
  const spawns: PowerUpSpawn[] = [];
  
  // Horizontal match check
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS - 2) {
      const cell = grid[r][c];
      if (cell && clearedIds.has(cell.id)) {
        let e = c + 1;
        while (e < COLS && grid[r][e] && grid[r][e].cat === cell.cat && clearedIds.has(grid[r][e].id)) {
          e++;
        }
        const len = e - c;
        if (len >= 3) {
          const midC = Math.floor((c + e - 1) / 2);
          const midCell = grid[r][midC];
          if (len === 4) {
            spawns.push({
              r,
              c: midC,
              cat: cell.cat,
              power: 'striped-row',
              syl: midCell ? midCell.syl : cell.syl
            });
          } else if (len >= 5) {
            spawns.push({
              r,
              c: midC,
              cat: cell.cat,
              power: 'color-bomb',
              syl: '💣'
            });
          }
          c = e;
        } else c++;
      } else c++;
    }
  }

  // Vertical match check
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS - 2) {
      const cell = grid[r][c];
      if (cell && clearedIds.has(cell.id)) {
        let e = r + 1;
        while (e < ROWS && grid[e][c] && grid[e][c].cat === cell.cat && clearedIds.has(grid[e][c].id)) {
          e++;
        }
        const len = e - r;
        if (len >= 3) {
          const midR = Math.floor((r + e - 1) / 2);
          const midCell = grid[midR][c];
          if (len === 4) {
            spawns.push({
              r: midR,
              c,
              cat: cell.cat,
              power: 'striped-col',
              syl: midCell ? midCell.syl : cell.syl
            });
          } else if (len >= 5) {
            spawns.push({
              r: midR,
              c,
              cat: cell.cat,
              power: 'color-bomb',
              syl: '💣'
            });
          }
          r = e;
        } else r++;
      } else r++;
    }
  }

  return spawns;
}

function dropAndFillCells(currentCells: Cell[], clearedIds: Set<number>, powerUps: PowerUpSpawn[]): Cell[] {
  const remaining = currentCells.filter(c => !clearedIds.has(c.id));
  const nextCells: Cell[] = [];
  
  for (let c = 0; c < COLS; c++) {
    const colCells = remaining.filter(cell => cell.c === c).sort((a, b) => b.r - a.r);
    
    let targetR = ROWS - 1;
    colCells.forEach(cell => {
      nextCells.push({
        ...cell,
        r: cell.r,
        targetR: targetR--
      });
    });
    
    let count = 0;
    for (let r = targetR; r >= 0; r--) {
      const powerSpawn = powerUps.find(p => p.r === r && p.c === c);
      if (powerSpawn) {
        nextCells.push({
          id: uid++,
          syl: powerSpawn.syl,
          cat: powerSpawn.cat,
          r: -1,
          c,
          targetR: r,
          power: powerSpawn.power
        });
      } else {
        const cell = rndCell();
        count++;
        nextCells.push({
          id: cell.id,
          syl: cell.syl,
          cat: cell.cat,
          r: -count,
          c,
          targetR: r,
          power: null
        });
      }
    }
  }

  return nextCells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AksharCrush({ onExit }: { onExit?: () => void }) {
  const { addXP } = usePoints();
  const [cells, setCells] = useState<Cell[]>(() => mkInitialFlatGrid());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [moves, setMoves] = useState(MOVES_START);
  const [gameOver, setGameOver] = useState(false);
  const [pops, setPops] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  
  const startRef = useRef<{ r: number; c: number; x: number; y: number } | null>(null);

  // Helper to retrieve 2D coordinate map
  const getGrid = (cellsList: Cell[]): Cell[][] => {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null)) as (Cell | null)[][];
    cellsList.forEach(c => {
      if (!c.matched && c.r >= 0 && c.r < ROWS && c.c >= 0 && c.c < COLS) {
        g[c.r][c.c] = c;
      }
    });
    return g as Cell[][];
  };

  const processChain = async (startCells: Cell[], initialClearedIds: Set<number>) => {
    let currentCells = startCells;
    let chainClearedIds = initialClearedIds;
    let chain = 0;

    while (true) {
      if (chainClearedIds.size === 0) {
        const grid2D = getGrid(currentCells);
        chainClearedIds = findMatches2D(grid2D);
      }

      if (chainClearedIds.size === 0) break;

      chain++;
      setCombo(chain);

      const grid2D = getGrid(currentCells);
      const powerUpSpawns = checkPowerUpSpawns(grid2D, chainClearedIds);

      // Award points & XP
      const points = chainClearedIds.size * 10 * chain;
      setScore(s => s + points);
      addXP(Math.ceil(points / 12));

      // Spawn floating point popups
      let avgR = 0, avgC = 0, count = 0;
      currentCells.forEach(c => {
        if (chainClearedIds.has(c.id)) {
          avgR += c.r;
          avgC += c.c;
          count++;
        }
      });
      if (count > 0) {
        avgR = Math.round(avgR / count);
        avgC = Math.round(avgC / count);
        const newPop = {
          id: uid++,
          text: `+${points} ${chain > 1 ? `COMBO x${chain}!` : ''}`,
          x: avgC * 52 + 10,
          y: avgR * 52 + 10
        };
        setPops(prev => [...prev, newPop]);
        setTimeout(() => {
          setPops(prev => prev.filter(p => p.id !== newPop.id));
        }, 800);
      }

      // 1. Matched cells shrink & disappear scale-0
      setCells(prev => {
        return prev.map(c => {
          if (chainClearedIds.has(c.id)) {
            return { ...c, matched: true };
          }
          return c;
        });
      });

      sfx.playPop();
      await sleep(320);

      // 2. Cascade drops & spawn new items above
      const droppedList = dropAndFillCells(currentCells, chainClearedIds, powerUpSpawns);
      setCells(droppedList);
      
      await sleep(40);

      // 3. Glide new cells into correct row coordinates
      currentCells = droppedList.map(c => ({
        ...c,
        r: c.targetR
      }));
      setCells(currentCells);
      
      await sleep(320);

      // Reset cleared IDs for standard matching
      chainClearedIds = new Set<number>();
    }

    setCombo(0);
  };

  const doSwap = useCallback(async (r1: number, c1: number, r2: number, c2: number) => {
    if (busy || gameOver) return;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    
    setBusy(true);
    setSelected(null);

    let cell1: Cell | null = null;
    let cell2: Cell | null = null;

    // Trigger visual glide swap
    setCells(prev => {
      return prev.map(c => {
        if (c.r === r1 && c.c === c1) {
          cell1 = { ...c, r: r2, c: c2, targetR: r2 };
          return cell1;
        }
        if (c.r === r2 && c.c === c2) {
          cell2 = { ...c, r: r1, c: c1, targetR: r1 };
          return cell2;
        }
        return c;
      });
    });

    await sleep(340);

    // Compute updated grids
    const tempCells = cells.map(c => {
      if (c.r === r1 && c.c === c1) return { ...c, r: r2, c: c2, targetR: r2 };
      if (c.r === r2 && c.c === c2) return { ...c, r: r1, c: c1, targetR: r1 };
      return c;
    });

    const grid2D = getGrid(tempCells);

    // Check for Color Bomb Swap or matches
    let isMatch = false;
    let bombTriggered = false;
    let clearedIds = new Set<number>();

    const c1Obj = tempCells.find(c => c.r === r2 && c.c === c2);
    const c2Obj = tempCells.find(c => c.r === r1 && c.c === c1);

    if (c1Obj && c2Obj) {
      if (c1Obj.power === 'color-bomb' || c2Obj.power === 'color-bomb') {
        bombTriggered = true;
        isMatch = true;
        
        if (c1Obj.power === 'color-bomb' && c2Obj.power === 'color-bomb') {
          // Double Bomb swaps clear the whole grid!
          tempCells.forEach(c => clearedIds.add(c.id));
        } else {
          const normalCell = c1Obj.power === 'color-bomb' ? c2Obj : c1Obj;
          const bombCell = c1Obj.power === 'color-bomb' ? c1Obj : c2Obj;
          clearedIds.add(bombCell.id);
          tempCells.forEach(c => {
            if (c.cat === normalCell.cat) clearedIds.add(c.id);
          });
        }
      }
    }

    if (!bombTriggered) {
      const scanMatches = findMatches2D(grid2D);
      if (scanMatches.size > 0) {
        isMatch = true;
        clearedIds = scanMatches;
      }
    }

    if (!isMatch) {
      // SWAP BACK visually
      sfx.playError();
      setCells(prev => {
        return prev.map(c => {
          if (c.r === r2 && c.c === c2 && c.id === c1Obj?.id) return { ...c, r: r1, c: c1, targetR: r1 };
          if (c.r === r1 && c.c === c1 && c.id === c2Obj?.id) return { ...c, r: r2, c: c2, targetR: r2 };
          return c;
        });
      });
      await sleep(340);
      setBusy(false);
      return;
    }

    // Moves deduct
    setMoves(m => {
      const nextMoves = m - 1;
      if (nextMoves <= 0) setTimeout(() => setGameOver(true), 1200);
      return nextMoves;
    });

    await processChain(tempCells, clearedIds);
    setBusy(false);
  }, [busy, gameOver, cells]);

  // Touch & Drag Gesture recognitions
  const handleStart = (r: number, c: number, clientX: number, clientY: number) => {
    if (busy || gameOver) return;
    startRef.current = { r, c, x: clientX, y: clientY };
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent, r: number, c: number, clientX: number, clientY: number) => {
    if (!startRef.current) return;
    const start = startRef.current;
    if (start.r !== r || start.c !== c) return;

    const dx = clientX - start.x;
    const dy = clientY - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 22) { // Swipe threshold
      startRef.current = null;
      let tr = r;
      let tc = c;
      if (Math.abs(dx) > Math.abs(dy)) {
        tc += dx > 0 ? 1 : -1;
      } else {
        tr += dy > 0 ? 1 : -1;
      }

      if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
        doSwap(r, c, tr, tc);
      }
    }
  };

  const handleEnd = () => {
    startRef.current = null;
  };

  const handleTap = (r: number, c: number) => {
    if (busy || gameOver) return;
    if (!selected) {
      setSelected([r, c]);
      return;
    }
    const [sr, sc] = selected;
    if (sr === r && sc === c) {
      setSelected(null);
      return;
    }
    if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) {
      setSelected([r, c]);
      return;
    }
    doSwap(sr, sc, r, c);
  };

  const restart = () => {
    setCells(mkInitialFlatGrid());
    setSelected(null);
    setBusy(false);
    setScore(0);
    setCombo(0);
    setMoves(MOVES_START);
    setGameOver(false);
    setPops([]);
  };

  // Evaluate final badge star counts
  const stars = score >= 1200 ? 3 : score >= 700 ? 2 : score >= 350 ? 1 : 0;
  const xpEarned = Math.round(score / 8);

  return (
    <div className="flex flex-col items-center gap-3 p-3 pb-8 select-none relative overflow-hidden" style={{ touchAction: "none" }}>
      
      {/* Dynamic Keyframes Injection */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          25% { transform: translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-42px) scale(0.9); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.4); filter: brightness(1); }
          50% { box-shadow: 0 0 15px rgba(255, 234, 0, 0.9); filter: brightness(1.25); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 1.2s infinite ease-in-out;
        }
      `}</style>

      <GameHeader title="अक्षर कँडी (Akshar Crush)" score={score} total={moves} levelLabel={`Moves Remaining`} />
      
      {/* Vowel Matra Legend */}
      <div className="flex gap-1 flex-wrap justify-center max-w-sm">
        {CATS.map((cat, i) => (
          <span key={i} className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-black border tracking-wider",
            cat.bg, cat.text, cat.border,
          )}>
            {cat.label} = {cat.name}
          </span>
        ))}
      </div>

      {/* 2D Board grid container with Absolute Cells */}
      <div className="relative rounded-3xl border-4 border-slate-700 shadow-2xl bg-slate-900 p-2.5 overflow-hidden"
        style={{
          width: `${COLS * 52 + 20}px`,
          height: `${ROWS * 52 + 20}px`,
        }}
      >
        {/* Floating popups overlay layer */}
        {pops.map(p => (
          <div key={p.id} className="absolute text-yellow-300 font-black text-sm select-none pointer-events-none animate-float-up drop-shadow-md z-30 bg-slate-900/80 px-2 py-0.5 rounded-full border border-yellow-400"
            style={{ left: p.x, top: p.y }}>
            {p.text}
          </div>
        ))}

        {/* Combo indicator overlay */}
        {combo > 1 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white animate-bounce shadow">
             🔥 {combo} COMBO MATCH!
          </div>
        )}

        {/* Render cells */}
        {cells.map(cell => {
          if (cell.matched && !cell.power) return null; // matched normal cells dissolve

          const cat = CATS[cell.cat];
          const isSel = selected?.[0] === cell.r && selected?.[1] === cell.c;
          
          let cellStyle = cn(
            "w-11 h-11 rounded-2xl font-black text-lg flex items-center justify-center leading-none border-2",
            "transition-all duration-300 select-none cursor-grab active:cursor-grabbing",
            cat.bg, cat.border, cat.text,
            isSel && "ring-4 ring-yellow-300 border-white scale-110 brightness-110 z-20",
            cell.matched && "scale-0 opacity-0 duration-200"
          );

          if (cell.power === 'striped-row') {
            cellStyle = cn(
              cellStyle,
              "border-y-4 border-x-2 border-white ring-2 ring-yellow-400 animate-pulse-glow"
            );
          } else if (cell.power === 'striped-col') {
            cellStyle = cn(
              cellStyle,
              "border-x-4 border-y-2 border-white ring-2 ring-yellow-400 animate-pulse-glow"
            );
          } else if (cell.power === 'color-bomb') {
            cellStyle = cn(
              "w-11 h-11 rounded-2xl font-black text-lg flex items-center justify-center leading-none border-2 border-white",
              "transition-all duration-300 select-none cursor-grab active:cursor-grabbing",
              "bg-gradient-to-br from-indigo-500 via-purple-500 via-pink-500 to-rose-500",
              "text-white shadow-lg animate-bounce ring-4 ring-yellow-300",
              cell.matched && "scale-0 opacity-0 duration-200"
            );
          }

          return (
            <button
              key={cell.id}
              onMouseDown={e => handleStart(cell.r, cell.c, e.clientX, e.clientY)}
              onMouseMove={e => handleMove(e, cell.r, cell.c, e.clientX, e.clientY)}
              onMouseUp={handleEnd}
              onTouchStart={e => handleStart(cell.r, cell.c, e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={e => handleMove(e, cell.r, cell.c, e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleEnd}
              onClick={() => handleTap(cell.r, cell.c)}
              className={cellStyle}
              style={{
                position: "absolute",
                transform: `translate(${cell.c * 52 + 10}px, ${cell.r * 52 + 10}px)`,
                WebkitTapHighlightColor: "transparent",
                transition: busy ? "transform 320ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease, scale 200ms ease" : "transform 150ms ease-out"
              }}
            >
              {cell.power === 'color-bomb' ? '💣' : cell.syl}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 text-center max-w-xs font-bold mt-1">
        💡 समान मात्रा असलेले ३ किंवा अधिक अक्षर ओळखून स्वाइप करा!
      </p>

      {/* Recap Star Celebration Screen */}
      {gameOver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 text-center border border-slate-700 shadow-2xl max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300">
            
            <div className="space-y-1">
              <span className="text-sm font-black text-rose-400 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20 uppercase tracking-widest animate-pulse">
                Level Complete
              </span>
              <h2 className="text-3xl font-black text-white pt-2">अक्षर कँडी</h2>
              <p className="text-slate-400 text-xs font-semibold">खेळ संपला! छान प्रयत्न!</p>
            </div>

            {/* Stars Achievement popout */}
            <div className="flex justify-center items-center gap-4 py-2">
              {[1, 2, 3].map(index => {
                const earned = index <= stars;
                return (
                  <div key={index} className="relative">
                    <Star className={cn(
                      "w-14 h-14 transition-all duration-700",
                      earned ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-110 animate-bounce" : "text-slate-600 scale-90 opacity-40"
                    )} style={{ animationDelay: `${index * 150}ms` }} />
                    <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      {index === 1 ? '350 pts' : index === 2 ? '700 pts' : '1200 pts'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stats list */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Score</p>
                <p className="text-3xl font-black text-white">{score}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Awarded</p>
                <p className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-1">
                   ⚡ {xpEarned}
                </p>
              </div>
            </div>

            {/* Buttons control */}
            <div className="space-y-2">
              <button
                onClick={restart}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> पुन्हा खेळा 🔄
              </button>
              
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> बाहेर पडा (Exit)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
