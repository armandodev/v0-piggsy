import React from "react";
import { TransactionDetail } from "@/lib/services";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-utils";

interface TAccountsProps {
  accountCode: number;
  accountName: string;
  transactions: TransactionDetail[];
}

export function TAccounts({
  accountCode,
  accountName,
  transactions,
}: TAccountsProps) {
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  const finalBalance =
    transactions[transactions.length - 1]?.running_balance || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {accountCode} - {accountName}
        </CardTitle>
        <CardDescription>Movimientos de la cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Lado del Debe */}
          <div>
            <h4 className="font-semibold text-center mb-2 pb-2 border-b">
              DEBE
            </h4>
            <div className="space-y-1">
              {transactions
                .filter((t) => t.debit > 0)
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="truncate">{t.description}</span>
                    <span className="font-mono">{formatCurrency(t.debit)}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-2 border-t font-semibold flex justify-between">
              <span>Total Debe:</span>
              <span>{formatCurrency(totalDebit)}</span>
            </div>
          </div>

          {/* Lado del Haber */}
          <div>
            <h4 className="font-semibold text-center mb-2 pb-2 border-b">
              HABER
            </h4>
            <div className="space-y-1">
              {transactions
                .filter((t) => t.credit > 0)
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="truncate">{t.description}</span>
                    <span className="font-mono">
                      {formatCurrency(t.credit)}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-2 border-t font-semibold flex justify-between">
              <span>Total Haber:</span>
              <span>{formatCurrency(totalCredit)}</span>
            </div>
          </div>
        </div>

        {/* Saldo Final */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Saldo Final:</span>
            <span
              className={`text-xl font-bold ${finalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(Math.abs(finalBalance))}{" "}
              {finalBalance < 0 ? "(Acreedor)" : "(Deudor)"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
