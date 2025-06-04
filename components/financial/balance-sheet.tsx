import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format-utils";
import type { FinancialStatement } from "@/lib/services/dashboard-service";

interface BalanceSheetProps {
  data: FinancialStatement;
}

export function BalanceSheet({ data }: BalanceSheetProps) {
  if (!data || !data.sections || data.sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance General</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Separar activos y pasivos+capital
  const assets = data.sections.filter((s) => s.name.includes("ACTIVO"));
  const liabilitiesEquity = data.sections.filter(
    (s) => !s.name.includes("ACTIVO")
  );

  const totalAssets = assets.reduce(
    (sum, section) => sum + section.subtotal,
    0
  );
  const totalLiabilitiesEquity = liabilitiesEquity.reduce(
    (sum, section) => sum + section.subtotal,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance General</CardTitle>
        <CardDescription>{data.period_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Columna de Activos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ACTIVOS</h3>
            <Table>
              <TableBody>
                {assets.map((section) => (
                  <>
                    <TableRow
                      key={section.code}
                      className="font-semibold bg-muted/50"
                    >
                      <TableCell colSpan={2}>{section.name}</TableCell>
                    </TableRow>
                    {section.accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className={`pl-${account.level * 4}`}>
                          {account.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t">
                      <TableCell className="font-medium">
                        Total {section.name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(section.subtotal)}
                      </TableCell>
                    </TableRow>
                  </>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>TOTAL ACTIVOS</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalAssets)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Columna de Pasivos y Capital */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PASIVOS Y CAPITAL</h3>
            <Table>
              <TableBody>
                {liabilitiesEquity.map((section) => (
                  <>
                    <TableRow
                      key={section.code}
                      className="font-semibold bg-muted/50"
                    >
                      <TableCell colSpan={2}>{section.name}</TableCell>
                    </TableRow>
                    {section.accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className={`pl-${account.level * 4}`}>
                          {account.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t">
                      <TableCell className="font-medium">
                        Total {section.name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(section.subtotal)}
                      </TableCell>
                    </TableRow>
                  </>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>TOTAL PASIVOS Y CAPITAL</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalLiabilitiesEquity)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Verificación de balance */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Diferencia (debe ser 0):</span>
            <span
              className={`font-bold ${Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(totalAssets - totalLiabilitiesEquity)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
