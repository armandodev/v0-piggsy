// components/accounts/t-account-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/format-utils";
import { formatDate } from "@/lib/utils/date-utils";
import { AccountBalance } from "@/lib/services/account-service";
import { TAccountEntry } from "@/lib/services/reports-service";

interface TAccountModalProps {
  account: AccountBalance;
  movements: TAccountEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TAccountModal({
  account,
  movements,
  open,
  onOpenChange,
}: TAccountModalProps) {
  const totalDebit = movements.reduce((sum, m) => sum + m.debit, 0);
  const totalCredit = movements.reduce((sum, m) => sum + m.credit, 0);
  const finalBalance = movements[movements.length - 1]?.running_balance || 0;
  const isDeudor = finalBalance >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account.code} - {account.name}
          </DialogTitle>
          <DialogDescription>
            Cuenta tipo {account.account_type} - Movimientos del período
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* T Account Structure */}
          <div className="border-2 border-black rounded-lg overflow-hidden">
            {/* Account Header */}
            <div className="bg-gray-100 p-2 text-center font-bold border-b-2 border-black">
              {account.code} - {account.name}
            </div>

            {/* T Account Body */}
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              {/* Debe (Left side) */}
              <div>
                <div className="bg-gray-50 p-2 text-center font-semibold border-b border-gray-300">
                  DEBE
                </div>
                <div className="p-2 space-y-1 min-h-[200px]">
                  {movements
                    .filter((m) => m.debit > 0)
                    .map((movement, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm py-1 border-b border-gray-100"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            {formatDate(movement.date)}
                          </div>
                          <div className="truncate pr-2">
                            {movement.description}
                          </div>
                        </div>
                        <div className="font-mono text-right">
                          {formatCurrency(movement.debit)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-2 border-t-2 border-black font-semibold flex justify-between bg-gray-50">
                  <span>Total Debe</span>
                  <span className="font-mono">
                    {formatCurrency(totalDebit)}
                  </span>
                </div>
              </div>

              {/* Haber (Right side) */}
              <div>
                <div className="bg-gray-50 p-2 text-center font-semibold border-b border-gray-300">
                  HABER
                </div>
                <div className="p-2 space-y-1 min-h-[200px]">
                  {movements
                    .filter((m) => m.credit > 0)
                    .map((movement, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm py-1 border-b border-gray-100"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            {formatDate(movement.date)}
                          </div>
                          <div className="truncate pr-2">
                            {movement.description}
                          </div>
                        </div>
                        <div className="font-mono text-right">
                          {formatCurrency(movement.credit)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-2 border-t-2 border-black font-semibold flex justify-between bg-gray-50">
                  <span>Total Haber</span>
                  <span className="font-mono">
                    {formatCurrency(totalCredit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-gray-200 p-3 border-t-2 border-black">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Saldo Final:</span>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${isDeudor ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(Math.abs(finalBalance))}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {isDeudor ? "(Saldo Deudor)" : "(Saldo Acreedor)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Movement Details Table */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Detalle de Movimientos</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Ref.</th>
                    <th className="text-right p-2">Debe</th>
                    <th className="text-right p-2">Haber</th>
                    <th className="text-right p-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{formatDate(movement.date)}</td>
                      <td className="p-2">{movement.description}</td>
                      <td className="p-2">
                        {movement.reference_number || "-"}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {movement.debit > 0
                          ? formatCurrency(movement.debit)
                          : "-"}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {movement.credit > 0
                          ? formatCurrency(movement.credit)
                          : "-"}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(Math.abs(movement.running_balance))}
                        <span className="text-xs ml-1">
                          {movement.running_balance >= 0 ? "(D)" : "(A)"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
