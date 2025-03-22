import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentTab from "@/components/PaymentTab";

export default function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          <PaymentTab />
        </div>
      </main>
      <Footer />
    </div>
  );
}