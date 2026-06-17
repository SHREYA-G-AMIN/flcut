// FLCUT-AI-2627-visible
// app/page.tsx

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}