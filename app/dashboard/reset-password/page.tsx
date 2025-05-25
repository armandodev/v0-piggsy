import { resetPasswordAction } from "@/utils/supabase/actions/auth";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import Layout from "@/components/layout/layout";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Layout form>
      <section className="w-[90%] max-w-sm mx-auto grid gap-2">
        <h1 className="grid text-center">
          <span className="text-2xl font-medium text-teal-900 dark:text-teal-100">
            Restablecer contraseña
          </span>
          <span className="text-teal-500">Piggsy</span>
        </h1>
        <form className="grid gap-4">
          <Label label="Nueva contraseña" required>
            <Input
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              required
            />
          </Label>
          <Label label="Confirmar contraseña" required>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              required
            />
          </Label>
          <SubmitButton formAction={resetPasswordAction}>
            Restablecer contraseña
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </section>
    </Layout>
  );
}
