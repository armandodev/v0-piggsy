import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

const accounts = [
  {
    id: "1",
    code: "1000",
    name: "Caja",
    type: "Activo",
    balance: 5000.0,
  },
  {
    id: "2",
    code: "1100",
    name: "Bancos",
    type: "Activo",
    balance: 25000.0,
  },
  {
    id: "3",
    code: "1200",
    name: "Cuentas por Cobrar",
    type: "Activo",
    balance: 15000.0,
  },
  {
    id: "4",
    code: "2000",
    name: "Cuentas por Pagar",
    type: "Pasivo",
    balance: 8000.0,
  },
  {
    id: "5",
    code: "3000",
    name: "Capital",
    type: "Capital",
    balance: 37000.0,
  },
];

export function AccountSummary() {
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
            <TableCell>{account.code}</TableCell>
            <TableCell>{account.name}</TableCell>
            <TableCell>{account.type}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(account.balance)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
