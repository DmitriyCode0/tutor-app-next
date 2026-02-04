import type { SupabaseClient } from "@supabase/supabase-js";
import { Lesson } from "@/lib/types/lesson";

interface LessonRow {
  id: number;
  user_id: string;
  student_name: string;
  hourly_rate: number;
  duration: number;
  date: string;
  created_at: string;
  updated_at: string;
}

function mapRowToLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    studentName: row.student_name,
    hourlyRate: row.hourly_rate,
    duration: row.duration,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function buildInsertPayload(
  lesson: Omit<Lesson, "id"> & { userId: string },
): Omit<LessonRow, "id"> {
  return {
    user_id: lesson.userId,
    student_name: lesson.studentName,
    hourly_rate: lesson.hourlyRate,
    duration: lesson.duration,
    date: lesson.date,
    created_at: lesson.createdAt,
    updated_at: lesson.updatedAt ?? lesson.createdAt,
  };
}

function buildUpdatePayload(
  updates: Partial<Omit<Lesson, "id"> & { userId: string }>,
): Partial<LessonRow> {
  const payload: Partial<LessonRow> = {};

  if (updates.userId) payload.user_id = updates.userId;
  if (updates.studentName !== undefined)
    payload.student_name = updates.studentName;
  if (updates.hourlyRate !== undefined)
    payload.hourly_rate = updates.hourlyRate;
  if (updates.duration !== undefined) payload.duration = updates.duration;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.createdAt !== undefined) payload.created_at = updates.createdAt;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;

  return payload;
}

export async function fetchLessons(
  supabase: SupabaseClient,
  userId: string,
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToLesson);
}

export async function createLesson(
  supabase: SupabaseClient,
  userId: string,
  lesson: Omit<Lesson, "id">,
): Promise<Lesson> {
  const payload = buildInsertPayload({ ...lesson, userId });

  const { data, error } = await supabase
    .from("lessons")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToLesson(data as LessonRow);
}

export async function updateLesson(
  supabase: SupabaseClient,
  userId: string,
  id: number,
  updates: Partial<Omit<Lesson, "id">>,
): Promise<Lesson> {
  const payload = buildUpdatePayload({
    ...updates,
    userId,
    updatedAt: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from("lessons")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToLesson(data as LessonRow);
}

export async function removeLesson(
  supabase: SupabaseClient,
  userId: string,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
