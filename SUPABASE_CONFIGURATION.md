# Configuración Crítica de Supabase

## A. Configuración de Autenticación (OBLIGATORIO)

### 1. Site URL y Redirect URLs
Ve a **Authentication → Settings** en tu dashboard de Supabase y configura:

**Site URL:**
```
https://event-spark-plan.lovable.app
```

**Redirect URLs (añadir todas):**
```
https://event-spark-plan.lovable.app/**
https://preview--event-spark-plan.lovable.app/**
https://*.lovable.app/**
https://*.lovableproject.com/**
```

### 2. Confirmación por Email
- ✅ **Enable email confirmations** = ON
- Verificar que las plantillas usen `{{ .ConfirmationURL }}`

## B. Secrets de Edge Functions (CRÍTICO)

Ve a **Edge Functions → Manage Secrets** y confirma que estén configurados:

### Secrets Requeridos:
- `RESEND_API_KEY` - Tu API key de Resend.com
- `SUPABASE_URL` - URL de tu proyecto Supabase  
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Obtener RESEND_API_KEY:
1. Ir a https://resend.com y crear cuenta
2. Verificar dominio en https://resend.com/domains (opcional)
3. Crear API key en https://resend.com/api-keys
4. Añadirlo como secret en Supabase

## C. Verificación de Estado

### Health Check Endpoint:
```bash
curl https://uuioedhcwydmtoywyvtq.supabase.co/functions/v1/health-email
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "checks": {
    "RESEND_API_KEY": true,
    "SUPABASE_URL": true, 
    "SUPABASE_SERVICE_ROLE_KEY": true
  },
  "message": "All email configuration is ready"
}
```

## D. Testing End-to-End

### 1. Registro con Confirmación:
- Registrar usuario nuevo
- Verificar que llegue email de confirmación
- Clic en enlace → debe redirigir correctamente

### 2. Cotización con Email:
- Agregar productos al carrito en /catalog
- Llenar formulario de cotización
- Verificar que se cree en BD: `quotes` + `quote_items`
- Verificar que llegue email con PDF

### 3. Catálogo con Filtros:
- Ir a /catalog con filtros: `?espacio=parques_publicos&evento=eventos_pequenos&plan=basico&aforo=80`
- Debe mostrar productos que cumplan todos los criterios
- Cambiar categoría → debe filtrar por esa categoría específica

## E. Logs de Debugging

### Ver Logs de Edge Functions:
1. **Edge Functions → [nombre función] → Logs**
2. Buscar errores en:
   - `quotes-create`
   - `send-quote-email`
   - `health-email`

### Queries de Debug en SQL Editor:
```sql
-- Verificar productos activos
SELECT categoria, COUNT(*) 
FROM products 
WHERE activo = true 
GROUP BY categoria;

-- Verificar cotizaciones recientes
SELECT id, email, total_amount, email_sent_at 
FROM quotes 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar proveedores aprobados
SELECT pa.company_name, pa.status 
FROM provider_applications pa
JOIN provider_profiles pp ON pp.application_id = pa.id;
```

## F. Solución de Problemas Comunes

### Email no llega:
- ✅ Verificar RESEND_API_KEY en secrets
- ✅ Si usas dominio propio, verificar en Resend Dashboard
- ✅ Revisar logs de `send-quote-email`
- ✅ Probar health-email endpoint

### Catálogo vacío:
- ✅ Ejecutar seed: productos con `activo = true`
- ✅ Verificar que providers estén approved
- ✅ Comprobar filtros: pueden estar muy restrictivos

### Auth redirect error:
- ✅ Site URL correcto en Supabase Auth
- ✅ Redirect URLs incluyen tu dominio
- ✅ Frontend usa `emailRedirectTo: window.location.origin + '/auth/callback'`

---

**Última actualización:** Septiembre 2025
**Estado requerido:** Todos los ✅ deben estar completados para funcionamiento completo.