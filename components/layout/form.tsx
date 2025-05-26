import Link from "next/link";
import { FormMessage, Message } from "../form-message";
import { SubmitButton } from "../submit-button";

interface FormProps {
  children: React.ReactNode;
  title: string;
  searchParams: Message;
  formAction: (formData: FormData) => Promise<void>;
}

export default function Form({
  children,
  title,
  searchParams,
  formAction,
}: FormProps) {
  return (
    <section className="w-[90%] max-w-sm mx-auto grid gap-2">
      <h1 className="text-2xl font-medium text-teal-900 dark:text-white">
        {title}
      </h1>
      <form className="grid gap-4">
        <FormMessage message={searchParams} />
        {children}
        <SubmitButton formAction={formAction}>{title}</SubmitButton>
      </form>
    </section>
  );
}
