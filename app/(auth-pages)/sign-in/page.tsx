import { signInAction } from "@/utils/supabase/actions/auth";
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Metadata } from "next";
import { signinMetadata } from "@/utils/metadata";
import Label from "@/components/ui/label";
import Link from "next/link";
import Layout from "@/components/layout/layout";
import ToastHandler from "@/utils/toast";

export const metadata: Metadata = signinMetadata;

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Layout form>
      <ToastHandler message={searchParams} />
      <section className="w-[90%] max-w-sm mx-auto grid gap-2">
        <h1 className="grid text-center">
          <span className="text-2xl font-medium text-teal-900 dark:text-teal-100">
            Inicio de sesión
          </span>
          <span className="text-teal-500">Piggsy</span>
        </h1>
        <form className="grid gap-4">
          <Label label="Email" required>
            <Input name="email" placeholder="jhon.doe@example.com" required />
          </Label>
          <Label label="Contraseña" required>
            <Input
              type="password"
              name="password"
              placeholder="Tu contraseña"
              required
            />
          </Label>
          <SubmitButton
            pendingText="Iniciando sesión..."
            formAction={signInAction}
          >
            Iniciar sesión
          </SubmitButton>
        </form>
        <ul className="text-sm text-foreground text-center">
          <li>
            ¿Olvidaste tu contraseña?{" "}
            <Link
              className="text-foreground font-medium underline"
              href="/forgot-password"
            >
              Restablecer contraseña
            </Link>
          </li>
          <li>
            ¿No tienes una cuenta?{" "}
            <Link
              className="text-foreground font-medium underline"
              href="/sign-up"
            >
              Regístrate
            </Link>
          </li>
        </ul>
      </section>
    </Layout>
  );
}
