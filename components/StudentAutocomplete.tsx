"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Student } from "@/lib/types/student";
import { useStudents } from "@/lib/hooks/useStudents";

interface StudentAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (student: Student) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function StudentAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter student name",
  className,
  disabled,
}: StudentAutocompleteProps) {
  const { students } = useStudents();
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter students based on input value
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedValue = value.toLowerCase().trim();
    
    // Check if value exactly matches a student name (case-insensitive)
    const exactMatch = students.find(
      (student) => student.name.toLowerCase().trim() === normalizedValue
    );
    
    // If exact match exists, don't show suggestions
    if (exactMatch) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Otherwise, show filtered suggestions
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(normalizedValue)
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, students]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelect = (student: Student) => {
    onChange(student.name);
    onSelect(student);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && value.trim()) {
        // Try to find exact match
        const exactMatch = students.find(
          (s) => s.name.toLowerCase() === value.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSelect(exactMatch);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((student, index) => (
            <div
              key={student.id}
              className={`px-4 py-2 cursor-pointer hover:bg-accent transition-colors ${
                index === selectedIndex ? "bg-accent" : ""
              }`}
              onClick={() => handleSelect(student)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{student.name}</div>
              <div className="text-sm text-muted-foreground">
                ₴{student.hourlyRate}/hr
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
