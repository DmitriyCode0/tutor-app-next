"use client";

import { CabinetForm } from "@/components/CabinetForm";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function CabinetPage() {
  return (
    <ProtectedPage>
      <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
        <div className="grid  ">
          <div className="md:col-span-1">
            <CabinetForm />
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
