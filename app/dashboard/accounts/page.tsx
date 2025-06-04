// app/dashboard/cuentas/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAccountBalances,
  getAllTAccounts,
  getCurrentPeriod,
} from "@/lib/services";
import { AccountsList } from "@/components/accounts/accounts-list";
import { TAccountModal } from "@/components/accounts/t-account-modal";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Cuentas T | Piggsy",
  description: "Visualización de cuentas T y mayores auxiliares",
};

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const [accountBalances, tAccounts, period] = await Promise.all([
    getAccountBalances(),
    getAllTAccounts(),
    getCurrentPeriod(),
  ]);

  // Filtrar solo cuentas con movimientos
  const activeAccounts = accountBalances.filter(
    (acc) =>
      Math.abs(acc.balance) > 0.01 ||
      acc.total_debit > 0 ||
      acc.total_credit > 0
  );

  return (
    <Layout user={user}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Cuentas T</h1>
          <p className="text-muted-foreground">Período: {period.name}</p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Cuenta</CardTitle>
            <CardDescription>
              Busca por código o nombre de cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuenta..."
                className="pl-8"
                id="account-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Cuentas con Movimientos</CardTitle>
            <CardDescription>
              Haz clic en una cuenta para ver su detalle en forma de T
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountsList accounts={activeAccounts} tAccountsData={tAccounts} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
