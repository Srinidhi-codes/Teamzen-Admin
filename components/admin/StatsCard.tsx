import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  yellow: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  red: "bg-destructive/10 text-destructive border border-destructive/20",
  purple: "bg-primary/10 text-primary border border-primary/20",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-black text-foreground tracking-tight">{value}</p>
          {trend && (
            <p
              className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block ${trend.isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

