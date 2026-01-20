import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { Student } from "@/lib/types/student";

function uuidFromNumber(id: number): string {
  const hex = id.toString(16).padStart(32, "0");
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.hourlyRate !== undefined) updates.hourly_rate = body.hourlyRate;
    if (body.email !== undefined) updates.email = body.email || null;
    if (body.phone !== undefined) updates.phone = body.phone || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    const supabase = await createClient();
    const studentId = uuidFromNumber(parseInt(id));

    // Verify ownership
    const { data: existing } = await supabase
      .from("students")
      .select("user_id")
      .eq("id", studentId)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", studentId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Student with name "${body.name}" already exists` },
          { status: 400 }
        );
      }
      throw error;
    }

    const student: Student = {
      id: parseInt(id),
      name: data.name,
      hourlyRate: parseFloat(data.hourly_rate),
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
    };

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = uuidFromNumber(parseInt(id));

    const supabase = await createClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("students")
      .select("user_id")
      .eq("id", studentId)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId)
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
