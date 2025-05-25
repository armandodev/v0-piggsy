import { User } from "@supabase/supabase-js";
import Header from "./header";

export default function Layout({
  children,
  user = undefined,
  form = false,
}: Readonly<{
  children: React.ReactNode;
  user?: User;
  form?: boolean;
}>) {
  return (
    <>
      <Header user={user} form={form} />
      <main className="grid place-items-center w-full min-h-screen">
        {children}
      </main>
    </>
  );
}
