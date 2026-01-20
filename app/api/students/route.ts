import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { Student } from "@/lib/types/student";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const students: Student[] = data.map((row) => ({
      id: parseInt(row.id.toString().replace(/-/g, "").substring(0, 13), 16),
      name: row.name,
      hourlyRate: parseFloat(row.hourly_rate),
      email: row.email || undefined,
      phone: row.phone || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, hourlyRate, email, phone, notes } = body;

    if (!name || !hourlyRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("students")
      .insert({
        user_id: session.user.id,
        name: name,
        hourly_rate: hourlyRate,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: `Student with name "${name}" already exists` },
          { status: 400 }
        );
      }
      throw error;
    }

    const student: Student = {
      id: parseInt(data.id.toString().replace(/-/g, "").substring(0, 13), 16),
      name: data.name,
      hourlyRate: parseFloat(data.hourly_rate),
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
    };

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
