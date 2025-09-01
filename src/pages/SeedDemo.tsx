import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { createDemoSeed } from "@/utils/seedDemo";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SeedDemo() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSeed = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const data = await createDemoSeed();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Create Demo Seed Data
          </CardTitle>
          <CardDescription>
            Create comprehensive test data with 21 providers across 7 categories and 63 products
            for testing the catalog filtering functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">What will be created:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• 7 categories: Montaje técnico, Decoración, Catering, Mixología, Arte, Audiovisuales, Mobiliario</li>
              <li>• 3 providers per category (21 total)</li>
              <li>• 3 products per provider (63 total)</li>
              <li>• Full coverage of space types, event types, capacity ranges, and plans</li>
              <li>• All providers approved and products active</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully created {result.providers_created} providers and {result.products_created} products!
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleCreateSeed}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating demo data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Create Demo Data
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            Note: This operation is idempotent - running it multiple times won't create duplicates.
            Existing test data will be cleared first.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}