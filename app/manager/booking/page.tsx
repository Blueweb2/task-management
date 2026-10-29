import { Suspense } from "react";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";

export default function ManagerBookingPage() {
  return (
    <div className="space-y-6">
      <BookingHeader />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#dbeafe] bg-white p-12 text-center text-sm text-[#475569]">
            Loading proposal workflow...
          </div>
        }
      >
        <BookingForm />
      </Suspense>
    </div>
  );
}
