import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#71808c]">
        <Loader2 className="h-8 w-8 animate-spin text-[#42624d]" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
