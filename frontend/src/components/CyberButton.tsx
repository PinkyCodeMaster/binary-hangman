import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CyberButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function CyberButton({ 
  children, 
  variant = "primary", 
  className = "",
  disabled = false,
  ...props 
}: CyberButtonProps) {
  const baseStyles = "px-6 py-3 font-mono font-bold tracking-wider uppercase text-sm transition-all duration-300 rounded-lg";
  
  const variants = {
    primary: "bg-primary/20 border border-primary text-primary hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]",
    secondary: "bg-secondary/20 border border-secondary text-secondary hover:bg-secondary/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    outline: "bg-transparent border border-primary/50 text-primary hover:border-primary hover:bg-primary/10"
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
