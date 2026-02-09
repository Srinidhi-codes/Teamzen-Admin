"use client";

interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  index?: string | number;
  color?: string;
  gradient?: string;
}

export function Stat({ icon: Icon, label, value, index, color = "text-primary", gradient = "bg-primary/10" }: StatProps) {
  // Logic to determine if Icon is a component (function or forwardRef object)
  const isComponent = typeof Icon === 'function' ||
    (typeof Icon === 'object' && Icon !== null && (Icon.$$typeof || Icon.render));

  return (
    <div className="premium-card card-hover group relative overflow-hidden">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
        {isComponent ? (
          <Icon className={`w-28 h-28 ${color} rotate-12`} />
        ) : (
          <div className="w-28 h-28 rotate-12 scale-150">
            {Icon}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Top Section: Icon & Index */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${gradient} ${color} flex items-center justify-center shadow-inner`}>
            {isComponent ? (
              <Icon className="w-7 h-7" />
            ) : (
              <div className="w-7 h-7">
                {Icon}
              </div>
            )}
          </div>
          {index && <div className="text-premium-label opacity-40">Index {index}</div>}
        </div>

        {/* Bottom Section: Data */}
        <div className="space-y-1">
          <h3 className={`text-premium-h1 tabular-nums ${color}`}>{value}</h3>
          <p className="text-premium-label">{label}</p>
        </div>
      </div>
    </div>
  );
}


