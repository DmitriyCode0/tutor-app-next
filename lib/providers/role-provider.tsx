"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "tutor" | "business";

interface RoleTerminology {
  student: string;
  students: string;
  Student: string;
  Students: string;
  lesson: string;
  lessons: string;
  Lesson: string;
  Lessons: string;
}

const roleTerminology: Record<RoleType, RoleTerminology> = {
  tutor: {
    student: "student",
    students: "students",
    Student: "Student",
    Students: "Students",
    lesson: "lesson",
    lessons: "lessons",
    Lesson: "Lesson",
    Lessons: "Lessons",
  },
  business: {
    student: "client",
    students: "clients",
    Student: "Client",
    Students: "Clients",
    lesson: "service",
    lessons: "services",
    Lesson: "Service",
    Lessons: "Services",
  },
};

interface RoleContextType {
  role: RoleType;
  setRole: (role: RoleType) => void;
  t: RoleTerminology;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("tutor");

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("user_role") as RoleType;
    if (savedRole === "tutor" || savedRole === "business") {
      setRoleState(savedRole);
    }
  }, []);

  // Save role to localStorage whenever it changes
  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    localStorage.setItem("user_role", newRole);
  };

  const value = {
    role,
    setRole,
    t: roleTerminology[role],
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
