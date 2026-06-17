import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  mainClassName,
}: {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}) {
  return (
    <div className={cn("min-h-screen", className)}>
      <Navbar />
      <main id="main" className={cn("pt-28", mainClassName)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
