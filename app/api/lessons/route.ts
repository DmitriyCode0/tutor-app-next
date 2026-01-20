import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { Lesson } from "@/lib/types/lesson";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    // Convert database format to app format
    const lessons: Lesson[] = data.map((row) => ({
      id: parseInt(row.id.toString().replace(/-/g, "").substring(0, 13), 16), // Convert UUID to number
      studentName: row.student_name,
      hourlyRate: parseFloat(row.hourly_rate),
      duration: parseFloat(row.duration),
      date: row.date,
      createdAt: row.created_at,
      userId: row.user_id,
    }));

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
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
    const { studentName, hourlyRate, duration, date } = body;

    if (!studentName || !hourlyRate || !duration || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        user_id: session.user.id,
        student_name: studentName,
        hourly_rate: hourlyRate,
        duration: duration,
        date: date,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const lesson: Lesson = {
      id: parseInt(data.id.toString().replace(/-/g, "").substring(0, 13), 16),
      studentName: data.student_name,
      hourlyRate: parseFloat(data.hourly_rate),
      duration: parseFloat(data.duration),
      date: data.date,
      createdAt: data.created_at,
      userId: data.user_id,
    };

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
