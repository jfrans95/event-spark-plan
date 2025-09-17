# Email Integration Setup Guide

## Overview
This guide covers the complete setup of email functionality for EventCraft, including registration confirmation emails and quote delivery emails.

## 🔧 Required Configuration

### 1. Environment Variables (.env)
Create a `.env` file in your project root:

```env
# Copy from .env.example and fill with your values
VITE_SUPABASE_URL=https://uuioedhcwydmtoywyvtq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=uuioedhcwydmtoywyvtq
```

### 2. Supabase Secrets (Functions → Secrets)
Configure these secrets in your Supabase dashboard:

| Secret Name | Description | Where to get it |
|-------------|-------------|-----------------|
| `RESEND_API_KEY` | Resend.com API key | https://resend.com/api-keys |
| `SUPABASE_URL` | Your Supabase project URL | Project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Project API settings |

### 3. Supabase Auth Configuration
In Supabase Dashboard → Authentication → Settings:

- ✅ **Enable email confirmations**
- ✅ **Configure SMTP** (or use Resend fallback)
- ✅ **Set Site URL**: Your domain/localhost
- ✅ **Add Redirect URLs**: 
  - `http://localhost:5173/auth/callback*`
  - `https://yourdomain.com/auth/callback*`

### 4. GitHub Secrets (for CI/CD)
Configure these in your GitHub repository settings:

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase access token |
| `SUPABASE_PROJECT_REF` | Your project reference ID |

## 📧 Email Flows

### Registration Confirmation
1. **Primary**: Supabase native email confirmation
2. **Fallback**: Custom `resend-confirmation-email` Edge Function
3. **UI**: "Resend confirmation" button available on login page

### Quote Delivery
1. **Trigger**: After successful quote creation
2. **Function**: `send-quote-email` Edge Function
3. **Features**: PDF attachment, idempotency, retry logic

## 🚀 Deployment

### Automatic (Recommended)
- Push changes to `main` branch
- GitHub Actions will deploy all functions automatically

### Manual
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy --project-ref your-project-ref
```

## 🧪 Testing

### Registration Flow
1. Go to `/auth` page
2. Create new account (any role)
3. Check email for confirmation
4. If no email arrives, use "Resend confirmation" button
5. Click confirmation link → should redirect to appropriate dashboard

### Quote Flow
1. Go to `/catalog` (catalog page)
2. Add items to package
3. Request quote with valid email
4. Check email for quote PDF
5. Verify `quotes.email_sent_at` is set in database

## 🐛 Troubleshooting

### No confirmation emails arriving
1. Check Supabase Auth → Settings → Email templates are active
2. Verify SMTP configuration or domain validation in Resend
3. Check Edge Function logs: [Function Logs](https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq/functions/resend-confirmation-email/logs)

### No quote emails arriving
1. Verify `RESEND_API_KEY` is configured
2. Check quote has valid `pdf_url` before sending
3. Check logs: [Quote Email Logs](https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq/functions/send-quote-email/logs)

### GitHub Actions failing
1. Verify `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` secrets
2. Check Actions tab for detailed error logs
3. Ensure Supabase CLI has proper permissions

## 📋 Verification Checklist

- [ ] `.env` file created with correct values
- [ ] Supabase secrets configured (RESEND_API_KEY, etc.)
- [ ] Supabase Auth settings enabled (email confirmation, SMTP, URLs)
- [ ] GitHub secrets configured for CI/CD
- [ ] Registration flow tested (email arrives, confirmation works)
- [ ] Quote flow tested (PDF email arrives, idempotency works)
- [ ] Fallback confirmation button tested
- [ ] GitHub Actions deployment working

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq)
- [Resend Dashboard](https://resend.com/domains)
- [Function Logs](https://supabase.com/dashboard/project/uuioedhcwydmtoywyvtq/functions)
- [GitHub Actions](../../actions)