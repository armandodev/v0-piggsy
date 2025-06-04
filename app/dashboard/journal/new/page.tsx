// app/dashboard/journal/new/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Layout } from "@/components/layout";
import { TransactionForm } from "@/components/journal/transaction-form";
import { getCatalogAccounts, getCurrentPeriod } from "@/lib/services";

export const metadata: Metadata = {
  title: "Nueva Transacción | Piggsy",
  description: "Registrar nueva transacción contable",
};

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const [catalogAccounts, period] = await Promise.all([
    getCatalogAccounts(),
    getCurrentPeriod(),
  ]);

  // Filtrar solo cuentas de detalle
  const detailAccounts = catalogAccounts.filter((account) => account.is_detail);

  return (
    <Layout user={user}>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nueva Transacción</h1>
          <p className="text-muted-foreground">Período: {period.name}</p>
        </div>

        <TransactionForm accounts={detailAccounts} />
      </div>
    </Layout>
  );
}
