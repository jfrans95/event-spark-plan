# DEBUG EMAILS - Diagnóstico End-to-End

## Fecha de diagnóstico: 2025-09-19

## 1. Problema Principal Identificado
❌ **RESEND_API_KEY es inválida** - Email sending function returns 401 "validation_error: API key is invalid"

## 2. Frontend → Network Requests

### ✅ Cotización (quotes-create)
- **Request**: POST /functions/v1/quotes-create
- **Status**: 200 ✅ 
- **Response**: 
  ```json
  {
    "quoteId": "d0508e86-4fcb-425a-a12a-019eb69e9a49",
    "trackingCode": "9961fd8f-1452-43d8-b68e-6709607160de", 
    "pdfUrl": "https://uuioedhcwydmtoywyvtq.supabase.co/storage/v1/object/public/public-assets/quote-d0508e86-4fcb-425a-a12a-019eb69e9a49.pdf",
    "total": 3500000,
    "itemCount": 1
  }
  ```

### ❌ Email (send-quote-email)  
- **Request**: POST /functions/v1/send-quote-email
- **Status**: 500 ❌
- **Error**: `{"error":"Failed to send email","details":{"statusCode":401,"name":"validation_error","message":"API key is invalid"}}`
- **Reintentos**: Función intenta 3 veces, todas fallan con mismo error

## 3. Base de Datos → Estado Actual

### Cotizaciones Recientes
```sql
select id, email, total_amount, pdf_url, email_sent_at, status, created_at
from public.quotes order by created_at desc limit 10;
```

| ID | Email | Total | PDF URL | Email Sent | Status | Created |
|---|---|---|---|---|---|---|
| d0508e86... | jonathan.cardona0612@gmail.com | 3500000.00 | ✅ Presente | ❌ NULL | COTIZACION_ENVIADA | 2025-09-19 13:44:24 |
| 8ef1660f... | jonathan.cardona0612@gmail.com | 3500000.00 | ✅ Presente | ❌ NULL | COTIZACION_ENVIADA | 2025-09-19 01:22:40 |
| 743469d3... | jonathan.cardona0612@gmail.com | 850000.00 | ✅ Presente | ❌ NULL | COTIZACION_ENVIADA | 2025-09-18 23:33:03 |

**Diagnóstico**: 
- ✅ Cotizaciones se crean correctamente
- ✅ PDFs se generan y almacenan  
- ❌ **Todos los `email_sent_at` están en NULL** (confirmando que no se envían emails)

### Quote Items
```sql
select qi.quote_id, count(*) as items, sum(qi.quantity * qi.unit_price) as suma_items
from public.quote_items qi group by qi.quote_id
order by max(qi.created_at) desc limit 10;
```

**Estado**: Pendiente de verificar consistencia items vs totales.

## 4. Edge Functions → Logs

### send-quote-email
- ❌ **Error consistente**: "Resend error: API key is invalid"
- **Frecuencia**: Todos los intentos fallan
- **Impact**: 0% emails enviados exitosamente

### quotes-create  
- ✅ **Funcionando correctamente**: Crea quotes + quote_items + PDF

## 5. Auth Settings (Requiere verificación manual)

**Pendiente verificar en Supabase Dashboard**:
- [ ] Site URL configurada correctamente
- [ ] Redirect URLs incluyen `/auth/callback*`  
- [ ] "Confirm email" = ON/OFF
- [ ] Email templates activos

## 6. Secrets Configuration

**Estado conocido**:
- ❌ `RESEND_API_KEY`: Inválida o ausente
- ✅ `SUPABASE_URL`: Presente y funcional
- ✅ `SUPABASE_ANON_KEY`: Presente y funcional

## 7. Acciones Inmediatas Requeridas

1. **CRÍTICO**: Actualizar/configurar `RESEND_API_KEY` válida
2. **Verificar**: Dominio verificado en Resend (resend.com/domains)
3. **Migrar**: Actualizar estructura DB (quote_items.subtotal column, RLS policies)
4. **Refactorizar**: Consolidar quote-submit + email en una sola función
5. **Implementar**: quote-claim function para post-registro

## 8. Criterios de Éxito Post-Fix

- [ ] `email_sent_at` populated after successful email send
- [ ] Resend API returns messageId (no 401 errors)
- [ ] User registration → email confirmation → quote claiming works
- [ ] Public tracking via /tracking/:code functional
- [ ] quote_items.subtotal calculated correctly

---

**Status**: 🔴 **CRÍTICO** - Email sending completamente fallido por API key inválida
**Próximo paso**: Configurar RESEND_API_KEY válida antes de proceder con desarrollo