// app/dashboard/reportes/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBalanceSheet,
  getIncomeStatement,
  getExecutiveSummary,
  getCurrentPeriod,
} from "@/lib/services";
import { BalanceSheet } from "@/components/financial/balance-sheet";
import { IncomeStatement } from "@/components/financial/income-statement";
import { ExecutiveSummary } from "@/components/financial/executive-summary";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Reportes Financieros | Piggsy",
  description: "Estados financieros y reportes contables",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const [balanceSheet, incomeStatement, executiveSummary, period] =
    await Promise.all([
      getBalanceSheet(),
      getIncomeStatement(),
      getExecutiveSummary(),
      getCurrentPeriod(),
    ]);

  return (
    <Layout user={user}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reportes Financieros</h1>
            <p className="text-muted-foreground">Período: {period.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Vista Previa
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Resumen Ejecutivo</TabsTrigger>
            <TabsTrigger value="balance">Balance General</TabsTrigger>
            <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <ExecutiveSummary data={executiveSummary} />
          </TabsContent>

          <TabsContent value="balance">
            <BalanceSheet data={balanceSheet} />
          </TabsContent>

          <TabsContent value="income">
            <IncomeStatement data={incomeStatement} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
