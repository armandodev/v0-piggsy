// components/journal/transaction-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createTransaction } from "@/lib/services/transaction-service";
import { CatalogAccount } from "@/lib/services/account-service";
import { formatCurrency } from "@/lib/utils/format-utils";

interface TransactionFormProps {
  accounts: CatalogAccount[];
}

interface TransactionLine {
  id: string;
  accountCode: number;
  debit: number;
  credit: number;
}

export function TransactionForm({ accounts }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [lines, setLines] = useState<TransactionLine[]>([
    { id: "1", accountCode: 0, debit: 0, credit: 0 },
    { id: "2", accountCode: 0, debit: 0, credit: 0 },
  ]);

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountCode: 0,
        debit: 0,
        credit: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((line) => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof TransactionLine, value: any) => {
    setLines(
      lines.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]:
                field === "accountCode"
                  ? parseInt(value)
                  : parseFloat(value) || 0,
            }
          : line
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBalanced) {
      alert("La transacción debe estar balanceada");
      return;
    }

    if (!description || lines.some((l) => !l.accountCode)) {
      alert("Complete todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const result = await createTransaction(
        description,
        date,
        lines.map((l) => ({
          accountCode: l.accountCode,
          debit: l.debit || 0,
          credit: l.credit || 0,
        })),
        "DIARIO",
        referenceNumber || undefined
      );

      if (result.success) {
        router.push("/dashboard/journal");
        router.refresh();
      } else {
        alert(result.error || "Error al crear la transacción");
      }
    } catch (error) {
      alert("Error al crear la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Transacción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label label="Fecha" required>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                placeholder="Ej: FAC-001"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la transacción..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Líneas de la Transacción */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Detalle de la Transacción</CardTitle>
              <CardDescription>
                La suma de débitos debe ser igual a la suma de créditos
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar línea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 text-sm font-medium">
              <div className="col-span-5">Cuenta</div>
              <div className="col-span-3 text-right">Débito</div>
              <div className="col-span-3 text-right">Crédito</div>
              <div className="col-span-1"></div>
            </div>

            {/* Lines */}
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select
                    value={line.accountCode.toString()}
                    onValueChange={(value) =>
                      updateLine(line.id, "accountCode", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cuenta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.code}
                          value={account.code.toString()}
                        >
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.debit || ""}
                    onChange={(e) =>
                      updateLine(line.id, "debit", e.target.value)
                    }
                    className="text-right"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.credit || ""}
                    onChange={(e) =>
                      updateLine(line.id, "credit", e.target.value)
                    }
                    className="text-right"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-12 gap-2 font-medium">
                <div className="col-span-5 text-right">Totales:</div>
                <div className="col-span-3 text-right">
                  {formatCurrency(totalDebit)}
                </div>
                <div className="col-span-3 text-right">
                  {formatCurrency(totalCredit)}
                </div>
                <div className="col-span-1"></div>
              </div>
              {!isBalanced && (
                <div className="mt-2 text-sm text-red-500 text-center">
                  Diferencia: {formatCurrency(difference)} - La transacción debe
                  estar balanceada
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !isBalanced}>
          {loading ? "Guardando..." : "Guardar Transacción"}
        </Button>
      </div>
    </form>
  );
}
