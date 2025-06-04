// components/journal/transactions-list.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-utils'
import { formatDate } from '@/lib/utils/date-utils'
import { Transaction } from '@/lib/services/transaction-service'

interface TransactionsListProps {
  transactions: Transaction[]
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay transacciones registradas
      </div>
    )
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {transaction.description}
              </TableCell>
              <TableCell>{transaction.reference_number || '-'}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.transaction_type === 'DIARIO'
                      ? 'default'
                      : transaction.transaction_type === 'AJUSTE'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {transaction.transaction_type}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(transaction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Transacción</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Fecha:</span>{' '}
                  {formatDate(selectedTransaction.date)}
                </div>
                <div>
                  <span className="font-medium">Referencia:</span>{' '}
                  {selectedTransaction.reference_number || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span>{' '}
                  {selectedTransaction.transaction_type}
                </div>
                <div>
                  <span className="font-medium">Monto:</span>{' '}
                  {formatCurrency(selectedTransaction.amount)}
                </div>
              </div>

              {selectedTransaction.details && (
                <div>
                  <h4 className="font-medium mb-2">Movimientos:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuenta</TableHead>
                        <TableHead className="text-right">Débito</TableHead>
                        <TableHead className="text-right">Crédito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.details.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {detail.account_code} - {detail.account_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.debit > 0
                              ? formatCurrency(detail.debit)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.credit > 0
                              ? formatCurrency(detail.credit)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
