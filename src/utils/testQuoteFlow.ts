// Testing utilities for quote flow
import { supabase } from "@/integrations/supabase/client";

interface TestQuoteParams {
  email?: string;
  productCount?: number;
}

export const testQuoteFlow = async (params: TestQuoteParams = {}) => {
  console.log("=== TESTING QUOTE FLOW ===");
  
  const {
    email = "test@example.com",
    productCount = 2
  } = params;

  try {
    // Step 1: Check if we have products
    console.log("1. Checking available products...");
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("activo", true)
      .limit(productCount);

    if (productsError) {
      throw new Error(`Products fetch failed: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      throw new Error("No products available for testing. Run seed-demo first.");
    }

    console.log(`✓ Found ${products.length} products`);

    // Step 2: Create test quote
    const testPayload = {
      contact: {
        email: email,
        whatsapp: "+57 300 123 4567",
        consentWhatsApp: true,
      },
      event: {
        date: "2025-02-15",
        time: "18:00",
        location: "Test Event Location",
      },
      items: products.map((p, index) => ({
        id: p.id,
        name: p.name,
        qty: index + 1,
        price: p.price
      })),
      total: products.reduce((sum, p, index) => sum + (p.price * (index + 1)), 0)
    };

    console.log("2. Creating quote...");
    console.log("Payload:", {
      email: testPayload.contact.email,
      itemsCount: testPayload.items.length,
      total: testPayload.total
    });

    const { data: quoteResult, error: quoteError } = await supabase.functions.invoke("quotes-create", {
      body: testPayload,
    });

    if (quoteError) {
      throw new Error(`Quote creation failed: ${quoteError.message}`);
    }

    console.log("✓ Quote created:", quoteResult);

    // Step 3: Verify quote in database
    console.log("3. Verifying quote in database...");
    const { data: dbQuote, error: dbError } = await supabase
      .from("quotes")
      .select(`
        *,
        quote_items (*)
      `)
      .eq("id", quoteResult.quoteId)
      .single();

    if (dbError) {
      throw new Error(`Database verification failed: ${dbError.message}`);
    }

    console.log("✓ Quote verified in database:", {
      id: dbQuote.id,
      email: dbQuote.email,
      total: dbQuote.total_amount,
      itemsCount: dbQuote.quote_items.length
    });

    // Step 4: Test email (optional)
    console.log("4. Testing email send...");
    try {
      const { error: emailError } = await supabase.functions.invoke("send-quote-email", {
        body: {
          quoteId: quoteResult.quoteId,
          email: testPayload.contact.email,
          pdfUrl: quoteResult.pdfUrl,
          customerName: "Test User"
        },
      });

      if (emailError) {
        console.warn("⚠️ Email failed (this might be expected if Resend not configured):", emailError.message);
      } else {
        console.log("✓ Email sent successfully");
      }
    } catch (emailErr) {
      console.warn("⚠️ Email test failed:", emailErr);
    }

    // Step 5: Check health
    console.log("5. Checking email health...");
    try {
      const { data: health } = await supabase.functions.invoke("health-email");
      console.log("Health status:", health);
    } catch (healthErr) {
      console.warn("⚠️ Health check failed:", healthErr);
    }

    console.log("=== QUOTE FLOW TEST COMPLETED ===");
    return {
      success: true,
      quoteId: quoteResult.quoteId,
      total: testPayload.total,
      itemsCount: testPayload.items.length
    };

  } catch (error) {
    console.error("=== QUOTE FLOW TEST FAILED ===");
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Quick test for products filtering
export const testProductFiltering = async () => {
  console.log("=== TESTING PRODUCT FILTERING ===");

  const testCases = [
    { name: "All products", filters: {} },
    { name: "By category: Catering", filters: { p_categoria: "catering" } },
    { name: "By plan: Premium", filters: { p_plan: "premium" } },
    { name: "By capacity: 50 people", filters: { p_aforo: 50 } },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const filters = testCase.filters as any;
      const { data, error } = await supabase.rpc('get_products_by_filters', {
        p_categoria: filters.p_categoria || null,
        p_espacio: filters.p_espacio || null,
        p_aforo: filters.p_aforo || null,
        p_evento: filters.p_evento || null,
        p_plan: filters.p_plan || null,
        p_show_all: Object.keys(testCase.filters).length === 0
      });

      if (error) {
        console.error(`❌ ${testCase.name}:`, error.message);
      } else {
        console.log(`✓ ${testCase.name}: ${data?.length || 0} products`);
      }
    } catch (err) {
      console.error(`❌ ${testCase.name}:`, err);
    }
  }

  console.log("=== PRODUCT FILTERING TEST COMPLETED ===");
};

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).testQuoteFlow = testQuoteFlow;
  (window as any).testProductFiltering = testProductFiltering;
}