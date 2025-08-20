# Webhook Security Documentation

This document explains the security measures implemented to protect the communication between N8N and your web server.

## Security Methods Available

### 1. API Key Authentication (Simple & Recommended)

**Endpoint:** `/api/webhook/evolution-api`

**How it works:**
- N8N includes an API key in the request header
- Server validates the key before processing the request

**Configuration:**
```bash
# In .env.local
WEBHOOK_API_KEY=your_strong_api_key_here
```

**N8N Configuration:**
In your N8N HTTP Request node, add this header:
```
X-API-Key: your_strong_api_key_here
```

**Example curl request:**
```bash
curl -X POST http://localhost:3001/api/webhook/evolution-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_strong_api_key_here" \
  -d '{
    "date": "2025-08-20T15:55:50.482Z",
    "message": "#auth 12345678",
    "senderPhoneNumber": "5511948332094"
  }'
```

### 2. HMAC Signature Verification (More Secure)

**Endpoint:** `/api/webhook/evolution-api-secure`

**How it works:**
- Both N8N and your server share a secret key
- N8N creates an HMAC signature of the request body
- Server verifies the signature to ensure authenticity and integrity

**Configuration:**
```bash
# In .env.local
WEBHOOK_SECRET=your_shared_secret_key_for_hmac_signatures
```

**N8N Configuration:**
You'll need to create the HMAC signature in N8N using a Function node:

```javascript
// N8N Function node to create HMAC signature
const crypto = require('crypto');
const secret = 'your_shared_secret_key_for_hmac_signatures';
const body = JSON.stringify($json);
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

return {
  json: $json,
  headers: {
    'Content-Type': 'application/json',
    'X-Signature-256': `sha256=${signature}`
  }
};
```

### 3. IP Whitelist (Optional Additional Security)

**Configuration:**
```bash
# In .env.local - comma-separated list of allowed IPs
ALLOWED_IPS=127.0.0.1,::1,your.n8n.server.ip,another.allowed.ip
```

### 4. Rate Limiting

Built into both endpoints:
- 100 requests per minute per IP address
- Automatically blocks excessive requests

## Security Features Included

✅ **API Key Authentication**
✅ **HMAC Signature Verification**
✅ **IP Whitelist Support**
✅ **Rate Limiting**
✅ **Request Logging**
✅ **Error Handling**

## Recommended Setup

### For Development:
Use API Key authentication with the simpler endpoint:
```
POST /api/webhook/evolution-api
Header: X-API-Key: your_development_key
```

### For Production:
1. Use HMAC signature verification for maximum security:
   ```
   POST /api/webhook/evolution-api-secure
   Header: X-Signature-256: sha256=computed_signature
   ```

2. Enable IP whitelist:
   ```bash
   ALLOWED_IPS=your.n8n.server.ip,backup.server.ip
   ```

3. Use strong secrets:
   ```bash
   # Generate strong keys
   WEBHOOK_API_KEY=$(openssl rand -hex 32)
   WEBHOOK_SECRET=$(openssl rand -hex 32)
   ```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Monitor logs for unauthorized access attempts**
5. **Use HTTPS in production**
6. **Consider using a reverse proxy (nginx) for additional security**

## Testing Your Setup

### Test API Key Authentication:
```bash
# Valid request
curl -X POST http://localhost:3001/api/webhook/evolution-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: n8n_webhook_secret_key_12345" \
  -d '{"message": "#auth 12345678", "senderPhoneNumber": "5511948332094"}'

# Should return success

# Invalid request (wrong key)
curl -X POST http://localhost:3001/api/webhook/evolution-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong_key" \
  -d '{"message": "#auth 12345678", "senderPhoneNumber": "5511948332094"}'

# Should return 401 Unauthorized
```

### Test Rate Limiting:
```bash
# Send 101 requests quickly to test rate limiting
for i in {1..101}; do
  curl -X POST http://localhost:3001/api/webhook/evolution-api \
    -H "Content-Type: application/json" \
    -H "X-API-Key: n8n_webhook_secret_key_12345" \
    -d '{"message": "test", "senderPhoneNumber": "5511948332094"}'
done
```

## Error Responses

- **401 Unauthorized**: Invalid or missing API key/signature
- **403 Forbidden**: IP address not in whitelist
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Missing required fields
- **500 Internal Server Error**: Server configuration or processing error

## Monitoring and Logging

All security events are logged with timestamps:
- Successful authentications
- Failed authentication attempts
- Rate limit violations
- IP whitelist violations

Check your application logs for security monitoring.
