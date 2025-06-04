// components/accounts/accounts-list.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format-utils";
import { AccountBalance } from "@/lib/services/account-service";
import { TAccountEntry } from "@/lib/services/reports-service";
import { TAccountModal } from "./t-account-modal.tsx";
import { Eye } from "lucide-react";

interface AccountsListProps {
  accounts: AccountBalance[];
  tAccountsData: { [key: number]: TAccountEntry[] };
}

export function AccountsList({ accounts, tAccountsData }: AccountsListProps) {
  const [selectedAccount, setSelectedAccount] = useState<{
    account: AccountBalance;
    movements: TAccountEntry[];
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewAccount = (account: AccountBalance) => {
    const movements = tAccountsData[account.code] || [];
    setSelectedAccount({ account, movements });
    setShowModal(true);
  };

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      ACTIVO: "default",
      PASIVO: "secondary",
      CAPITAL: "outline",
      INGRESO: "default",
      GASTO: "destructive",
      COSTO: "destructive",
    };

    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Débitos</TableHead>
            <TableHead className="text-right">Créditos</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const isDeudor = account.balance >= 0;
            return (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  {getAccountTypeBadge(account.account_type)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(account.total_debit)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(account.total_credit)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={isDeudor ? "text-green-600" : "text-red-600"}
                  >
                    {formatCurrency(Math.abs(account.balance))}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {isDeudor ? "(D)" : "(A)"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAccount(account)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedAccount && (
        <TAccountModal
          account={selectedAccount.account}
          movements={selectedAccount.movements}
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  );
}
