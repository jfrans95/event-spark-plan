import { supabase } from "@/integrations/supabase/client";

/**
 * Test functions to verify the email and quote system is working
 */

// Test email configuration health
export const testEmailHealth = async () => {
  console.log("🔍 Testing email health...");
  
  try {
    const { data, error } = await supabase.functions.invoke('health-email');
    
    if (error) {
      console.error("❌ Health check failed:", error);
      return { success: false, error };
    }
    
    console.log("✅ Health check results:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Health check error:", error);
    return { success: false, error };
  }
};

// Test quote creation with sample data
export const testQuoteFlow = async (testEmail = "test@example.com") => {
  console.log("🔍 Testing quote flow...");
  
  const testPayload = {
    contact: {
      email: testEmail,
      whatsapp: "+57 300 123 4567",
      consentWhatsApp: true,
    },
    event: {
      date: "2025-12-25",
      time: "18:00",
      location: "Centro de Eventos - Bogotá",
    },
    items: [
      {
        id: "test-product-1",
        name: "Paquete de prueba",
        qty: 1,
        price: 500000
      }
    ],
    total: 500000,
  };

  try {
    const { data, error } = await supabase.functions.invoke("quote-submit", {
      body: testPayload,
      headers: {
        "idempotency-key": `test-quote-${Date.now()}-${testEmail}`
      }
    });

    if (error) {
      console.error("❌ Quote test failed:", error);
      return { success: false, error };
    }

    console.log("✅ Quote test successful:", data);
    
    // Test PDF URL if available
    if (data.pdfUrl) {
      console.log("🔗 PDF URL:", data.pdfUrl);
      
      try {
        const response = await fetch(data.pdfUrl);
        console.log("📄 PDF accessible:", response.ok, "Status:", response.status);
      } catch (pdfError) {
        console.error("❌ PDF access failed:", pdfError);
      }
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Quote test error:", error);
    return { success: false, error };
  }
};

// Run both tests
export const runAllTests = async () => {
  console.log("🚀 Running all system tests...");
  
  const healthResult = await testEmailHealth();
  const quoteResult = await testQuoteFlow();
  
  console.log("\n📊 Test Results Summary:");
  console.log("Email Health:", healthResult.success ? "✅ PASS" : "❌ FAIL");
  console.log("Quote Flow:", quoteResult.success ? "✅ PASS" : "❌ FAIL");
  
  return {
    health: healthResult,
    quote: quoteResult,
    allPassed: healthResult.success && quoteResult.success
  };
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).testEmailHealth = testEmailHealth;
  (window as any).testQuoteFlow = testQuoteFlow;
  (window as any).runAllTests = runAllTests;
}