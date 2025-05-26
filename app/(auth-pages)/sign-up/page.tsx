import { signUpAction } from "@/utils/supabase/actions/auth";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import Link from "next/link";
import { Form, Layout } from "@/components/layout";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Layout className="flex flex-col items-center justify-center" form>
      <Form
        title="Regístrate"
        searchParams={searchParams}
        formAction={signUpAction}
      >
        <Label label="Email" required>
          <Input name="email" placeholder="you@example.com" required />
        </Label>
        <Label label="Contraseña" required>
          <Input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            minLength={6}
            required
          />
        </Label>
      </Form>
      <ul className="text-center mt-4">
        <li>
          ¿Ya tienes una cuenta?{" "}
          <Link
            className="text-teal-500 dark:text-white dark:font-medium underline"
            href="/sign-in"
          >
            Inicia sesión
          </Link>
        </li>
      </ul>
    </Layout>
  );
}
