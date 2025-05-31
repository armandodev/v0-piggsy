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

export default async function DashboardPage() {
  // Obtener usuario actual
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirigir si no hay usuario
  if (error || !user) {
    redirect("/sign-in");
  }

  // Cargar todos los datos en paralelo
  const [metrics, recentTransactions, accountSummary, chartData] =
    await Promise.all([
      getDashboardMetrics(),
      getRecentTransactions(5),
      getAccountSummary(),
      getMonthlyChartData(),
    ]);

  // Función para formatear porcentajes
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Layout user={user}>
      <section className="p-4 space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Bienvenido, {user.email}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Métricas principales */}
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
                  {metrics.assetChange !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.assetChange)} vs mes anterior
                    </p>
                  )}
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
                  {metrics.liabilityChange !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.liabilityChange)} vs mes
                      anterior
                    </p>
                  )}
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
                  {metrics.revenueChange !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.revenueChange)} vs mes anterior
                    </p>
                  )}
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
                  {metrics.expenseChange !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.expenseChange)} vs mes anterior
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráficos y tablas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                  <CardDescription>
                    Ingresos vs Gastos - Últimos 6 meses
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
                    Últimos movimientos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions transactions={recentTransactions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Transacciones</CardTitle>
                <CardDescription>
                  Todas las transacciones registradas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={recentTransactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balances de Cuentas</CardTitle>
                <CardDescription>
                  Estado actual de todas las cuentas contables
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
