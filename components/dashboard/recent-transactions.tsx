import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const transactions = [
  {
    id: "1",
    date: "2023-05-15",
    description: "Venta de productos",
    amount: 1250.0,
    type: "ingreso",
  },
  {
    id: "2",
    date: "2023-05-14",
    description: "Pago de servicios",
    amount: 450.75,
    type: "gasto",
  },
  {
    id: "3",
    date: "2023-05-13",
    description: "Compra de inventario",
    amount: 2500.0,
    type: "gasto",
  },
  {
    id: "4",
    date: "2023-05-12",
    description: "Pago de cliente",
    amount: 3200.5,
    type: "ingreso",
  },
  {
    id: "5",
    date: "2023-05-11",
    description: "Pago de nómina",
    amount: 5000.0,
    type: "gasto",
  },
];

export function RecentTransactions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Tipo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{formatDate(transaction.date)}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.type === "ingreso" ? "default" : "destructive"
                }
              >
                {transaction.type === "ingreso" ? "Ingreso" : "Gasto"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
