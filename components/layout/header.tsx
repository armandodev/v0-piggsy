import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "../theme-switcher";
import { UserNav } from "../user-nav";
import { User } from "@supabase/supabase-js";
import { MainNav } from "../main-nav";
import { MobileNav } from "../mobile-nav";

export default function Header({
  user = undefined,
  form = false,
}: {
  user?: User;
  form?: boolean;
}) {
  if (form) return null;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Piggsy</span>
          </Link>
          <MainNav className="hidden md:flex" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserNav user={user} />
          {!user && (
            <Link href="/sign-in">
              <Button
                className="bg-teal-500 hover:bg-teal-600 dark:bg-white dark:hover:bg-gray-200"
                variant="default"
                size="sm"
              >
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
