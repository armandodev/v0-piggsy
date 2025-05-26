import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, FileText } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Piggsy: Sistema de Contabilidad
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Lleva el control de tus movimientos contables y genera reportes
                financieros de manera sencilla y eficiente.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button className="bg-teal-500 hover:bg-teal-700 dark:bg-white dark:hover:bg-gray-200">
                  Comenzar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">Conocer más</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <BookOpen className="h-6 w-6 mb-2" />
                <CardTitle>Diario Contable</CardTitle>
                <CardDescription>
                  Registra todos los movimientos contables de tu empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Lleva un registro detallado de todas las transacciones
                  financieras organizadas por fecha.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/journal">
                  <Button variant="outline" size="sm">
                    Ver más
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-6 w-6 mb-2" />
                <CardTitle>Estados Financieros</CardTitle>
                <CardDescription>
                  Genera estados de resultados y balances generales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Obtén reportes financieros detallados para analizar la
                  situación económica de tu empresa.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/reportes">
                  <Button variant="outline" size="sm">
                    Ver más
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-6 w-6 mb-2" />
                <CardTitle>Cuentas T</CardTitle>
                <CardDescription>
                  Visualiza todas las cuentas contables de tu empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Analiza el comportamiento de cada cuenta contable con
                  visualizaciones claras y detalladas.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/cuentas">
                  <Button variant="outline" size="sm">
                    Ver más
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
