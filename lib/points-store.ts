'use client';

import { useState, useEffect } from 'react';

const XP_KEY = 'fln_hub_total_xp';
const STREAK_KEY = 'fln_hub_daily_streak';
const LAST_DATE_KEY = 'fln_hub_last_active';
const NOTIFIED_LEVEL_KEY = 'fln_hub_notified_level';
const XP_UPDATE_EVENT = 'fln_hub_xp_update';
const COINS_KEY = 'fln_hub_coins';
const OWNED_ITEMS_KEY = 'fln_hub_owned_items';
const EQUIPPED_ITEMS_KEY = 'fln_hub_equipped_items';

export interface Badge {
  name: string;
  emoji: string;
  color: string; // HSL/RGB gradients inspired by premium apps
  bgLight: string;
  textColor: string;
  description: string;
}

export const BADGES: Record<number, Badge> = {
  1: { name: "FLN Apprentice", emoji: "🌱", color: "from-emerald-400 via-teal-400 to-emerald-500 shadow-emerald-500/20", bgLight: "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50", textColor: "text-emerald-700 dark:text-emerald-400", description: "Your journey starts here! Taking the first steps in learning." },
  2: { name: "Curious Thinker", emoji: "🧭", color: "from-sky-400 via-blue-400 to-sky-500 shadow-sky-500/20", bgLight: "bg-sky-50/80 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/50", textColor: "text-sky-700 dark:text-sky-400", description: "Exploring deeper concepts and asking smart questions." },
  3: { name: "Bright Mind", emoji: "🏆", color: "from-amber-400 via-orange-400 to-amber-500 shadow-amber-500/20", bgLight: "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50", textColor: "text-amber-700 dark:text-amber-400", description: "Consistent, dedicated, and scaling new heights daily!" },
  4: { name: "Knowledge Master", emoji: "🧠", color: "from-indigo-500 via-purple-500 to-indigo-600 shadow-indigo-500/20", bgLight: "bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50", textColor: "text-indigo-700 dark:text-indigo-400", description: "Demonstrating high-level problem-solving and expertise." },
  5: { name: "FLN Champion", emoji: "⚡", color: "from-pink-500 via-rose-500 to-pink-600 shadow-pink-500/20", bgLight: "bg-pink-50/80 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/50", textColor: "text-pink-700 dark:text-pink-400", description: "A lightning-fast scholar crushing all learning battles!" },
  6: { name: "FLN Guardian", emoji: "🛡️", color: "from-red-500 via-orange-500 to-rose-600 shadow-red-500/20", bgLight: "bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50", textColor: "text-rose-700 dark:text-rose-400", description: "A defender of truth and master of words and numbers." },
  7: { name: "Future Architect", emoji: "🚀", color: "from-cyan-400 via-sky-400 to-blue-600 shadow-cyan-500/20", bgLight: "bg-cyan-50/80 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/50", textColor: "text-cyan-700 dark:text-cyan-400", description: "Building a brighter future through education and persistence!" },
  8: { name: "Elite Pioneer", emoji: "🌟", color: "from-fuchsia-500 via-violet-500 to-purple-600 shadow-fuchsia-500/20", bgLight: "bg-fuchsia-50/80 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800/50", textColor: "text-fuchsia-700 dark:text-fuchsia-400", description: "Leading the pack with outstanding records and skill!" },
  9: { name: "Grandmaster Legend", emoji: "👑", color: "from-yellow-400 via-amber-400 to-yellow-600 shadow-yellow-500/20", bgLight: "bg-yellow-50/80 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/50", textColor: "text-yellow-700 dark:text-yellow-400", description: "A legendary status achieved by only the most elite minds!" },
  10: { name: "Cosmic Sage", emoji: "🌌", color: "from-fuchsia-600 via-purple-600 to-indigo-700 shadow-indigo-500/20", bgLight: "bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50", textColor: "text-indigo-700 dark:text-indigo-400", description: "Ultimate cosmic mastery! You have conquered the FLN universe!" },
};

export function getBadgeForLevel(lvl: number): Badge {
  if (lvl >= 10) return BADGES[10];
  return BADGES[lvl] || BADGES[1];
}

export function usePoints() {
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [newLevelReached, setNewLevelReached] = useState<number>(1);
  const [coins, setCoins] = useState<number>(0);
  const [ownedItems, setOwnedItems] = useState<string[]>(['color_amber']);
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({ color: 'color_amber' });

  // Sync state across multiple tabs or hook instances in the same tab
  useEffect(() => {
    const handleXpUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { xp: updatedXp, level: updatedLevel, showLevelUp: triggerLevelUp, newLevelReached: newLvl, coins: c, ownedItems: o, equippedItems: eq } = customEvent.detail;
        if (updatedXp !== undefined) setXp(updatedXp);
        if (updatedLevel !== undefined) setLevel(updatedLevel);
        if (c !== undefined) setCoins(c);
        if (o !== undefined) setOwnedItems(o);
        if (eq !== undefined) setEquippedItems(eq);
        if (triggerLevelUp) {
          setNewLevelReached(newLvl);
          setShowLevelUp(true);
        }
      }
    };

    window.addEventListener(XP_UPDATE_EVENT, handleXpUpdate);
    return () => window.removeEventListener(XP_UPDATE_EVENT, handleXpUpdate);
  }, []);

  // Load initial data
  useEffect(() => {
    const savedXp = localStorage.getItem(XP_KEY);
    const savedStreak = localStorage.getItem(STREAK_KEY);
    const lastDate = localStorage.getItem(LAST_DATE_KEY);
    const notifiedLvl = localStorage.getItem(NOTIFIED_LEVEL_KEY);

    if (savedXp) {
      const parsedXp = parseInt(savedXp, 10);
      setXp(parsedXp);
      const calculatedLevel = Math.floor(Math.sqrt(parsedXp / 100)) + 1;
      setLevel(calculatedLevel);

      const parsedNotified = notifiedLvl ? parseInt(notifiedLvl, 10) : 1;
      if (calculatedLevel > parsedNotified) {
        setNewLevelReached(calculatedLevel);
        setShowLevelUp(true);
      }
    }

    if (savedStreak) setStreak(parseInt(savedStreak, 10));

    const savedCoins = localStorage.getItem(COINS_KEY);
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    const savedOwned = localStorage.getItem(OWNED_ITEMS_KEY);
    if (savedOwned) setOwnedItems(JSON.parse(savedOwned));

    const savedEquipped = localStorage.getItem(EQUIPPED_ITEMS_KEY);
    if (savedEquipped) setEquippedItems(JSON.parse(savedEquipped));

    // Handle Streak Logic
    const today = new Date().toDateString();
    if (lastDate !== today) {
      if (lastDate) {
        const last = new Date(lastDate);
        const diff = (new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 2) {
          const newStreak = parseInt(savedStreak || '0', 10) + 1;
          setStreak(newStreak);
          localStorage.setItem(STREAK_KEY, newStreak.toString());
        } else {
          setStreak(1);
          localStorage.setItem(STREAK_KEY, '1');
        }
      } else {
        setStreak(1);
        localStorage.setItem(STREAK_KEY, '1');
      }
      localStorage.setItem(LAST_DATE_KEY, today);
    }
  }, []);

  const addXP = (amount: number) => {
    const savedXp = localStorage.getItem(XP_KEY);
    const currentXp = savedXp ? parseInt(savedXp, 10) : 0;
    const newXp = currentXp + amount;
    
    const savedCoins = localStorage.getItem(COINS_KEY);
    const currentCoins = savedCoins ? parseInt(savedCoins, 10) : 0;
    const newCoins = currentCoins + amount; // 1 XP = 1 Coin

    localStorage.setItem(XP_KEY, newXp.toString());
    localStorage.setItem(COINS_KEY, newCoins.toString());
    setXp(newXp);
    setCoins(newCoins);
    
    // Update Level
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
    let levelUpTriggered = false;

    if (newLevel > level) {
      setLevel(newLevel);
      setNewLevelReached(newLevel);
      setShowLevelUp(true);
      levelUpTriggered = true;
    }

    // Dispatch global event for instant updates
    window.dispatchEvent(
      new CustomEvent(XP_UPDATE_EVENT, {
        detail: {
          xp: newXp,
          level: newLevel,
          showLevelUp: levelUpTriggered,
          newLevelReached: newLevel,
          coins: newCoins
        }
      })
    );
  };

  const buyItem = (itemId: string, cost: number) => {
    if (coins >= cost && !ownedItems.includes(itemId)) {
      const newCoins = coins - cost;
      const newOwned = [...ownedItems, itemId];
      setCoins(newCoins);
      setOwnedItems(newOwned);
      localStorage.setItem(COINS_KEY, newCoins.toString());
      localStorage.setItem(OWNED_ITEMS_KEY, JSON.stringify(newOwned));
      
      window.dispatchEvent(new CustomEvent(XP_UPDATE_EVENT, {
        detail: { coins: newCoins, ownedItems: newOwned }
      }));
      return true;
    }
    return false;
  };

  const equipItem = (category: string, itemId: string) => {
    if (ownedItems.includes(itemId)) {
      const newEquipped = { ...equippedItems, [category]: itemId };
      setEquippedItems(newEquipped);
      localStorage.setItem(EQUIPPED_ITEMS_KEY, JSON.stringify(newEquipped));
      
      window.dispatchEvent(new CustomEvent(XP_UPDATE_EVENT, {
        detail: { equippedItems: newEquipped }
      }));
    }
  };

  const dismissLevelUp = () => {
    setShowLevelUp(false);
    localStorage.setItem(NOTIFIED_LEVEL_KEY, level.toString());
  };

  const calculateProgressToNextLevel = () => {
    const currentLevelXp = Math.pow(level - 1, 2) * 100;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return {
    xp,
    streak,
    level,
    addXP,
    badge: getBadgeForLevel(level),
    showLevelUp,
    newLevelReached,
    dismissLevelUp,
    progress: calculateProgressToNextLevel(),
    coins,
    ownedItems,
    equippedItems,
    buyItem,
    equipItem
  };
}
