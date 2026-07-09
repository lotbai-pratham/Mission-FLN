"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in" | "zoom-in";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once it's visible, we can unobserve if we only want it to animate once
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it hits the bottom
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const baseStyles = "transition-all duration-1000 ease-out";
  
  const animationStyles = {
    "fade-up": cn(
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
    ),
    "fade-in": cn(
      isVisible ? "opacity-100" : "opacity-0"
    ),
    "zoom-in": cn(
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    ),
  };

  return (
    <div
      ref={ref}
      className={cn(baseStyles, animationStyles[animation], className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
