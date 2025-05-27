import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format-utils";
import type { AccountBalance } from "@/lib/services/dashboard-service";

interface AccountSummaryProps {
  accounts: AccountBalance[];
}

export function AccountSummary({ accounts }: AccountSummaryProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <p>No hay cuentas con saldo disponibles</p>
      </div>
    );
  }

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "asset":
        return <Badge variant="default">Activo</Badge>;
      case "liability":
        return <Badge variant="secondary">Pasivo</Badge>;
      case "equity":
        return <Badge variant="outline">Capital</Badge>;
      case "revenue":
        return <Badge className="bg-green-500">Ingreso</Badge>;
      case "expense":
        return <Badge className="bg-red-500">Gasto</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell className="font-medium">{account.code}</TableCell>
            <TableCell>{account.name}</TableCell>
            <TableCell>{getAccountTypeBadge(account.account_type)}</TableCell>
            <TableCell className="text-right">
              <span className={account.balance < 0 ? "text-red-500" : ""}>
                {formatCurrency(Math.abs(account.balance))}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
