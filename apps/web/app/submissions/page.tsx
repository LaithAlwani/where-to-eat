import { SubmissionsPage } from "@/components/SubmissionsPage";

export default function Submissions() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-ink">طلباتي</h1>
      <SubmissionsPage />
    </main>
  );
}
