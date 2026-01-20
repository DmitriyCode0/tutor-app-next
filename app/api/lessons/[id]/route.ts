import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { Lesson } from "@/lib/types/lesson";

function uuidFromNumber(id: number): string {
  // Convert number back to UUID-like string
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
    const updates: any = {};

    if (body.studentName !== undefined) updates.student_name = body.studentName;
    if (body.hourlyRate !== undefined) updates.hourly_rate = body.hourlyRate;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.date !== undefined) updates.date = body.date;

    const supabase = await createClient();
    const lessonId = uuidFromNumber(parseInt(id));

    // Verify ownership
    const { data: existing } = await supabase
      .from("lessons")
      .select("user_id")
      .eq("id", lessonId)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", lessonId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const lesson: Lesson = {
      id: parseInt(id),
      studentName: data.student_name,
      hourlyRate: parseFloat(data.hourly_rate),
      duration: parseFloat(data.duration),
      date: data.date,
      createdAt: data.created_at,
      userId: data.user_id,
    };

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
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
    const lessonId = uuidFromNumber(parseInt(id));

    const supabase = await createClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("lessons")
      .select("user_id")
      .eq("id", lessonId)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId)
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
