# Configuración de Email - Setup Completo

## ⚠️ CONFIGURACIÓN OBLIGATORIA

### 1. Supabase Authentication Settings
**Ve a tu Dashboard de Supabase → Authentication → Configuration:**

**Site URL (CRÍTICO):**
```
https://event-spark-plan.lovable.app
```

**Redirect URLs (añadir TODAS estas):**
```
https://event-spark-plan.lovable.app/**
https://preview--event-spark-plan.lovable.app/**
https://id-preview--*.lovable.app/**
https://*.lovableproject.com/**
```

**Email Settings:**
- ✅ **Enable Email Confirmations** = ON
- ✅ Verificar que templates usen `{{ .ConfirmationURL }}`

### 2. Resend API Configuration

**Si NO tienes dominio verificado:**
- Usa el sender por defecto: `Eventix <onboarding@resend.dev>`
- Funciona inmediatamente para testing

**Si TIENES dominio verificado:**
1. Ve a [Resend Dashboard](https://resend.com/domains)
2. Verifica tu dominio  
3. Actualiza el `from` en la función `send-quote-email`:
   ```typescript
   from: "Eventix <cotizaciones@tudominio.com>",
   ```

### 3. API Key de Resend
**Ve a Supabase Dashboard → Edge Functions → Manage secrets y añade:**
- `RESEND_API_KEY` con tu API key de [Resend](https://resend.com/api-keys)

## 🧪 TESTING

### Health Check Manual:
```bash
curl https://uuioedhcwydmtoywyvtq.supabase.co/functions/v1/health-email
```

### Testing desde Browser (Recomendado):
**Abre la consola del navegador (F12) y ejecuta:**

```javascript
// 1. Probar configuración de email
await testEmailConfiguration()

// 2. Probar flujo completo de cotización  
await testQuoteFlow()

// 3. Probar filtros de productos
await testProductFiltering()
```

### Respuesta Esperada (health-email):
```json
{
  "ok": true,
  "timestamp": "2025-01-XX...",
  "checks": {
    "RESEND_API_KEY": true,
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_ROLE_KEY": true
  },
  "message": "All email configuration is ready"
}
```

## 🐛 SOLUCIÓN DE PROBLEMAS

### Emails no llegan:
1. ✅ Verificar `RESEND_API_KEY` en Supabase secrets
2. ✅ Si usas dominio propio, verificar que esté aprobado en Resend
3. ✅ Revisar logs: **Edge Functions → send-quote-email → Logs**
4. ✅ Probar `testEmailConfiguration()` en consola

### Registro no envía confirmación:
1. ✅ Confirmar "Enable email confirmations" = ON  
2. ✅ Verificar redirect URLs incluyen tu dominio
3. ✅ Revisar carpeta spam
4. ✅ Probar con otro email

### Cotizaciones fallan:
1. ✅ Verificar que existan productos con `activo = true`
2. ✅ Probar `testQuoteFlow()` en consola  
3. ✅ Revisar logs: **Edge Functions → quotes-create → Logs**
4. ✅ Verificar datos en tabla `quotes`

### Catálogo vacío:
1. ✅ Verificar productos: `SELECT COUNT(*) FROM products WHERE activo = true`
2. ✅ Probar `testProductFiltering()` en consola
3. ✅ Revisar que filtros no sean muy restrictivos
4. ✅ Cambiar a "Ver todos los productos"

## 📊 VERIFICACIÓN FINAL

### Checklist Completo:
- [ ] Site URL configurado en Supabase Auth
- [ ] Redirect URLs incluyen dominios de Lovable  
- [ ] `RESEND_API_KEY` configurado en secrets
- [ ] `testEmailConfiguration()` retorna `ok: true`
- [ ] Registro envía email de confirmación
- [ ] Cotización crea registros en BD y envía email
- [ ] Catálogo muestra productos filtrados correctamente

### Datos de Prueba Disponibles:
- 🏢 **Proveedores:** 2 aprobados con productos activos
- 📦 **Productos:** ~13 productos en múltiples categorías  
- 🎯 **Filtros específicos:** Para `/catalog?espacio=parques_publicos&evento=eventos_pequenos&plan=basico&aforo=80`

---

**💡 Tip:** Usa las funciones de test en la consola para debug rápido. Todos los logs aparecen en la consola del navegador.