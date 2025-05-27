import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "dd/MM/yyyy", { locale: es });
}

export function formatDateForInput(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "yyyy-MM-dd");
}

export function getCurrentMonth(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { startDate, endDate };
}
