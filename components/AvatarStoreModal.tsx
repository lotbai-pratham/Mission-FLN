"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Check } from "lucide-react";
import RobotAvatar, { ColorTheme, Hat, Accessory } from "./RobotAvatar";
import { usePoints } from "@/lib/points-store";
import { cn } from "@/lib/utils";

interface AvatarStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORE_ITEMS = {
  colors: [
    { id: "color_amber", name: "Amber Original", cost: 0, category: "color" as const },
    { id: "color_sky", name: "Sky Blue", cost: 50, category: "color" as const },
    { id: "color_rose", name: "Rose Pink", cost: 50, category: "color" as const },
    { id: "color_emerald", name: "Emerald Green", cost: 100, category: "color" as const },
    { id: "color_purple", name: "Cosmic Purple", cost: 150, category: "color" as const },
  ],
  hats: [
    { id: "none", name: "No Hat", cost: 0, category: "hat" as const },
    { id: "hat_cap", name: "Red Cap", cost: 100, category: "hat" as const },
    { id: "hat_wizard", name: "Magic Hat", cost: 250, category: "hat" as const },
    { id: "hat_crown", name: "Golden Crown", cost: 500, category: "hat" as const },
  ],
  accessories: [
    { id: "none", name: "No Accessory", cost: 0, category: "accessory" as const },
    { id: "acc_glasses", name: "Smart Glasses", cost: 150, category: "accessory" as const },
    { id: "acc_mask", name: "Ninja Mask", cost: 300, category: "accessory" as const },
  ],
};

export default function AvatarStoreModal({ isOpen, onClose }: AvatarStoreModalProps) {
  const { coins, ownedItems, equippedItems, buyItem, equipItem } = usePoints();
  const [activeTab, setActiveTab] = useState<"colors" | "hats" | "accessories">("colors");

  if (!isOpen) return null;

  const handleItemClick = (item: any) => {
    if (item.id === "none") {
      equipItem(item.category, item.id);
      return;
    }

    if (ownedItems.includes(item.id)) {
      equipItem(item.category, item.id);
    } else {
      buyItem(item.id, item.cost);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Left Side: Avatar Preview */}
        <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 md:hidden bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black px-4 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
             {coins} 🪙
          </div>

          <div className="w-48 h-48 rounded-full bg-gradient-to-b from-white to-slate-200 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center shadow-inner mt-8">
            <RobotAvatar 
              size={120} 
              colorTheme={(equippedItems.color || "color_amber") as ColorTheme}
              hat={(equippedItems.hat === "none" ? null : equippedItems.hat) as Hat}
              accessory={(equippedItems.accessory === "none" ? null : equippedItems.accessory) as Accessory}
            />
          </div>
          
          <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">Your Avatar</h3>
          <p className="text-sm text-slate-500 text-center mt-2">Earn more coins by playing games to unlock premium outfits!</p>
        </div>

        {/* Right Side: Store interface */}
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-500" /> Avatar Store
            </h2>
            <button onClick={onClose} className="hidden md:block p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 shrink-0">
            {(["colors", "hats", "accessories"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {STORE_ITEMS[activeTab].map((item) => {
                const isOwned = item.id === "none" || ownedItems.includes(item.id);
                const isEquipped = equippedItems[item.category] === item.id || (item.id === "none" && !equippedItems[item.category]);
                const canAfford = coins >= item.cost;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={!isOwned && !canAfford}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-32 relative overflow-hidden group",
                      isEquipped 
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10 shadow-md"
                        : isOwned
                          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300"
                          : !canAfford 
                            ? "opacity-50 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 shadow-sm"
                    )}
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                      {item.id !== "none" && !isOwned && (
                        <p className={cn("text-xs font-black mt-1", canAfford ? "text-amber-500" : "text-red-400")}>
                          {item.cost} 🪙
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between w-full">
                      {isEquipped ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipped
                        </span>
                      ) : isOwned ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Equip
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded transition-all",
                          canAfford ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        )}>
                          Buy
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
