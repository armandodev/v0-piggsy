// app/dashboard/periodos/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserPeriods, getPeriodsClosingStatus } from "@/lib/services";
import { PeriodsList } from "@/components/periods/periods-list";
import { NewPeriodDialog } from "@/components/periods/new-period-dialog";
import { Calendar, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Períodos Contables | Piggsy",
  description: "Gestión de períodos contables",
};

export default async function PeriodsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  const periods = await getUserPeriods();
  const periodIds = periods.map((p) => p.id);
  const closingStatus = await getPeriodsClosingStatus(periodIds);

  // Combinar información de períodos con su estado de cierre
  const periodsWithStatus = periods.map((period) => ({
    ...period,
    isClosed: closingStatus[period.id] || false,
  }));

  return (
    <Layout user={user}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Períodos Contables</h1>
            <p className="text-muted-foreground">
              Administra tus períodos contables mensuales
            </p>
          </div>
          <NewPeriodDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Período
            </Button>
          </NewPeriodDialog>
        </div>

        {/* Períodos */}
        <Card>
          <CardHeader>
            <CardTitle>Períodos Registrados</CardTitle>
            <CardDescription>
              Haz clic en un período para ver sus reportes o realizar el cierre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PeriodsList periods={periodsWithStatus} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
