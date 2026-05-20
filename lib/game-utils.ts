import { useState, useRef } from 'react';

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// For static array banks
export function useNonRepeatingArray<T>(initialArray: T[], getSignature?: (item: T) => string) {
  const [pool, setPool] = useState<T[]>(() => shuffle(initialArray));
  const [index, setIndex] = useState(0);

  const getNext = (): T => {
    if (index + 1 >= pool.length) {
      // Re-shuffle when we run out
      const lastItem = pool[pool.length - 1];
      let nextPool = shuffle(initialArray);
      
      // Ensure the first item of the new shuffle isn't the same as the last item we just played
      const sigLast = getSignature ? getSignature(lastItem) : JSON.stringify(lastItem);
      const sigFirst = getSignature ? getSignature(nextPool[0]) : JSON.stringify(nextPool[0]);
      
      if (sigFirst === sigLast && nextPool.length > 1) {
        const temp = nextPool[0];
        nextPool[0] = nextPool[1];
        nextPool[1] = temp;
      }
      
      setPool(nextPool);
      setIndex(1); // Advance index to 1 because we are returning index 0 right now
      return nextPool[0];
    }
    
    const nextIndex = index + 1;
    setIndex(nextIndex);
    return pool[nextIndex];
  };

  const current = pool[index < pool.length ? index : pool.length - 1];

  return { current, getNext, poolIndex: index };
}

// For dynamically generated questions (math, random items)
export function useNonRepeatingGenerator<T>(generatorFn: () => T, getSignature: (item: T) => string, maxRetries = 50) {
  const usedSignatures = useRef<Set<string>>(new Set());
  
  const generateUnique = (): T => {
    let newItem = generatorFn();
    let sig = getSignature(newItem);
    let attempts = 0;
    
    // Keep generating until we find an unused signature
    while (usedSignatures.current.has(sig) && attempts < maxRetries) {
      newItem = generatorFn();
      sig = getSignature(newItem);
      attempts++;
    }
    
    if (attempts >= maxRetries) {
      // If we completely exhausted the pool of possible combinations, clear it and start over
      usedSignatures.current.clear();
      usedSignatures.current.add(sig);
    } else {
      usedSignatures.current.add(sig);
    }
    
    return newItem;
  };

  return { generateUnique };
}
