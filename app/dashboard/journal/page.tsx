// app/dashboard/journal/page.tsx
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getRecentTransactions, getCurrentPeriod } from "@/lib/services";
import { TransactionsList } from "@/components/journal/transactions-list";
import { QuickEntry } from "@/components/journal/quick-entry";

export const metadata: Metadata = {
  title: "Diario Contable | Piggsy",
  description: "Registro de movimientos contables",
};

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const [transactions, period] = await Promise.all([
    getRecentTransactions(20),
    getCurrentPeriod(),
  ]);

  return (
    <Layout user={user}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Diario Contable</h1>
            <p className="text-muted-foreground">Período: {period.name}</p>
          </div>
          <Link href="/dashboard/journal/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          </Link>
        </div>

        {/* Quick Entry */}
        <QuickEntry />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>
              Últimos movimientos registrados en el diario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
