import { requireAdmin } from "@/lib/admin-auth";

export default async function IntegrationsPage() {
  await requireAdmin();
  const integrations: { name: string; enabled: boolean; description: string }[] = [
    { name: "Razorpay", enabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), description: "Payment provider configuration used by checkout." },
    { name: "Supabase PostgreSQL", enabled: Boolean(process.env.DATABASE_URL), description: "Database connection used by the application." },
    { name: "Authentication", enabled: Boolean(process.env.AUTH_SECRET), description: "Existing admin session authentication." },
  ];
  return <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#71808c]">Configuration</p><h1 className="mt-2 text-3xl font-semibold">Integrations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#71808c]">Integration status only. Secret values are never displayed in the admin panel.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{integrations.map(({ name, enabled, description }) => <div key={name} className="rounded-lg border border-[#e2e7eb] bg-white p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-semibold">{name}</h2><span className={`rounded-full px-2.5 py-1 text-xs ${enabled ? "bg-[#e5f2e8] text-[#287a3d]" : "bg-[#f1f3f5] text-[#71808c]"}`}>{enabled ? "Configured" : "Not configured"}</span></div><p className="mt-3 text-sm leading-6 text-[#71808c]">{description}</p></div>)}</div></div>;
}
