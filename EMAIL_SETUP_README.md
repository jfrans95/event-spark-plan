# Email Configuration Setup Guide

## Email Issues Fixed ✅

This guide covers the setup required for email confirmation and quote emails to work properly in your EventCraft application.

## 🔧 Required Supabase Configuration

### 1. Email Confirmations (Authentication)

**In Supabase Dashboard → Authentication → Settings:**

- ✅ Enable "Confirm email" 
- ✅ Configure SMTP settings or use built-in provider
- ✅ Set **Site URL** to your domain:
  - Development: `http://localhost:5173` 
  - Production: `https://your-domain.com`
- ✅ Add **Redirect URLs**:
  - Development: `http://localhost:5173/auth/callback`
  - Production: `https://your-domain.com/auth/callback`
- ✅ Verify email templates are active

### 2. Email Providers (For Quote Emails)

**Required Secrets in Supabase → Functions → Secrets:**

```bash
RESEND_API_KEY=re_xxxxxxxxx           # Get from https://resend.com/api-keys
SUPABASE_URL=https://uuioedhcwydmtoywyvtq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...   # From Supabase Dashboard → API
```

**Get your Resend API Key:**
1. Sign up at https://resend.com
2. Verify your domain at https://resend.com/domains
3. Create API key at https://resend.com/api-keys

## 🔄 Email Flows (Fixed)

### Registration Flow ✅
1. **Auth.tsx**: Uses correct `emailRedirectTo: ${window.location.origin}/auth/callback?next=/user`
2. **QuoteModal.tsx**: Fixed to use callback flow instead of direct redirect
3. User clicks email link → `/auth/callback?next=/user` → redirects to user profile
4. **No more custom send-confirmation-email calls** - Supabase handles natively

### Quote Email Flow ✅  
1. User creates quote → `quotes-create` generates PDF **first**
2. `send-quote-email` automatically invoked **after PDF ready**
3. **Idempotency**: Checks `email_sent_at` to prevent duplicates
4. Email sent with quote details and PDF link
5. `email_sent_at` timestamp updated in database

## 🧪 Testing & QA

### Manual Testing Commands

**Test Quote Email Sending:**
```javascript
// In browser console (logged in as admin)
const { data, error } = await supabase.functions.invoke('send-quote-email', {
  body: { 
    quoteId: 'your-quote-id-here' 
  }
});
console.log('Result:', { data, error });
```

**Resend Quote Email (if needed):**
```javascript 
const { data, error } = await supabase.functions.invoke('resend-quote-email', {
  body: { 
    quoteId: 'your-quote-id-here' 
  }
});
console.log('Resent:', { data, error });
```

### SQL Queries for QA

**Check email delivery status:**
```sql
SELECT 
  id,
  contact_email,
  total_amount,
  pdf_url IS NOT NULL as has_pdf,
  email_sent_at IS NOT NULL as email_sent,
  email_sent_at,
  created_at
FROM quotes 
ORDER BY created_at DESC 
LIMIT 10;
```

**Email delivery stats:**
```sql
SELECT 
  status,
  COUNT(*) as total_quotes,
  COUNT(email_sent_at) as emails_sent,
  ROUND(COUNT(email_sent_at) * 100.0 / COUNT(*), 2) as success_rate
FROM quotes 
GROUP BY status;
```

**Find quotes with PDF but no email:**
```sql
SELECT id, contact_email, created_at
FROM quotes 
WHERE pdf_url IS NOT NULL 
AND email_sent_at IS NULL;
```

## 🐛 Debugging Guide

### Check Edge Function Logs
- **send-quote-email**: https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq/functions/send-quote-email/logs
- **quotes-create**: https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq/functions/quotes-create/logs

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Email not received" | Missing RESEND_API_KEY | Check Functions → Secrets |
| "PDF not ready" | `pdf_url` missing | Ensure PDF generated before email |
| "Email already sent" | Idempotency check | Use `resend-quote-email` function |
| "User not redirected after signup" | Wrong `emailRedirectTo` | Check callback URL format |
| "Duplicate emails" | Missing idempotency | Fixed - now checks `email_sent_at` |

### Error Messages to Watch For

**In Edge Function Logs:**
- ✅ `"Quote email sent successfully, messageId: re_xxx"` 
- ✅ `"Email already sent for quote: xxx at: 2025-01-15T10:30:00Z"`
- ❌ `"PDF not ready for quote xxx. Please try again later."`
- ❌ `"Error sending quote email: API key invalid"`

## 📋 Quality Assurance Checklist

### Registration Email Test
- [ ] Sign up new user → receives Supabase confirmation email
- [ ] Email link format: `/auth/callback?next=/user`
- [ ] Click email link → redirects correctly to user dashboard
- [ ] No custom send-confirmation-email function calls

### Quote Email Test
- [ ] Create quote → PDF URL generated → email sent automatically  
- [ ] Email contains: quote details, PDF link, contact info
- [ ] Database: `email_sent_at` timestamp updated
- [ ] Retry same quote → returns "Email already sent" (no duplicate)
- [ ] Use `resend-quote-email` → allows manual resend

### Error Handling Test
- [ ] Invalid email → shows proper error message in UI
- [ ] Rate limit exceeded → shows appropriate message  
- [ ] Function errors → logged in Edge Function logs with details

## 🔐 Security Verified

- ✅ `SUPABASE_SERVICE_ROLE_KEY` only used server-side in Edge Functions
- ✅ Email addresses validated before processing
- ✅ Rate limiting handled by Supabase Auth and Resend
- ✅ Idempotency prevents spam/duplicate emails
- ✅ No sensitive data exposed in client-side code

## 📊 Production Monitoring

**Key metrics to track:**
- Email delivery rate: `COUNT(email_sent_at) / COUNT(*)` 
- PDF generation success: `COUNT(pdf_url) / COUNT(*)`
- Average time from quote creation to email sent
- Resend API quota usage

**Set up alerts for:**
- Email delivery rate < 95%
- Edge Function error rate > 1%
- Resend API rate limits approaching