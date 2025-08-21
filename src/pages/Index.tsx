import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PackageCarousel } from "@/components/PackageCarousel";
import { EventFilters } from "@/components/EventFilters";
import { Footer } from "@/components/Footer";

interface EventFilters {
  spaceType: string;
  guestCount: number;
  eventType: string;
  plan: string;
}

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    spaceType: "",
    guestCount: 50,
    eventType: "",
    plan: ""
  });

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const handleStartDesign = () => {
    console.log("Starting event design with filters:", filters);
    // TODO: Navigate to event designer
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Filters Section */}
        {showFilters && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <EventFilters 
                  onFiltersChange={handleFiltersChange}
                  onStartDesign={handleStartDesign}
                />
              </div>
            </div>
          </section>
        )}
        
        <PackageCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
