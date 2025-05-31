import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AccountSummary } from "@/components/dashboard/account-summary";
import { Layout } from "@/components/layout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardMetrics,
  getRecentTransactions,
  getAccountSummary,
  getMonthlyChartData,
} from "@/lib/services/dashboard-service";
import { formatCurrency } from "@/lib/utils/format-utils";

export const metadata = {
  title: "Dashboard | Piggsy",
  description: "Panel de control del sistema de contabilidad Piggsy",
};

async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null };
  }

  return { user };
}

export default async function DashboardPage() {
  const { user } = await getUserProfile();
  if (!user) redirect("/auth/login");

  // Add some debug logging
  console.log("Dashboard: User ID:", user.id);

  const [metrics, recentTransactions, accountSummary, chartData] =
    await Promise.all([
      getDashboardMetrics(),
      getRecentTransactions(5),
      getAccountSummary(),
      getMonthlyChartData(),
    ]);

  // Debug logging
  console.log("Dashboard metrics:", metrics);
  console.log("Recent transactions:", recentTransactions);
  console.log("Account summary:", accountSummary);
  console.log("Chart data:", chartData);

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Layout user={user}>
      <section className="p-4">
        <h2 className="w-full text-3xl font-bold">Dashboard</h2>
        <div className="mb-4 text-sm text-muted-foreground">
          Usuario: {user.email} | ID: {user.id}
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.totalAssets)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.assetChange)} respecto al mes
                    anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pasivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.totalLiabilities)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.liabilityChange)} respecto al mes
                    anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.monthlyRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.revenueChange)} respecto al mes
                    anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gastos del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.monthlyExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.expenseChange)} respecto al mes
                    anterior
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                  <CardDescription>
                    Datos de los últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview data={chartData} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>
                    Últimas {recentTransactions.length} transacciones
                    registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions transactions={recentTransactions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
                <CardDescription>
                  Últimas transacciones registradas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={recentTransactions} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="accounts" className="space-y-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Resumen de Cuentas</CardTitle>
                <CardDescription>
                  {accountSummary.length} cuentas con movimientos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountSummary accounts={accountSummary} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}
