// lib/services/period-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth-service";

export interface Period {
  id: string;
  user_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene el período actual o crea uno nuevo si no existe
 */
export async function getCurrentPeriod(): Promise<Period> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Buscar período actual
  let { data: period, error } = await supabase
    .from("periods")
    .select("*")
    .eq("user_id", user.id)
    .gte("starts_at", startOfMonth.toISOString())
    .lte("ends_at", endOfMonth.toISOString())
    .single();

  // Si no existe, crear uno nuevo
  if (!period) {
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const periodName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const { data: newPeriod, error: createError } = await supabase
      .from("periods")
      .insert({
        user_id: user.id,
        name: periodName,
        starts_at: startOfMonth.toISOString().split("T")[0],
        ends_at: endOfMonth.toISOString().split("T")[0],
      })
      .select()
      .single();

    if (createError) throw createError;
    period = newPeriod;
  }

  return period;
}

/**
 * Obtiene todos los períodos del usuario
 */
export async function getUserPeriods(): Promise<Period[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("user_id", user.id)
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene un período específico por ID
 */
export async function getPeriodById(periodId: string): Promise<Period | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("id", periodId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error obteniendo período:", error);
    return null;
  }

  return data;
}

/**
 * Crea un nuevo período
 */
export async function createPeriod(
  name: string,
  startsAt: string,
  endsAt: string
): Promise<Period> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("periods")
    .insert({
      user_id: user.id,
      name,
      starts_at: startsAt,
      ends_at: endsAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene los últimos N períodos
 */
export async function getRecentPeriods(limit: number = 6): Promise<Period[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("user_id", user.id)
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
