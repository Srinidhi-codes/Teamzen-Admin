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
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#e8eef4] lg:flex lg:flex-col lg:justify-between">
        <Image
          src={sideImage}
          alt={sideImageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />

        <div className="relative z-10 px-10 pt-12">
          <BrandMark dark />
        </div>

        <div className="relative z-10 max-w-md space-y-4 px-10 pb-12">
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

      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className={`mx-auto w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
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
