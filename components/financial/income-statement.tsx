import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format-utils";
import type { FinancialStatement } from "@/lib/services/dashboard-service";

export function IncomeStatement({ data }: { data: FinancialStatement }) {
  if (!data || !data.sections || data.sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Resultados</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const revenues = data.sections.find((s) => s.name.includes("INGRESO"));
  const costs = data.sections.find((s) => s.name.includes("COSTO"));
  const expenses = data.sections.find((s) => s.name.includes("GASTO"));

  const totalRevenues = revenues?.subtotal || 0;
  const totalCosts = costs?.subtotal || 0;
  const totalExpenses = expenses?.subtotal || 0;
  const grossProfit = totalRevenues - totalCosts;
  const operatingIncome = grossProfit - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Resultados</CardTitle>
        <CardDescription>{data.period_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {/* Ingresos */}
            {revenues && (
              <>
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell colSpan={2}>INGRESOS</TableCell>
                </TableRow>
                {revenues.accounts.map((account) => (
                  <TableRow key={account.code}>
                    <TableCell className="pl-8">{account.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(account.balance)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t font-medium">
                  <TableCell>Total Ingresos</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalRevenues)}
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Costos */}
            {costs && (
              <>
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell colSpan={2}>COSTO DE VENTAS</TableCell>
                </TableRow>
                {costs.accounts.map((account) => (
                  <TableRow key={account.code}>
                    <TableCell className="pl-8">{account.name}</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(account.balance)})
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t font-medium">
                  <TableCell>Total Costo de Ventas</TableCell>
                  <TableCell className="text-right">
                    ({formatCurrency(totalCosts)})
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Utilidad Bruta */}
            <TableRow className="border-t-2 font-bold bg-green-50 dark:bg-green-900/20">
              <TableCell>UTILIDAD BRUTA</TableCell>
              <TableCell className="text-right">
                {formatCurrency(grossProfit)}
              </TableCell>
            </TableRow>

            {/* Gastos */}
            {expenses && (
              <>
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell colSpan={2}>GASTOS DE OPERACIÓN</TableCell>
                </TableRow>
                {expenses.accounts.map((account) => (
                  <TableRow key={account.code}>
                    <TableCell className="pl-8">{account.name}</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(account.balance)})
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t font-medium">
                  <TableCell>Total Gastos de Operación</TableCell>
                  <TableCell className="text-right">
                    ({formatCurrency(totalExpenses)})
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Utilidad Neta */}
            <TableRow
              className={`border-t-2 font-bold text-lg ${operatingIncome >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
            >
              <TableCell>
                {operatingIncome >= 0 ? "UTILIDAD NETA" : "PÉRDIDA NETA"}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(Math.abs(operatingIncome))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Resumen de márgenes */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Margen Bruto</p>
            <p className="text-2xl font-bold">
              {totalRevenues > 0
                ? ((grossProfit / totalRevenues) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Margen Operativo</p>
            <p className="text-2xl font-bold">
              {totalRevenues > 0
                ? ((operatingIncome / totalRevenues) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Ratio Gastos/Ingresos
            </p>
            <p className="text-2xl font-bold">
              {totalRevenues > 0
                ? ((totalExpenses / totalRevenues) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
