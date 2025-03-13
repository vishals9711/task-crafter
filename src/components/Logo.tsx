import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 32, height = 32, ...props }: LogoProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'width' | 'height'>) {
  return (
    <div className={cn("relative", className)} style={{ width, height }} {...props}>
      <Image
        src="/task_crafter.jpg"
        alt="Task Crafter Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
} 
