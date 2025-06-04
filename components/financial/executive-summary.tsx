// components/financial/executive-summary.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/format-utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  PieChart,
} from "lucide-react";

interface ExecutiveSummaryProps {
  data: any;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { totals, metrics } = data;

  // Calcular porcentajes para visualización
  const assetsPercent = totals.assets > 0 ? 100 : 0;
  const liabilitiesPercent =
    totals.assets > 0 ? (totals.liabilities / totals.assets) * 100 : 0;
  const equityPercent =
    totals.assets > 0 ? (totals.equity / totals.assets) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            {metrics.netIncome >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
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
              {metrics.netIncome >= 0 ? "Ganancia" : "Pérdida"} del período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margen de Utilidad
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Utilidad / Ingresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Razón Corriente
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.currentRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Activo Circulante / Pasivo Circulante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estructura Financiera */}
      <Card>
        <CardHeader>
          <CardTitle>Estructura Financiera</CardTitle>
          <CardDescription>
            Composición de activos, pasivos y capital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Activos Totales</span>
              <span className="text-sm font-bold">
                {formatCurrency(totals.assets)}
              </span>
            </div>
            <Progress value={assetsPercent} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Pasivos ({liabilitiesPercent.toFixed(1)}%)
              </span>
              <span className="text-sm font-bold">
                {formatCurrency(totals.liabilities)}
              </span>
            </div>
            <Progress value={liabilitiesPercent} className="h-2 bg-red-100" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Capital ({equityPercent.toFixed(1)}%)
              </span>
              <span className="text-sm font-bold">
                {formatCurrency(totals.equity)}
              </span>
            </div>
            <Progress value={equityPercent} className="h-2 bg-green-100" />
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Clave */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Liquidez</CardTitle>
            <CardDescription>Capacidad de pago a corto plazo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Capital de Trabajo</span>
              <span className="text-sm font-bold">
                {formatCurrency(metrics.workingCapital)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Activo Circulante</span>
              <span className="text-sm">
                {formatCurrency(totals.currentAssets)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pasivo Circulante</span>
              <span className="text-sm">
                {formatCurrency(totals.currentLiabilities)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad</CardTitle>
            <CardDescription>Rendimiento sobre inversión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">ROE (Return on Equity)</span>
              <span className="text-sm font-bold">
                {metrics.returnOnEquity.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ingresos Totales</span>
              <span className="text-sm">{formatCurrency(totals.revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gastos Totales</span>
              <span className="text-sm">{formatCurrency(totals.expenses)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Salud Financiera */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Salud Financiera</CardTitle>
          <CardDescription>
            Evaluación basada en los indicadores clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Liquidez */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Liquidez</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    metrics.currentRatio >= 1.5
                      ? 100
                      : (metrics.currentRatio / 1.5) * 100
                  }
                  className="w-24 h-2"
                />
                <span
                  className={`text-sm font-bold ${
                    metrics.currentRatio >= 1.5
                      ? "text-green-600"
                      : metrics.currentRatio >= 1
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {metrics.currentRatio >= 1.5
                    ? "Excelente"
                    : metrics.currentRatio >= 1
                      ? "Buena"
                      : "Baja"}
                </span>
              </div>
            </div>

            {/* Endeudamiento */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Endeudamiento</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    metrics.debtToEquity <= 1
                      ? 100
                      : Math.max(0, 100 - (metrics.debtToEquity - 1) * 50)
                  }
                  className="w-24 h-2"
                />
                <span
                  className={`text-sm font-bold ${
                    metrics.debtToEquity <= 0.5
                      ? "text-green-600"
                      : metrics.debtToEquity <= 1
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {metrics.debtToEquity <= 0.5
                    ? "Bajo"
                    : metrics.debtToEquity <= 1
                      ? "Moderado"
                      : "Alto"}
                </span>
              </div>
            </div>

            {/* Rentabilidad */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rentabilidad</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    metrics.profitMargin >= 10
                      ? 100
                      : (metrics.profitMargin / 10) * 100
                  }
                  className="w-24 h-2"
                />
                <span
                  className={`text-sm font-bold ${
                    metrics.profitMargin >= 10
                      ? "text-green-600"
                      : metrics.profitMargin >= 5
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {metrics.profitMargin >= 10
                    ? "Alta"
                    : metrics.profitMargin >= 5
                      ? "Media"
                      : "Baja"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
