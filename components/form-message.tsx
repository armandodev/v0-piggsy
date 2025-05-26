export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <p className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <span className="text-teal-500 dark:text-white border-l-2 border-teal-500 dark:border-white px-4">
          {message.success}
        </span>
      )}
      {"message" in message && (
        <span className="text-black dark:text-white border-l-2 border-current px-4">
          {message.message}
        </span>
      )}
      {"error" in message && (
        <span className="text-red-500 border-l-2 border-red-500 px-4">
          {message.error == "Invalid login credentials" ? (
            <p>El correo electrónico o la contraseña son incorrectos.</p>
          ) : (
            message.error
          )}
        </span>
      )}
    </p>
  );
}
