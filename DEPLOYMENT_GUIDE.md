# Production Deployment Guide: CORS, Cookies, OAuth & Security

## Overview
Your issue exemplifies a common production deployment gotcha: **security policies that don't apply on localhost become critical across domains**. This guide explains why and how to avoid it.

---

## Part 1: Why This Works on Localhost But Fails in Production

### Localhost Environment
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Protocol: HTTP (insecure)
Domain:   localhost (same device)
```

**Why it works:**
- ✅ Same device = browser automatically trusts cross-origin requests
- ✅ HTTP allows unencrypted cookies
- ✅ `sameSite=Lax` (default) works fine on HTTP
- ✅ Browser relaxes CORS rules for development
- ✅ Cookies sent by default in development mode

### Production Environment
```
Frontend: https://sydney-event.vercel.app
Backend:  https://sydney-event.onrender.com
Protocol: HTTPS (secure)
Domain:   Different domains (different companies/servers)
```

**Why it fails without proper config:**
- ❌ **Different domains** = CORS blocks cross-origin requests by default
- ❌ **HTTPS + cross-domain** = browsers block cookies unless `secure=true`
- ❌ **Third-party cookies** = modern browsers require `sameSite=none`
- ❌ **Trailing slashes** = `https://example.com` ≠ `https://example.com/` (exact match required)

---

## Part 2: How These Technologies Interact

### 1. **CORS (Cross-Origin Resource Sharing)**

```javascript
// Your backend CORS config
cors({
  origin: "https://sydney-event.vercel.app",  // ✅ Exact match
  credentials: true  // ✅ Allow cookies in requests
})
```

**Why `credentials: true` matters:**
- Tells browser: "Yes, it's OK to send cookies with this cross-origin request"
- Without it: browser blocks all cookies, even if frontend tries to send them

**Common mistake:**
```javascript
// ❌ WRONG - trailing slash causes mismatch
origin: "https://sydney-event.vercel.app/"

// ❌ WRONG - wildcard with credentials not allowed
origin: "*",
credentials: true

// ✅ CORRECT - exact domain match, no trailing slash
origin: "https://sydney-event.vercel.app"
```

---

### 2. **Session Cookies & SameSite Policy**

**The Three SameSite Values:**

| Value | Localhost | HTTPS Cross-Domain | Use Case |
|-------|-----------|-------------------|----------|
| `Lax` (default) | ✅ Works | ❌ **Blocked** | Development only |
| `Strict` | ✅ Works | ❌ **Blocked** | Never sent cross-origin |
| `None` | ✅ Works | ✅ **Works** | Cross-domain required |

**Why `sameSite=None` in production:**

```javascript
// ❌ PRODUCTION FAILURE
cookie: {
  httpOnly: true,
  sameSite: "lax",        // Browser blocks this cross-domain
  secure: false           // HTTP only
}

// ✅ PRODUCTION SUCCESS
cookie: {
  httpOnly: true,
  sameSite: "none",       // Allows cross-domain
  secure: true            // Required with "none"
}
```

**Why `secure=true` is mandatory with `sameSite=none`:**
- Browsers say: "If you're sending cookies across domains, they MUST be encrypted (HTTPS)"
- This prevents man-in-the-middle attacks on cookie data

---

### 3. **OAuth Flow with Cookies**

**Correct OAuth Flow:**

```
1. Frontend: window.location.href = "https://backend.com/auth/google"
                                    ↓
2. Backend redirects to Google OAuth consent screen
                                    ↓
3. User approves → Google redirects to /auth/google/callback
                                    ↓
4. Backend creates session + sets cookie
   res.cookie('sessionId', token, {
     httpOnly: true,
     sameSite: "none",
     secure: true
   })
                                    ↓
5. Backend redirects to frontend: window.location.href = "https://frontend.com"
                                    ↓
6. Browser stores cookie (because sameSite=none + secure=true + same origin)
                                    ↓
7. All subsequent requests send cookie automatically with credentials: true
```

**Why `fetch/axios` fails for OAuth:**

```javascript
// ❌ WRONG - browser blocks this
const response = await fetch("https://backend.com/auth/google")
// Problem: 
// - Fetch doesn't redirect, returns HTML
// - Cookie set by backend gets lost
// - Google OAuth redirect chain breaks

// ✅ CORRECT - full page redirect
window.location.href = "https://backend.com/auth/google"
// Problem solved:
// - Full redirect preserves OAuth flow
// - Cookie set by backend persists
// - User redirected back to frontend with session
```

---

### 4. **Cookie Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                     OAuth Redirect Flow                          │
└─────────────────────────────────────────────────────────────────┘

User clicks "Login with Google"
    ↓
window.location.href = "https://backend.com/auth/google"
    ↓
Browser navigates to backend (FULL PAGE REDIRECT)
    ↓
Backend route handler:
  - Redirects to Google OAuth
  - User authenticates with Google
  - Google redirects to /auth/google/callback
  ↓
Backend callback:
  - Validates Google token
  - Creates express-session entry in MongoDB
  - Sets session cookie:
    res.cookie('connect.sid', sessionId, {
      httpOnly: true,      // ✅ JS can't access (security)
      sameSite: "none",    // ✅ Allow cross-domain
      secure: true         // ✅ HTTPS only
    })
  - Redirects to frontend: window.location.href = "https://frontend.com"
  ↓
Browser navigates back to frontend
    ↓
Browser receives Set-Cookie header
    ↓
Browser stores cookie (sameSite=none + secure allows it)
    ↓
All future requests to backend:
  - Browser automatically includes cookie
  - axios({ headers: credentials: true })
  - Backend validates session from MongoDB
  - User authenticated!
```

---

## Part 3: Best Practices for Future Deployments

### 1. **Use Environment Variables (Never Hardcode)**

```javascript
// ✅ backend/.env (render)
CLIENT_URL=https://sydney-event.vercel.app
SESSION_SECRET=your-super-secret-key
MONGODB_URI=your-mongo-uri
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://sydney-event.onrender.com/auth/google/callback

// ✅ frontend/.env (vercel)
VITE_API_URL=https://sydney-event.onrender.com
```

**Never commit secrets!** Use `.gitignore`:
```
.env
.env.local
.env.*.local
```

### 2. **Separate Configs for Development vs Production**

```javascript
// backend/src/config/cors.js
const getCorsConfig = () => {
  const isDev = process.env.NODE_ENV !== "production";
  
  return {
    origin: isDev ? "http://localhost:5173" : process.env.CLIENT_URL,
    credentials: true,
  };
};

// backend/src/config/session.js
const getSessionConfig = () => {
  const isDev = process.env.NODE_ENV !== "production";
  
  return {
    cookie: {
      httpOnly: true,
      sameSite: isDev ? "lax" : "none",
      secure: !isDev,  // true in production, false in dev
      maxAge: 1000 * 60 * 60 * 24,
    },
  };
};
```

### 3. **Deployment Checklist**

Before pushing to Render/Vercel:

```markdown
## Backend (Render)
- [ ] NODE_ENV=production set
- [ ] CLIENT_URL matches Vercel domain (no trailing slash)
- [ ] sameSite=none, secure=true for HTTPS
- [ ] MONGODB_URI points to production database
- [ ] GOOGLE_CALLBACK_URL matches callback route
- [ ] SESSION_SECRET set to random string
- [ ] Run: npm run build (if applicable)

## Frontend (Vercel)
- [ ] VITE_API_URL matches Render domain (no trailing slash)
- [ ] No hardcoded localhost URLs in code
- [ ] All API calls use axios/fetch with credentials
- [ ] OAuth redirects use window.location.href

## Google Cloud Console
- [ ] Authorized JavaScript origins: https://sydney-event.vercel.app
- [ ] Authorized redirect URIs: https://sydney-event.onrender.com/auth/google/callback
```

### 4. **Debugging Production Issues**

**When auth fails in production:**

```javascript
// 1. Check CORS headers in browser DevTools → Network tab
// Look for: Access-Control-Allow-Credentials: true

// 2. Check if cookie is being set
// DevTools → Application → Cookies → Check if sessionId exists

// 3. Add debug logging
app.use((req, res, next) => {
  console.log("Request origin:", req.get("origin"));
  console.log("Client URL:", process.env.CLIENT_URL);
  console.log("Cookie setting:", req.cookies);
  next();
});

// 4. Test the endpoints directly
// curl -X GET https://backend.com/api/events -H "Origin: https://frontend.com"
```

### 5. **Session Persistence Across Deployments**

Use MongoDB for session store (you already do this):

```javascript
// ✅ CORRECT - sessions survive redeploys
const MongoStore = require("connect-mongo");

app.use(
  session({
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI 
    }),
    // ...
  })
);

// ❌ WRONG - sessions lost on redeploy (memory store)
// app.use(session({ store: new MemoryStore() }))
```

### 6. **Security Headers**

Add additional headers for production:

```javascript
const helmet = require("helmet");

app.use(helmet());  // Sets security headers

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

---

## Part 4: Common Pitfalls & Solutions

| Issue | Symptom | Cause | Fix |
|-------|---------|-------|-----|
| CORS blocked | "No 'Access-Control-Allow-Origin'" | Origin mismatch or missing `credentials` | Check exact domain, add trailing slash match |
| Cookies not sent | Fetch works, session undefined | `credentials: true` missing | Add to axios/fetch requests |
| Cookies not stored | No Set-Cookie header received | `sameSite=lax` on HTTPS | Use `sameSite=none, secure=true` |
| OAuth state mismatch | "Invalid state parameter" | Redirect uses fetch instead of window.location | Use `window.location.href` |
| Session lost on reload | User logged in, then logged out | Using memory store | Use MongoDB MongoStore |
| Trailing slash mismatch | CORS works on one domain, not another | `https://example.com/` vs `https://example.com` | Never use trailing slash in origin |

---

## Summary: The 5 Critical Rules

1. **CORS origin must be exact**: No trailing slashes, case-sensitive domain matching
2. **sameSite=none requires secure=true**: Never use "none" on HTTP
3. **OAuth requires full redirect**: Use `window.location.href`, not fetch
4. **Environment variables**: Separate dev/prod configs
5. **Session store persistence**: Use MongoDB, never memory store

---

## Testing Locally Before Deployment

```bash
# Simulate production locally
# 1. Update backend .env
CLIENT_URL=http://localhost:3000
NODE_ENV=production
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# 2. Update frontend .env
VITE_API_URL=http://localhost:5000

# 3. Update Google Console (local)
# Authorized origins: http://localhost:3000
# Redirect URI: http://localhost:5000/auth/google/callback

# 4. Test
npm run dev (both frontend and backend)

# 5. Test OAuth flow
# Open http://localhost:3000
# Click login → should redirect to http://localhost:5000/auth/google
# Complete auth → should return to http://localhost:3000 with session
```

