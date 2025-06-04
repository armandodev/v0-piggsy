// lib/services/auth-service.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Obtiene el usuario actual autenticado
 * @throws Error si no hay usuario autenticado
 */
export async function getCurrentUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuario no autenticado");
  }

  return user;
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el perfil del usuario con datos adicionales
 */
export async function getUserProfile() {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Aquí podrías agregar consultas para obtener datos adicionales del perfil
    // Por ejemplo, desde una tabla 'profiles' si la tienes

    return {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      // Agregar más campos según necesites
    };
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return null;
  }
}
