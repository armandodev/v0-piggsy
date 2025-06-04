// app/dashboard/page.tsx
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
import {
  getCurrentUser,
  getDashboardMetrics,
  getRecentTransactions,
  getAccountSummary,
  getMonthlyChartData,
} from "@/lib/services";
import { formatCurrency } from "@/lib/utils/format-utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | Piggsy",
  description: "Panel de control del sistema de contabilidad Piggsy",
};

export default async function DashboardPage() {
  // Verificar autenticación
  let user;
  try {
    user = await getCurrentUser();
  } catch {
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
      <section className="p-4 space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Resumen financiero de tu empresa
          </p>
        </div>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Activos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.totalAssets)}
              </div>
              <p className="text-xs text-muted-foreground">
                Capital de trabajo: {formatCurrency(metrics.workingCapital)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pasivos
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.totalLiabilities)}
              </div>
              <p className="text-xs text-muted-foreground">
                Razón corriente: {metrics.currentRatio.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos del Mes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Capital contable: {formatCurrency(metrics.totalEquity)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilidad Neta
              </CardTitle>
              {metrics.netIncome >= 0 ? (
                <PiggyBank className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${metrics.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(Math.abs(metrics.netIncome))}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.netIncome >= 0
                  ? "Utilidad del período"
                  : "Pérdida del período"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Gráficos y tablas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Tendencia Financiera</CardTitle>
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

            {/* Indicadores financieros */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Liquidez</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {metrics.currentRatio.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Razón Corriente
                    </p>
                    <div
                      className={`text-xs mt-2 ${metrics.currentRatio >= 1.5 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {metrics.currentRatio >= 1.5
                        ? "✓ Saludable"
                        : "⚠ Mejorable"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Rentabilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {metrics.monthlyRevenue > 0
                        ? (
                            (metrics.netIncome / metrics.monthlyRevenue) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margen de Utilidad
                    </p>
                    <div
                      className={`text-xs mt-2 ${metrics.netIncome > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {metrics.netIncome > 0 ? "✓ Rentable" : "✗ Pérdida"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Endeudamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {metrics.totalEquity > 0
                        ? (
                            (metrics.totalLiabilities / metrics.totalEquity) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pasivo / Capital
                    </p>
                    <div
                      className={`text-xs mt-2 ${metrics.totalLiabilities / metrics.totalEquity <= 1 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {metrics.totalLiabilities / metrics.totalEquity <= 1
                        ? "✓ Controlado"
                        : "⚠ Alto"}
                    </div>
                  </div>
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
