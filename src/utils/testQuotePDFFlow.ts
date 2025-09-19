// Test utilities for validating the complete quote flow with PDF generation
import { supabase } from "@/integrations/supabase/client";

export const testQuotePDFFlow = async () => {
  console.log("=== Testing Quote PDF Flow ===");
  
  const testPayload = {
    contact: {
      email: "test@example.com",
      whatsapp: "+57 300 123 4567",
      consentWhatsApp: true,
    },
    event: {
      date: "2024-12-25",
      time: "18:00",
      location: "Test Event Location"
    },
    items: [
      {
        id: "test-product-1",
        name: "Test Product",
        qty: 1,
        price: 100000
      }
    ],
    total: 100000
  };

  try {
    console.log("Sending quote request...");
    const { data, error } = await supabase.functions.invoke("quote-submit", {
      body: testPayload,
      headers: {
        "idempotency-key": `test-quote-${Date.now()}`
      }
    });

    if (error) {
      console.error("Quote submission failed:", error);
      return;
    }

    console.log("Quote created successfully:", {
      quoteId: data.quoteId,
      trackingCode: data.trackingCode,
      pdfUrl: data.pdfUrl,
      emailSent: data.emailSent
    });

    // Try to access the PDF URL
    if (data.pdfUrl) {
      console.log("Testing PDF access...");
      try {
        const pdfResponse = await fetch(data.pdfUrl);
        console.log("PDF URL status:", pdfResponse.status);
        if (pdfResponse.ok) {
          console.log("✅ PDF is accessible at:", data.pdfUrl);
        } else {
          console.error("❌ PDF not accessible, status:", pdfResponse.status);
        }
      } catch (pdfError) {
        console.error("❌ Error accessing PDF:", pdfError);
      }
    }

    return data;
    
  } catch (error) {
    console.error("Test failed:", error);
  }
};

export const testStorageBuckets = async () => {
  console.log("=== Testing Storage Buckets ===");
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Failed to list buckets:", error);
      return;
    }

    console.log("Available buckets:");
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name} (public: ${bucket.public})`);
    });

    // Test public-assets bucket access
    const publicAssetsBucket = buckets.find(b => b.name === 'public-assets');
    if (publicAssetsBucket) {
      console.log("✅ public-assets bucket exists and is public:", publicAssetsBucket.public);
      
      // List files in quotes folder
      const { data: files, error: listError } = await supabase.storage
        .from('public-assets')
        .list('quotes');
      
      if (!listError && files) {
        console.log(`Found ${files.length} files in public-assets/quotes/`);
        files.forEach(file => {
          console.log(`  - ${file.name}`);
        });
      }
    } else {
      console.error("❌ public-assets bucket not found");
    }
    
  } catch (error) {
    console.error("Storage test failed:", error);
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testQuotePDFFlow = testQuotePDFFlow;
  (window as any).testStorageBuckets = testStorageBuckets;
  console.log("Test functions available: testQuotePDFFlow(), testStorageBuckets()");
}