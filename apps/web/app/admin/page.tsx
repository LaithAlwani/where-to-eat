import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <AdminDashboard />
    </main>
  );
}
