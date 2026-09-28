"use client";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ title, children, className = "", hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={`
        ${gradient ? 'glass' : 'premium-card'} 
        ${hover ? 'card-hover' : ''} 
        ${className}
      `}
    >
      {title && (
        <h2 className="text-premium-h2 mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-primary rounded-full mr-3 shadow-sm shadow-primary/20"></span>
          {title}
        </h2>
      )}
      <div className="font-medium text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
