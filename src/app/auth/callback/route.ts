import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // After successful auth, ensure a customer record exists for this user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if customer record already linked to this auth user
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!existingCustomer) {
          // Try to find by email and link, or create new
          const email = user.email;
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            email?.split("@")[0] ||
            "Customer";

          if (email) {
            const { data: emailCustomer } = await supabase
              .from("customers")
              .select("id")
              .eq("email", email)
              .single();

            if (emailCustomer) {
              // Link existing customer to auth user
              await supabase
                .from("customers")
                .update({ auth_user_id: user.id, name: fullName })
                .eq("id", emailCustomer.id);
            } else {
              // Create new customer record
              await supabase.from("customers").insert({
                auth_user_id: user.id,
                name: fullName,
                email,
                phone: user.user_metadata?.phone || null,
                country: "MY",
                tags: [],
                metadata: {},
              });
            }
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
