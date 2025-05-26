import { signInAction } from "@/lib/supabase/actions/auth";
import { Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Metadata } from "next";
import { signinMetadata } from "@/lib/metadata";
import Label from "@/components/ui/label";
import Link from "next/link";
import Layout from "@/components/layout/layout";
import { Form } from "@/components/layout";

export const metadata: Metadata = signinMetadata;

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Layout className="flex flex-col items-center justify-center" form>
      <Form
        title="Inicio de sesión"
        searchParams={searchParams}
        formAction={signInAction}
      >
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
      </Form>
      <ul className="text-center mt-4">
        <li>
          ¿Olvidaste tu contraseña?{" "}
          <Link
            className="text-teal-500 dark:text-white dark:font-medium underline"
            href="/forgot-password"
          >
            Restablecer contraseña
          </Link>
        </li>
        <li>
          ¿No tienes una cuenta?{" "}
          <Link
            className="text-teal-500 dark:text-white dark:font-medium underline"
            href="/sign-up"
          >
            Regístrate
          </Link>
        </li>
      </ul>
    </Layout>
  );
}
