"use client";

import { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Trash2, Clock } from "lucide-react";

interface WholesaleEnquiry {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  gstNumber?: string | null;
  expectedQuantity?: number | null;
  message?: string | null;
  status: "NEW" | "CONTACTED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminWholesalePage() {
  const [enquiries, setEnquiries] = useState<WholesaleEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/wholesale")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          setEnquiries(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateStatus(id: string, status: "NEW" | "CONTACTED" | "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/admin/wholesale/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteEnquiry(id: string) {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/admin/wholesale/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = enquiries.filter(
    (e) => filter === "ALL" || e.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17212b]">Wholesale Enquiries</h1>
          <p className="text-xs text-[#71808c]">Review and manage B2B wholesale partnership requests.</p>
        </div>

        <div className="flex gap-2 text-xs">
          {["ALL", "NEW", "CONTACTED", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded font-medium transition ${
                filter === tab
                  ? "bg-[#17212b] text-white"
                  : "bg-white text-[#71808c] hover:bg-gray-100 border border-[#e2e7eb]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded border border-[#e2e7eb] text-sm text-[#71808c]">
          Loading enquiries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded border border-[#e2e7eb] text-sm text-[#71808c]">
          No wholesale enquiries found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white p-6 rounded border border-[#e2e7eb] shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#42624d]" />
                    <h2 className="font-bold text-base text-[#17212b]">{enquiry.businessName}</h2>
                  </div>
                  <p className="text-xs text-[#71808c] mt-0.5">
                    Contact: <span className="font-semibold text-gray-800">{enquiry.contactName}</span>
                    {enquiry.gstNumber && ` · GST: ${enquiry.gstNumber}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${
                      enquiry.status === "NEW"
                        ? "bg-amber-100 text-amber-800"
                        : enquiry.status === "CONTACTED"
                        ? "bg-blue-100 text-blue-800"
                        : enquiry.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {enquiry.status}
                  </span>
                  <button
                    onClick={() => deleteEnquiry(enquiry.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Delete enquiry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs text-[#52606d]">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <a href={`tel:${enquiry.phone}`} className="hover:underline font-medium">
                    {enquiry.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <a href={`mailto:${enquiry.email}`} className="hover:underline font-medium">
                    {enquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{enquiry.location}</span>
                </div>
              </div>

              {enquiry.expectedQuantity && (
                <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded">
                  <strong>Expected Volume:</strong> {enquiry.expectedQuantity} units
                </p>
              )}

              {enquiry.message && (
                <div className="text-xs text-gray-600 bg-[#f9fafb] p-3 rounded border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1">Message / Requirements:</p>
                  <p className="whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock size={13} />
                  Received on {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium mr-1">Update Status:</span>
                  {(["NEW", "CONTACTED", "APPROVED", "REJECTED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(enquiry.id, st)}
                      disabled={enquiry.status === st}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition ${
                        enquiry.status === st
                          ? "bg-gray-200 text-gray-500 border-gray-300 cursor-default"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
