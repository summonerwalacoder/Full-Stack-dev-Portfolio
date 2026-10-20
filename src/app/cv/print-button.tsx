"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-[#c3cfdd] bg-white px-4 py-2 text-[13px] text-[#1d3550] transition-colors hover:border-[#7fa3c7]"
    >
      Print / Save as PDF
    </button>
  );
}
