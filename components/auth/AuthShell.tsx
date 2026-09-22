import Image from "next/image";
import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  sideImage?: string;
  sideImageAlt?: string;
  wide?: boolean;
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/login" className="inline-flex items-center gap-2.5">
      <div
        className={
          dark
            ? "flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white"
            : "flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-border"
        }
      >
        <Image
          src="/images/teamzen_zoomed.webp"
          alt="Teamzen"
          width={36}
          height={36}
          className="h-8 w-8 object-contain"
          priority
        />
      </div>
      <span
        className={
          dark
            ? "text-lg font-semibold tracking-tight text-white"
            : "text-base font-semibold text-foreground"
        }
      >
        Teamzen
      </span>
    </Link>
  );
}

export function AuthShell({
  children,
  title,
  description,
  sideImage = "/images/auth/login-admin.webp",
  sideImageAlt = "Teamzen admin workspace illustration",
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">
      {/* Background Image Container */}
      <aside className="absolute inset-0 z-0 lg:relative lg:flex lg:flex-col lg:justify-between lg:bg-[#e8eef4] lg:overflow-hidden">
        <Image
          src={sideImage}
          alt={sideImageAlt}
          fill
          priority
          sizes="100vw, (min-width: 1024px) 50vw"
          className="object-cover object-center"
        />
        {/* Overlay: dark on mobile for text readability, gradient on desktop */}
        <div className="absolute inset-0 bg-black/60 lg:bg-gradient-to-t lg:from-black/55 lg:via-black/15 lg:to-black/25" />

        <div className="relative z-10 hidden px-10 pt-12 lg:block">
          <BrandMark dark />
        </div>

        <div className="relative z-10 hidden max-w-md space-y-4 px-10 pb-12 lg:block">
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-white">
            Workforce and payroll administration
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            Manage employees, attendance, leave, and payroll from one admin workspace.
          </p>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Teamzen Pvt. Ltd.
          </p>
        </div>
      </aside>

      {/* Form Container */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 lg:bg-background">
        <div 
          className={`mx-auto w-full rounded-2xl bg-background/95 p-6 shadow-2xl backdrop-blur-xl border border-white/20 sm:p-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none lg:border-none ${wide ? "max-w-lg" : "max-w-md"}`}
        >
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {children}

          <p className="mt-10 text-center text-xs text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} Teamzen Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
