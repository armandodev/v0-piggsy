// components/journal/quick-entry.tsx
'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createTransaction } from '@/lib/services/transaction-service'
import { useRouter } from 'next/navigation'
import {
  Receipt,
  CreditCard,
  Banknote,
  Package,
  DollarSign,
  Wallet,
} from 'lucide-react'

interface QuickTemplate {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  entries: Array<{
    accountCode: number
    debit: number
    credit: number
  }>
}

export function QuickEntry() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const templates: QuickTemplate[] = [
    {
      id: 'cash-sale',
      name: 'Venta de Contado',
      icon: <Banknote className="h-5 w-5" />,
      description: 'Registrar una venta al contado',
      entries: [
        { accountCode: 1101, debit: 1, credit: 0 }, // Caja
        { accountCode: 4101, debit: 0, credit: 1 }, // Ventas
      ],
    },
    {
      id: 'purchase',
      name: 'Compra a Crédito',
      icon: <Package className="h-5 w-5" />,
      description: 'Registrar compra a proveedores',
      entries: [
        { accountCode: 1105, debit: 1, credit: 0 }, // Inventarios
        { accountCode: 2101, debit: 0, credit: 1 }, // Proveedores
      ],
    },
    {
      id: 'expense',
      name: 'Gasto en Efectivo',
      icon: <Receipt className="h-5 w-5" />,
      description: 'Pago de gastos en efectivo',
      entries: [
        { accountCode: 520201, debit: 1, credit: 0 }, // Gastos Admin
        { accountCode: 1101, debit: 0, credit: 1 }, // Caja
      ],
    },
    {
      id: 'payment',
      name: 'Pago a Proveedores',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Pago de deudas a proveedores',
      entries: [
        { accountCode: 2101, debit: 1, credit: 0 }, // Proveedores
        { accountCode: 1102, debit: 0, credit: 1 }, // Bancos
      ],
    },
    {
      id: 'collection',
      name: 'Cobro a Clientes',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Cobro de cuentas por cobrar',
      entries: [
        { accountCode: 1102, debit: 1, credit: 0 }, // Bancos
        { accountCode: 1103, debit: 0, credit: 1 }, // Clientes
      ],
    },
    {
      id: 'salary',
      name: 'Pago de Sueldos',
      icon: <Wallet className="h-5 w-5" />,
      description: 'Pago de sueldos a empleados',
      entries: [
        { accountCode: 520201, debit: 1, credit: 0 }, // Sueldos Admin
        { accountCode: 1102, debit: 0, credit: 1 }, // Bancos
      ],
    },
  ]

  const handleQuickEntry = async (template: QuickTemplate) => {
    const amount = prompt(`Ingrese el monto para ${template.name}:`)

    if (!amount || isNaN(parseFloat(amount))) {
      return
    }

    const parsedAmount = parseFloat(amount)
    if (parsedAmount <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    const description = prompt('Descripción (opcional):') || template.name

    setLoading(template.id)

    try {
      const entries = template.entries.map((entry) => ({
        accountCode: entry.accountCode,
        debit: entry.debit * parsedAmount,
        credit: entry.credit * parsedAmount,
      }))

      const result = await createTransaction(
        description,
        new Date().toISOString().split('T')[0],
        entries,
        'DIARIO',
      )

      if (result.success) {
        router.refresh()
        // Mostrar notificación de éxito (opcional)
      } else {
        alert(result.error || 'Error al crear la transacción')
      }
    } catch (error) {
      alert('Error al crear la transacción')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrada Rápida</CardTitle>
        <CardDescription>
          Usa estas plantillas para registrar transacciones comunes rápidamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent"
              onClick={() => handleQuickEntry(template)}
              disabled={loading === template.id}
            >
              <div
                className={`p-2 rounded-full ${
                  loading === template.id ? 'bg-gray-100' : 'bg-primary/10'
                }`}
              >
                {template.icon}
              </div>
              <span className="font-medium text-xs text-center">
                {template.name}
              </span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2">
                {template.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
