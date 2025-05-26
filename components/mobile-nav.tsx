"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/journal",
      label: "Diario Contable",
      active: pathname === "/dashboard/journal",
    },
    {
      href: "/dashboard/reportes",
      label: "Reportes",
      active: pathname === "/dashboard/reportes",
    },
    {
      href: "/dashboard/cuentas",
      label: "Cuentas",
      active: pathname === "/dashboard/cuentas",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold text-xl">Piggsy</span>
          </Link>
        </div>
        <div className="flex flex-col space-y-3 mt-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-7 py-2 text-base font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
