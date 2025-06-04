// components/periods/new-period-dialog.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPeriod } from '@/lib/services/period-service'

interface NewPeriodDialogProps {
  children: React.ReactNode
}

export function NewPeriodDialog({ children }: NewPeriodDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startsAt: '',
    endsAt: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.startsAt || !formData.endsAt) {
      alert('Complete todos los campos')
      return
    }

    if (formData.startsAt > formData.endsAt) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setLoading(true)

    try {
      await createPeriod(formData.name, formData.startsAt, formData.endsAt)
      setOpen(false)
      setFormData({ name: '', startsAt: '', endsAt: '' })
      router.refresh()
    } catch (error) {
      alert('Error al crear el período')
    } finally {
      setLoading(false)
    }
  }

  // Generar valores predeterminados para el próximo mes
  const getDefaultDates = () => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0)

    return {
      start: nextMonth.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
      name: nextMonth
        .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }
  }

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      const defaults = getDefaultDates()
      setFormData({
        name: defaults.name,
        startsAt: defaults.start,
        endsAt: defaults.end,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Período Contable</DialogTitle>
            <DialogDescription>
              Crea un nuevo período para registrar transacciones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Período</Label>
              <Input
                id="name"
                placeholder="Ej: Enero 2024"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Fecha de Inicio</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, startsAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Fecha de Fin</Label>
                <Input
                  id="endsAt"
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, endsAt: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Período'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
