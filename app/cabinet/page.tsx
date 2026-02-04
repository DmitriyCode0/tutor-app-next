"use client";

import { CabinetForm } from "@/components/CabinetForm";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function CabinetPage() {
  return (
    <ProtectedPage>
      <main className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <CabinetForm />
          </div>
          <div className="md:col-span-2">
            {/* Future: add activity, settings, connected apps */}
            <div className="p-6 border rounded-lg bg-muted/40">
              <h3 className="text-lg font-medium mb-2">Account details</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account information and security settings here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
