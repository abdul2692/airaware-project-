import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PollutionMap from "@/components/PollutionMap";
import ReportForm from "@/components/ReportForm";
import HealthChatbot from "@/components/HealthChatbot";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PollutionMap />
      <ReportForm />
      <HealthChatbot />
      <CommunityReports />
      <Footer />
    </div>
  );
};

export default Index;
