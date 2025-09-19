import { supabase } from "@/integrations/supabase/client";

/**
 * Prueba la configuración de email llamando al health check
 */
export const testEmailConfiguration = async () => {
  try {
    console.log("=== Testing Email Configuration ===");
    
    const { data, error } = await supabase.functions.invoke("health-email");
    
    if (error) {
      console.error("Health check failed:", error);
      return {
        success: false,
        message: `Health check error: ${error.message}`,
        details: error
      };
    }
    
    console.log("Health check response:", data);
    
    if (data?.ok) {
      return {
        success: true,
        message: "✅ Email configuration is ready",
        checks: data.checks,
        data
      };
    } else {
      return {
        success: false,
        message: "❌ Email configuration has issues",
        required_actions: data?.required_actions || [],
        data
      };
    }
    
  } catch (error: any) {
    console.error("Test failed:", error);
    return {
      success: false,
      message: `Test failed: ${error.message}`,
      error
    };
  }
};

/**
 * Prueba el flujo completo de cotización
 */
export const testQuoteFlow = async () => {
  try {
    console.log("=== Testing Quote Flow ===");
    
    // Payload de prueba
    const testPayload = {
      contact: {
        email: "test@example.com",
        whatsapp: "+57 300 123 4567",
        consentWhatsApp: true,
      },
      event: {
        date: "2025-12-25",
        time: "15:00",
        location: "Parque Nacional",
      },
      items: [
        { 
          id: "prod-parques-001", 
          name: "Carpa Eventos Pequeños", 
          qty: 1, 
          price: 850000 
        }
      ],
      total: 850000,
    };
    
    console.log("Creating quote with payload:", testPayload);
    
    const { data: quoteData, error: quoteError } = await supabase.functions.invoke("quotes-create", {
      body: testPayload,
    });
    
    if (quoteError) {
      console.error("Quote creation failed:", quoteError);
      return {
        success: false,
        step: "quote_creation",
        message: `Quote creation failed: ${quoteError.message}`,
        error: quoteError
      };
    }
    
    console.log("Quote created successfully:", quoteData);
    
    const { quoteId, pdfUrl } = quoteData;
    
    if (!quoteId) {
      return {
        success: false,
        step: "quote_validation",
        message: "No quote ID received from creation",
        data: quoteData
      };
    }
    
    // Probar envío de email
    console.log("Testing email send...");
    
    const { data: emailData, error: emailError } = await supabase.functions.invoke("send-quote-email", {
      body: {
        quoteId,
        email: testPayload.contact.email,
        pdfUrl,
        customerName: "Test User"
      },
    });
    
    if (emailError) {
      console.error("Email send failed:", emailError);
      return {
        success: false,
        step: "email_send",
        message: `Email send failed: ${emailError.message}`,
        quoteId,
        error: emailError
      };
    }
    
    console.log("Email sent successfully:", emailData);
    
    return {
      success: true,
      message: "✅ Quote flow completed successfully",
      quoteId,
      pdfUrl,
      emailResult: emailData
    };
    
  } catch (error: any) {
    console.error("Quote flow test failed:", error);
    return {
      success: false,
      step: "unknown",
      message: `Test failed: ${error.message}`,
      error
    };
  }
};

/**
 * Prueba los filtros de productos
 */
export const testProductFiltering = async () => {
  try {
    console.log("=== Testing Product Filtering ===");
    
    // Probar filtro específico que debería devolver resultados
    const testFilters = {
      categoria: "montaje_tecnico",
      espacio: "parques_publicos", 
      evento: "eventos_pequenos",
      plan: "basico",
      aforo: 80
    };
    
    console.log("Testing RPC with filters:", testFilters);
    
    const { data, error } = await supabase.rpc('get_products_by_filters', {
      p_categoria: testFilters.categoria,
      p_espacio: testFilters.espacio,
      p_aforo: testFilters.aforo,
      p_evento: testFilters.evento,
      p_plan: testFilters.plan,
      p_show_all: false
    });
    
    if (error) {
      console.error("RPC call failed:", error);
      return {
        success: false,
        message: `RPC call failed: ${error.message}`,
        error
      };
    }
    
    console.log(`Found ${data?.length || 0} products:`, data);
    
    if (!data || data.length === 0) {
      console.warn("No products found - checking if any exist without filters");
      
      const { data: allProducts, error: allError } = await supabase.rpc('get_products_by_filters', {
        p_categoria: testFilters.categoria,
        p_espacio: null,
        p_aforo: null,
        p_evento: null,
        p_plan: null,
        p_show_all: true
      });
      
      if (allError) {
        return {
          success: false,
          message: "Failed to check all products",
          error: allError
        };
      }
      
      return {
        success: false,
        message: `❌ No products match filters. Total in category: ${allProducts?.length || 0}`,
        filtersUsed: testFilters,
        totalInCategory: allProducts?.length || 0,
        data: allProducts
      };
    }
    
    return {
      success: true,
      message: `✅ Found ${data.length} products matching filters`,
      filtersUsed: testFilters,
      productsFound: data.length,
      products: data
    };
    
  } catch (error: any) {
    console.error("Product filtering test failed:", error);
    return {
      success: false,
      message: `Test failed: ${error.message}`,
      error
    };
  }
};

// Exportar para uso en consola del navegador
(window as any).testEmailConfiguration = testEmailConfiguration;
(window as any).testQuoteFlow = testQuoteFlow;  
(window as any).testProductFiltering = testProductFiltering;

console.log("🧪 Test utilities loaded. Use in browser console:");
console.log("- testEmailConfiguration()");  
console.log("- testQuoteFlow()");
console.log("- testProductFiltering()");