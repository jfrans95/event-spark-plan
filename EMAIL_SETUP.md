# Email Configuration Setup Guide

## Overview
This guide helps you configure email functionality for quote notifications and user registration confirmations.

## Required Configuration

### 1. Supabase Authentication Settings
Go to your Supabase Dashboard → Authentication → Configuration:

- **Site URL**: `https://event-spark-plan.lovable.app` (or your production domain)
- **Redirect URLs**: Keep existing ones (should include your domain variations)
- **Enable Email Confirmations**: ✅ Enabled (for registration flow)

### 2. Resend Configuration

#### If you DON'T have a verified domain:
- Use the default sender: `Eventix <onboarding@resend.dev>`
- This works out of the box for testing

#### If you HAVE a verified domain:
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Verify your domain
3. Update the `from` field in `send-quote-email` function:
   ```typescript
   from: "Eventix <cotizaciones@yourdomain.com>",
   ```

### 3. Resend API Key
Make sure your `RESEND_API_KEY` is set in Supabase secrets:
- Go to Supabase Dashboard → Edge Functions → Manage secrets
- Add `RESEND_API_KEY` with your Resend API key

## Health Check

Use the health check endpoint to verify configuration:

### Manual Test:
```bash
curl https://uuioedhcwydmtoywyvtq.supabase.co/functions/v1/health-email
```

### In-App Test Button:
Create a simple test button in your admin panel:

```typescript
const checkEmailHealth = async () => {
  const { data } = await supabase.functions.invoke('health-email');
  console.log('Email health:', data);
};
```

## Expected Response:
```json
{
  "ok": true,
  "timestamp": "2025-01-XX...",
  "checks": {
    "RESEND_API_KEY": true,
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_ROLE_KEY": true
  },
  "message": "All email configuration is ready",
  "required_actions": []
}
```

## Troubleshooting Common Issues

### 1. Emails not sending
- Check RESEND_API_KEY is correctly set
- Verify domain is approved in Resend (if using custom domain)
- Check Edge Function logs for detailed errors

### 2. Registration emails not arriving
- Confirm "Enable email confirmations" is ON in Supabase Auth settings
- Check spam folder
- Verify redirect URLs include your domain

### 3. Quote emails fail
- Check console logs in browser dev tools
- Verify the quote was created in database
- Test health-email endpoint

## Edge Function Logs

To view detailed logs:
1. Go to Supabase Dashboard → Edge Functions
2. Click on function name (send-quote-email, quotes-create)
3. View logs tab for error details

## Testing Checklist

✅ Registration sends confirmation email  
✅ Quote creation works (check database)  
✅ Quote email is sent and received  
✅ Health endpoint returns `ok: true`  
✅ Edge function logs show no errors  

## Production Notes

- Use your own verified domain for better deliverability
- Monitor Resend usage and limits
- Set up proper error alerting for failed emails
- Consider implementing email templates for better branding

---

*Last updated: January 2025*