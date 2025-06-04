// components/periods/periods-list.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate } from '@/lib/utils/date-utils'
import { Period } from '@/lib/services/period-service'
import { closePeriod, reopenPeriod } from '@/lib/services/closing-service'
import { Lock, Unlock, FileText, BarChart } from 'lucide-react'

interface PeriodWithStatus extends Period {
  isClosed: boolean
}

interface PeriodsListProps {
  periods: PeriodWithStatus[]
}

export function PeriodsList({ periods }: PeriodsListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodWithStatus | null>(
    null,
  )
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)

  const handleClosePeriod = async () => {
    if (!selectedPeriod) return

    setLoading(selectedPeriod.id)
    try {
      const result = await closePeriod(selectedPeriod.id)
      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('Error al cerrar el período')
    } finally {
      setLoading(null)
      setShowCloseDialog(false)
    }
  }

  const handleReopenPeriod = async () => {
    if (!selectedPeriod) return

    setLoading(selectedPeriod.id)
    try {
      const result = await reopenPeriod(selectedPeriod.id)
      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('Error al reabrir el período')
    } finally {
      setLoading(null)
      setShowReopenDialog(false)
    }
  }

  const handleViewReports = (periodId: string) => {
    // Navegar a reportes con el período específico
    router.push(`/dashboard/reportes?period=${periodId}`)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">{period.name}</TableCell>
              <TableCell>{formatDate(period.starts_at)}</TableCell>
              <TableCell>{formatDate(period.ends_at)}</TableCell>
              <TableCell>
                <Badge variant={period.isClosed ? 'secondary' : 'default'}>
                  {period.isClosed ? 'Cerrado' : 'Abierto'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewReports(period.id)}
                    title="Ver reportes"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>

                  {period.isClosed ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPeriod(period)
                        setShowReopenDialog(true)
                      }}
                      disabled={loading === period.id}
                      title="Reabrir período"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPeriod(period)
                        setShowCloseDialog(true)
                      }}
                      disabled={loading === period.id}
                      title="Cerrar período"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog para cerrar período */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar período contable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará el período "{selectedPeriod?.name}" y creará
              un asiento de cierre. Las cuentas de ingresos y gastos se saldarán
              contra la cuenta de utilidad o pérdida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClosePeriod}>
              Cerrar Período
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para reabrir período */}
      <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reabrir período contable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reabrirá el período "{selectedPeriod?.name}" y
              revertirá el asiento de cierre. Podrás volver a registrar
              transacciones en este período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopenPeriod}>
              Reabrir Período
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
