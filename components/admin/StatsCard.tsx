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
    <div className="group relative bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
      {/* Premium Background Layer */}
      <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-linear-to-br ${color === 'blue' ? 'from-blue-600' : color === 'green' ? 'from-emerald-600' : color === 'yellow' ? 'from-amber-600' : color === 'red' ? 'from-rose-600' : 'from-primary'} to-transparent`} />

      {/* Decorative Large Background Icon */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-[0.1] pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Icon size={140} className="-rotate-12" />
      </div>

      <div className="relative p-7 flex items-center justify-between z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter leading-none">{value}</p>
          {trend && (
            <div
              className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${trend.isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
              <span className="opacity-60">vs last cycle</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

