import { forgotPasswordAction } from "@/lib/supabase/actions/auth";
import { Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import Link from "next/link";
import Layout from "@/components/layout/layout";
import { Form } from "@/components/layout";

export default async function ForgotPasswordPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Layout className="flex flex-col items-center justify-center" form>
      <Form
        title="Restablecer contraseña"
        searchParams={searchParams}
        formAction={forgotPasswordAction}
      >
        <Label label="Email" required>
          <Input name="email" placeholder="you@example.com" required />
        </Label>
      </Form>
      <ul className="text-center mt-4">
        <li>
          <Link
            className="text-teal-500 dark:text-white underline"
            href="/sign-in"
          >
            Volver al inicio de sesión
          </Link>
        </li>
      </ul>
    </Layout>
  );
}
