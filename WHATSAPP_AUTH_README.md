# WhatsApp Authentication System

This document describes the WhatsApp authentication system that allows users to link their WhatsApp numbers to their accounts for receiving todo updates and managing tasks via WhatsApp.

## System Overview

The authentication system consists of:

1. **Auth Code Generation**: Users generate unique 8-digit codes on the web interface
2. **WhatsApp Linking**: Users send a message with their auth code to link their WhatsApp number
3. **Message Routing**: Incoming WhatsApp messages are routed to the correct user account
4. **Auto Cleanup**: Expired auth codes are automatically removed after 24 hours

## Database Schema

The system uses a `phone_link` table with the following structure:

```sql
CREATE TABLE public.phone_link (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean,
  auth_code integer,
  phone_number_linked text,
  user_id uuid DEFAULT gen_random_uuid(),
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  CONSTRAINT phone_link_pkey PRIMARY KEY (id),
  CONSTRAINT phone_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## API Endpoints

### 1. Auth Code Management (`/api/auth-code`)

**GET** - Retrieve or generate auth code for authenticated user
- Requires: Bearer token in Authorization header
- Returns: `{ auth_code, is_linked, phone_number, created_at }`

**DELETE** - Deactivate all auth codes for authenticated user
- Requires: Bearer token in Authorization header
- Returns: `{ success: true }`

### 2. WhatsApp Authentication (`/api/whatsapp-auth`)

**POST** - Link WhatsApp number using auth code
- Body: `{ date, message, senderPhoneNumber }`
- Message format: `#auth 12345678`
- Returns: `{ success, message, user_id, phone_number }`

### 3. Phone Number Lookup (`/api/phone-lookup`)

**POST** - Check if phone number is linked to a user
- Body: `{ phone_number }`
- Returns: `{ is_linked, user_id, auth_code?, linked_at? }`

### 4. N8N Webhook (`/api/webhook/evolution-api`)

**POST** - Main webhook endpoint for Evolution API messages
- Routes auth messages to `/api/whatsapp-auth`
- Routes other messages based on phone number linking
- Returns: Appropriate response based on message type

### 5. Cleanup Job (`/api/cleanup-expired-codes`)

**POST** - Remove expired auth codes (24+ hours old)
- Requires: Bearer token with CLEANUP_TOKEN
- Returns: `{ message, cleaned_count, expired_codes }`

## User Workflow

### Linking WhatsApp Account

1. User logs into the web application
2. User clicks "Generate Auth Code" on the homepage
3. System generates unique 8-digit code (e.g., `12345678`)
4. User sends WhatsApp message: `#auth 12345678`
5. Evolution API forwards message to N8N
6. N8N sends webhook to `/api/webhook/evolution-api`
7. System validates code and links phone number
8. User sees "Linked to WhatsApp" status on homepage

### Message Processing

1. WhatsApp message received by Evolution API
2. Evolution API forwards to N8N
3. N8N sends webhook to `/api/webhook/evolution-api`
4. System checks if phone number is linked
5. If linked: Process message for the associated user
6. If not linked: Return instruction to send auth code

## Environment Variables

Create a `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cleanup Job Security
CLEANUP_TOKEN=your_cleanup_secret_token
```

## Security Features

1. **Token-based Authentication**: All user operations require valid JWT tokens
2. **Code Expiration**: Auth codes expire after 24 hours
3. **Automatic Cleanup**: Expired codes are marked as deleted
4. **Webhook Security**: Optional webhook authentication
5. **Service Role**: Admin operations use Supabase service role key

## Testing the System

### 1. Test Auth Code Generation

```bash
curl -X GET http://localhost:3000/api/auth-code \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test WhatsApp Authentication

```bash
curl -X POST http://localhost:3000/api/whatsapp-auth \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-08-20T15:55:50.482Z",
    "message": "#auth 12345678",
    "senderPhoneNumber": "5511948332094"
  }'
```

### 3. Test N8N Webhook

```bash
curl -X POST http://localhost:3000/api/webhook/evolution-api \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-08-20T15:55:50.482Z",
    "message": "#auth 12345678",
    "senderPhoneNumber": "5511948332094"
  }'
```

### 4. Test Cleanup Job

```bash
curl -X POST http://localhost:3000/api/cleanup-expired-codes \
  -H "Authorization: Bearer your_cleanup_secret_token"
```

## N8N Webhook Configuration

Configure your N8N workflow to send a POST request to:
`https://your-domain.com/api/webhook/evolution-api`

With body:
```json
{
  "date": "{{$json.date}}",
  "message": "{{$json.message}}",
  "senderPhoneNumber": "{{$json.senderPhoneNumber}}"
}
```

## Evolution API Configuration

Configure Evolution API to forward messages to your N8N webhook endpoint. The exact configuration depends on your Evolution API setup, but typically involves setting up a webhook URL in the Evolution API configuration.

## Monitoring and Maintenance

### Setup Automated Cleanup

Create a cron job or scheduled task to call the cleanup endpoint daily:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * curl -X POST https://your-domain.com/api/cleanup-expired-codes -H "Authorization: Bearer your_cleanup_secret_token"
```

### Database Monitoring

Monitor the `phone_link` table for:
- Number of active auth codes
- Number of linked phone numbers
- Expired codes that need cleanup

```sql
-- Check active auth codes
SELECT COUNT(*) FROM phone_link WHERE is_active = true AND is_deleted = false;

-- Check linked phone numbers
SELECT COUNT(*) FROM phone_link WHERE phone_number_linked IS NOT NULL AND is_active = true;

-- Check expired codes (24+ hours old)
SELECT COUNT(*) FROM phone_link 
WHERE is_active = true 
  AND is_deleted = false 
  AND created_at < NOW() - INTERVAL '24 hours';
```

## Error Handling

The system includes comprehensive error handling for:

- Invalid auth codes
- Expired auth codes
- Missing required fields
- Database connection errors
- Authentication failures

All errors are logged to the console and appropriate HTTP status codes are returned.

## Future Enhancements

Potential improvements to consider:

1. **Rate Limiting**: Prevent abuse of auth code generation
2. **Code Verification**: Add additional verification steps
3. **Multiple Numbers**: Allow users to link multiple WhatsApp numbers
4. **Message Templates**: Pre-defined response templates
5. **Analytics**: Track usage and authentication success rates
6. **Notifications**: Email notifications when phones are linked/unlinked
