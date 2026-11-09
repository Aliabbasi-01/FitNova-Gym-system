
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return NextResponse.json(
        { error: "Valid name, email and password (8 characters minimum) are required." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: existingOwner, error: checkError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "owner")
      .limit(1);

    if (checkError) throw checkError;

    if (existingOwner && existingOwner.length > 0) {
      return NextResponse.json(
        { error: "Owner account already exists. Registration is closed." },
        { status: 403 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      throw new Error("Unable to create account.");
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        id: authData.user.id,
        role: "owner",
      });

    if (roleError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw roleError;
    }

    return NextResponse.json({
      success: true,
      message: "Owner account created successfully.",
    });
  } catch (error) {
    console.error("Owner registration error:", error);

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
