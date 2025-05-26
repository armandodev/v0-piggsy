"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Enviando...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="bg-teal-500 hover:bg-teal-700 dark:bg-white dark:hover:bg-gray-200"
      type="submit"
      aria-disabled={pending}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
