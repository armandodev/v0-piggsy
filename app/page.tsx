import Layout from "@/components/layout/layout";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  return (
    <Layout>
      <h1>Piggsy</h1>
    </Layout>
  );
}
