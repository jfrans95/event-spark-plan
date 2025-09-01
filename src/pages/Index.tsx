import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PackageCarousel } from "@/components/PackageCarousel";
import { EventFilters } from "@/components/EventFilters";
import { Footer } from "@/components/Footer";
import { createDemoSeed } from "@/utils/seedDemo";

interface EventFilters {
  spaceType: string;
  guestCount: number;
  eventType: string;
  plan: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingSeed, setIsCreatingSeed] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    spaceType: "",
    guestCount: 0, // No default value
    eventType: "",
    plan: ""
  });

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const handleStartDesign = () => {
    const params = new URLSearchParams({
      espacio: filters.spaceType,
      aforo: String(filters.guestCount),
      evento: filters.eventType,
      plan: filters.plan
    });
    navigate(`/catalog?${params.toString()}`);
  };

  const handleCreateSeed = async () => {
    setIsCreatingSeed(true);
    try {
      await createDemoSeed();
    } catch (error) {
      console.error('Failed to create seed data:', error);
    } finally {
      setIsCreatingSeed(false);
    }
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
                
                {/* Temporary test button */}
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleCreateSeed}
                    disabled={isCreatingSeed}
                    size="sm"
                  >
                    {isCreatingSeed ? 'Creating Demo Data...' : 'Test: Create Demo Data'}
                  </Button>
                </div>
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
