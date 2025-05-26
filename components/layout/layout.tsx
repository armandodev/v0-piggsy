import { User } from "@supabase/supabase-js";
import Header from "./header";
import ThemeSwitcher from "../theme-switcher";
import { cn } from "@/lib/utils";

export default function Layout({
  className = "",
  children,
  user = undefined,
  form = false,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
  user?: User;
  form?: boolean;
}>) {
  return (
    <>
      {!user && form && (
        <nav className="fixed top-4 right-4 p-4">
          <ThemeSwitcher />
        </nav>
      )}
      <Header user={user} form={form} />
      <main
        className={cn("grid place-items-center w-full min-h-screen", className)}
      >
        {children}
      </main>
    </>
  );
}
