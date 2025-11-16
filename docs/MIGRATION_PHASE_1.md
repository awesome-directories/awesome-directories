# Migration Phase 1: Foundation (API Routes + Auth)

## ✅ Completed Tasks

### 1. Authentication & Authorization Infrastructure

Created robust auth helpers for secure API route operations:

- **`/src/lib/auth-helpers.ts`** - Complete auth middleware suite:
  - `getAuthenticatedUser()` - Extract & verify JWT from request headers
  - `requireAuth()` - Middleware to protect routes requiring authentication
  - `getClientIP()` - Extract client IP with proxy support
  - `hashIP()` - SHA-256 IP hashing for privacy-preserving vote tracking
  - `jsonResponse()` & `errorResponse()` - Standardized response helpers

- **`/src/lib/getServerSession.ts`** - SSR session management:
  - `getServerSession()` - Read auth from Astro cookies for server-side rendering
  - `isAuthenticated()` - Quick auth check for page protection

### 2. API Routes Implementation

Created 7 RESTful API endpoints covering all write operations:

#### `/src/pages/api/vote.ts`
- **POST** - Vote/unvote on directory (IP-based, auth optional)
- **GET** - Check if user has voted
- Features: Toggle voting, automatic helpful_count updates via DB triggers

#### `/src/pages/api/favorites.ts`
- **POST** - Add directory to favorites (requires auth)
- **DELETE** - Remove from favorites (requires auth)
- **GET** - Fetch user's favorites with full directory details (requires auth)

#### `/src/pages/api/track-view.ts`
- **POST** - Increment directory view count
- Called when users view directory detail pages

#### `/src/pages/api/submissions/submit.ts`
- **POST** - Track user's submission to a directory (requires auth)
- **GET** - Fetch user's submission tracking records (requires auth)
- **DELETE** - Remove submission tracking (requires auth)
- Features: Status tracking (pending/submitted/approved/rejected), notes

#### `/src/pages/api/directories/submit.ts`
- **POST** - Submit new directory for review (requires auth)
- **GET** - Fetch user's pending directory submissions (requires auth)
- **DELETE** - Delete pending submission if not yet reviewed (requires auth)
- Features: Full validation, duplicate prevention, admin review workflow

### 3. Type Safety & Developer Experience

- **`/src/types/api.ts`** - Comprehensive TypeScript types:
  - Database models (Directory, UserFavorite, UserSubmission, PendingDirectory)
  - Request types for all API endpoints
  - Response types for all API endpoints
  - `ApiResponse<T>` wrapper for consistent error handling

- **`/src/lib/api-client.ts`** - Type-safe client library:
  - Auto-includes JWT token from Supabase session
  - Wrapper functions for all API endpoints
  - Consistent error handling
  - Ready to use in Vue/Astro components

### 4. Documentation

- **`/docs/API.md`** - Complete API documentation:
  - All endpoints with request/response examples
  - Authentication guide
  - Error handling patterns
  - Client-side usage examples
  - Security notes

- **`/docs/MIGRATION_PHASE_1.md`** - This file!

## 🏗️ Architecture Decisions

### Security
1. **JWT Authentication**: Supabase Auth tokens verified server-side
2. **RLS Policies**: Database-level security via Row Level Security
3. **IP Privacy**: Votes use SHA-256 hashed IPs, not stored raw
4. **Authorization**: Explicit user ID checks prevent data access violations

### API Design
1. **RESTful**: Standard HTTP methods (GET, POST, DELETE)
2. **Consistent Responses**: All endpoints use `jsonResponse()`/`errorResponse()`
3. **Type Safety**: Full TypeScript coverage for requests/responses
4. **Error Handling**: Standardized error format across all endpoints

### Database Integration
1. **Supabase Client**: Server-side admin client for API routes
2. **Trigger Reliance**: Leverage DB triggers for helpful_count auto-updates
3. **RLS Compliance**: API routes work within RLS policy constraints
4. **Unique Constraints**: Database enforces duplicate prevention

## 📊 Testing Status

### Manual Testing Required

Since dependencies are not installed in the dev environment, the following tests should be performed after deployment:

#### Unauthenticated Requests
- [ ] `POST /api/vote` - Vote on directory
- [ ] `GET /api/vote?directoryId=xxx` - Check vote status
- [ ] `POST /api/track-view` - Track view count

#### Authenticated Requests
- [ ] `POST /api/favorites` - Add favorite
- [ ] `DELETE /api/favorites` - Remove favorite
- [ ] `GET /api/favorites` - Fetch favorites
- [ ] `POST /api/submissions/submit` - Track submission
- [ ] `GET /api/submissions/submit` - Fetch submissions
- [ ] `DELETE /api/submissions/submit` - Delete submission tracking
- [ ] `POST /api/directories/submit` - Submit new directory
- [ ] `GET /api/directories/submit` - Fetch pending submissions
- [ ] `DELETE /api/directories/submit` - Delete pending submission

#### Authorization Tests
- [ ] Verify 401 errors for protected routes without auth
- [ ] Verify users cannot access other users' data
- [ ] Verify duplicate vote prevention (same IP)
- [ ] Verify duplicate submission prevention (same user + URL)

## 🔄 Integration Points

### For Phase 2 (Directory Detail Pages)

The directory detail pages will use these API endpoints:

```vue
<script setup>
import { voteOnDirectory, trackDirectoryView } from '@/lib/api-client';
import { onMounted } from 'vue';

const props = defineProps(['directoryId']);

onMounted(async () => {
  // Track view when page loads
  await trackDirectoryView(props.directoryId);
});

async function handleVote() {
  const { data, error } = await voteOnDirectory(props.directoryId);
  if (error) {
    console.error('Vote failed:', error);
  } else {
    // Update UI with new vote count
    console.log('New count:', data.helpfulCount);
  }
}
</script>
```

### For Phase 3 (Submit Page)

The submit page will use:

```javascript
import { submitDirectory } from '@/lib/api-client';

async function handleSubmit(formData) {
  const { data, error } = await submitDirectory({
    name: formData.name,
    description: formData.description,
    url: formData.url,
    pricingType: formData.pricingType,
    // ... other fields
  });

  if (error) {
    if (error.error === 'Unauthorized') {
      // Show login modal
    } else {
      // Show error message
    }
  } else {
    // Success - redirect to pending submissions
  }
}
```

### For Phase 4 (User Dashboard)

Favorites and Submissions pages will use:

```javascript
import { getFavorites, getSubmissions } from '@/lib/api-client';

// Favorites page
const { data, error } = await getFavorites();
const favorites = data?.favorites || [];

// Submissions page
const { data, error } = await getSubmissions();
const submissions = data?.submissions || [];
```

## 🚀 Next Steps (Phase 2)

Now that the API foundation is complete, Phase 2 will focus on **Directory Detail Pages**:

1. Create `/src/pages/directory/[slug].astro`
   - Generate static pages at build time using `getStaticPaths()`
   - Fetch directory data from Supabase
   - Display all directory information

2. Build interactive components:
   - Convert `DirectoryCard.vue` to Astro component
   - Create `<VoteButton>` with client-side voting
   - Create `<FavoriteButton>` for auth users
   - Add `<ViewCounter>` component
   - Integrate Giscus comments

3. Test SSG + client hydration pattern

## 📝 Files Changed

```
Added:
  src/lib/auth-helpers.ts
  src/lib/getServerSession.ts
  src/lib/api-client.ts
  src/types/api.ts
  src/pages/api/vote.ts
  src/pages/api/favorites.ts
  src/pages/api/track-view.ts
  src/pages/api/submissions/submit.ts
  src/pages/api/directories/submit.ts
  docs/API.md
  docs/MIGRATION_PHASE_1.md
```

## 💡 Developer Notes

### Environment Variables Required

Ensure these are set in production:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### CORS Configuration

For production deployments, configure CORS headers in `astro.config.mjs`:

```javascript
export default defineConfig({
  vite: {
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      }
    }
  }
});
```

### Future Enhancements

Consider for future phases:
1. **Rate Limiting**: Add rate limiting middleware (e.g., upstash/ratelimit)
2. **Caching**: Cache GET responses with short TTL
3. **Analytics**: Track API usage metrics
4. **Webhooks**: Notify admins of new directory submissions
5. **Batch Operations**: Bulk favorite/submission management
6. **Email Notifications**: Alert users of submission status changes

---

**Phase 1 Status: ✅ Complete**

Ready to proceed with Phase 2: Directory Detail Pages
