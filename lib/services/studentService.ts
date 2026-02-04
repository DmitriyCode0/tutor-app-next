import type { SupabaseClient } from "@supabase/supabase-js";
import { Student } from "@/lib/types/student";

interface StudentRow {
  id: number;
  user_id: string;
  name: string;
  hourly_rate: number;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    hourlyRate: row.hourly_rate,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function buildInsertPayload(
  student: Omit<Student, "id"> & { userId: string },
): Omit<StudentRow, "id"> {
  return {
    user_id: student.userId,
    name: student.name,
    hourly_rate: student.hourlyRate,
    email: student.email ?? null,
    phone: student.phone ?? null,
    notes: student.notes ?? null,
    created_at: student.createdAt,
    updated_at: student.updatedAt,
  };
}

function buildUpdatePayload(
  updates: Partial<Omit<Student, "id"> & { userId: string }>,
): Partial<StudentRow> {
  const payload: Partial<StudentRow> = {};

  if (updates.userId) payload.user_id = updates.userId;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.hourlyRate !== undefined)
    payload.hourly_rate = updates.hourlyRate;
  if (updates.email !== undefined) payload.email = updates.email ?? null;
  if (updates.phone !== undefined) payload.phone = updates.phone ?? null;
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null;
  if (updates.createdAt !== undefined) payload.created_at = updates.createdAt;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;

  return payload;
}

export async function fetchStudents(
  supabase: SupabaseClient,
  userId: string,
): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToStudent);
}

export async function createStudent(
  supabase: SupabaseClient,
  userId: string,
  student: Omit<Student, "id">,
): Promise<Student> {
  const payload = buildInsertPayload({ ...student, userId });

  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToStudent(data as StudentRow);
}

export async function updateStudent(
  supabase: SupabaseClient,
  userId: string,
  id: number,
  updates: Partial<Omit<Student, "id">>,
): Promise<Student> {
  const payload = buildUpdatePayload({
    ...updates,
    userId,
    updatedAt: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapRowToStudent(data as StudentRow);
}

export async function removeStudent(
  supabase: SupabaseClient,
  userId: string,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
