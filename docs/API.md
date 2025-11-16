# API Documentation

This document describes the API routes available in the Awesome Directories application.

## Authentication

Most write operations require authentication. The API uses Supabase Auth with JWT tokens.

### How to authenticate:

1. Client-side: Include the JWT token in the `Authorization` header
2. The token is automatically retrieved from Supabase session
3. Use the provided `api-client.ts` helper functions for automatic auth handling

```javascript
// Example: Making an authenticated request
const { data, error } = await addFavorite(directoryId);
```

## API Endpoints

### Vote API

#### `POST /api/vote`

Vote (or unvote) on a directory. Voting is based on IP hash, so users can vote without authentication.

**Request Body:**
```json
{
  "directoryId": "uuid"
}
```

**Response:**
```json
{
  "voted": true,
  "helpfulCount": 42
}
```

**Status Codes:**
- `200`: Success (vote toggled)
- `400`: Missing directoryId
- `500`: Server error

#### `GET /api/vote?directoryId=xxx`

Check if the current user/IP has voted on a directory.

**Response:**
```json
{
  "voted": true
}
```

---

### View Tracking API

#### `POST /api/track-view`

Increment the view count for a directory. Called when viewing a directory detail page.

**Request Body:**
```json
{
  "directoryId": "uuid"
}
```

**Response:**
```json
{
  "viewCount": 123
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing directoryId
- `500`: Server error

---

### Favorites API

All favorites endpoints require authentication.

#### `POST /api/favorites`

Add a directory to user's favorites.

**Request Body:**
```json
{
  "directoryId": "uuid"
}
```

**Response:**
```json
{
  "favorited": true
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Missing directoryId
- `401`: Not authenticated
- `409`: Already in favorites
- `500`: Server error

#### `DELETE /api/favorites`

Remove a directory from user's favorites.

**Request Body:**
```json
{
  "directoryId": "uuid"
}
```

**Response:**
```json
{
  "favorited": false
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing directoryId
- `401`: Not authenticated
- `500`: Server error

#### `GET /api/favorites`

Get user's favorite directories.

**Response:**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T12:00:00Z",
      "directory": {
        "id": "uuid",
        "slug": "product-hunt",
        "name": "Product Hunt",
        "description": "...",
        "url": "https://producthunt.com",
        "logo_url": "...",
        "domain_rating": 92,
        "is_dofollow": true,
        "categories": ["SaaS", "Startups"],
        "pricing_type": "freemium",
        "pricing_amount": 299,
        "traffic_estimate": "high",
        "avg_approval_days": 1,
        "submission_url": "...",
        "helpful_count": 42,
        "view_count": 1523
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

### Submission Tracking API

Track user's submissions to directories. Requires authentication.

#### `POST /api/submissions/submit`

Track a submission to a directory.

**Request Body:**
```json
{
  "directoryId": "uuid",
  "status": "submitted",
  "notes": "Submitted on 2024-01-15"
}
```

**Fields:**
- `directoryId` (required): Directory UUID
- `status` (optional): One of `pending`, `submitted`, `approved`, `rejected`. Default: `pending`
- `notes` (optional): User notes about the submission

**Response:**
```json
{
  "submission": {
    "id": "uuid",
    "user_id": "uuid",
    "directory_id": "uuid",
    "status": "submitted",
    "submitted_at": "2024-01-15T12:00:00Z",
    "notes": "Submitted on 2024-01-15"
  }
}
```

**Status Codes:**
- `200`: Updated existing submission
- `201`: Created new submission
- `400`: Invalid data
- `401`: Not authenticated
- `500`: Server error

#### `GET /api/submissions/submit`

Get user's submission tracking records.

**Response:**
```json
{
  "submissions": [
    {
      "id": "uuid",
      "status": "approved",
      "submitted_at": "2024-01-15T12:00:00Z",
      "notes": "...",
      "directory": {
        "id": "uuid",
        "slug": "product-hunt",
        "name": "Product Hunt",
        "description": "...",
        "url": "...",
        "logo_url": "...",
        "submission_url": "...",
        "avg_approval_days": 1
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

#### `DELETE /api/submissions/submit`

Delete a submission tracking record.

**Request Body:**
```json
{
  "directoryId": "uuid"
}
```

**Response:**
```json
{
  "deleted": true
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing directoryId
- `401`: Not authenticated
- `500`: Server error

---

### Directory Submission API

Submit new directories for review. Requires authentication.

#### `POST /api/directories/submit`

Submit a new directory for admin review.

**Request Body:**
```json
{
  "name": "Product Hunt",
  "description": "Launch and discover new products",
  "url": "https://producthunt.com",
  "logoUrl": "https://...",
  "categories": ["SaaS", "Startups"],
  "pricingType": "freemium",
  "pricingAmount": 299,
  "submissionUrl": "https://producthunt.com/submit",
  "trafficEstimate": "high",
  "avgApprovalDays": 1,
  "domainRating": 92,
  "isDofollow": true
}
```

**Required Fields:**
- `name`: Directory name
- `description`: Directory description
- `url`: Directory URL
- `pricingType`: One of `free`, `paid`, `freemium`

**Optional Fields:**
- `logoUrl`: URL to logo image
- `categories`: Array of category strings
- `pricingAmount`: Price in cents (for paid/freemium)
- `submissionUrl`: URL to submit form
- `trafficEstimate`: One of `high`, `medium`, `low`
- `avgApprovalDays`: Average days to approval
- `domainRating`: Ahrefs DR score
- `isDofollow`: Whether links are dofollow

**Response:**
```json
{
  "pendingDirectory": {
    "id": "uuid",
    "user_id": "uuid",
    "user_email": "user@example.com",
    "name": "Product Hunt",
    "description": "...",
    "url": "https://producthunt.com",
    "status": "pending",
    "submitted_at": "2024-01-15T12:00:00Z",
    ...
  }
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Invalid data
- `401`: Not authenticated
- `409`: URL already submitted by user
- `500`: Server error

#### `GET /api/directories/submit`

Get user's pending directory submissions.

**Response:**
```json
{
  "pendingDirectories": [
    {
      "id": "uuid",
      "name": "Product Hunt",
      "url": "https://producthunt.com",
      "status": "pending",
      "submitted_at": "2024-01-15T12:00:00Z",
      "admin_notes": null,
      ...
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

#### `DELETE /api/directories/submit`

Delete a pending directory submission (only if status is `pending`).

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "deleted": true
}
```

**Status Codes:**
- `200`: Success
- `400`: Cannot delete (already reviewed) or missing id
- `401`: Not authenticated
- `403`: Not authorized (not your submission)
- `404`: Not found
- `500`: Server error

---

## Client-Side Helper Functions

Use the provided helper functions in `src/lib/api-client.ts`:

```javascript
import {
  voteOnDirectory,
  checkVoteStatus,
  trackDirectoryView,
  addFavorite,
  removeFavorite,
  getFavorites,
  trackSubmission,
  getSubmissions,
  deleteSubmission,
  submitDirectory,
  getPendingDirectories,
  deletePendingDirectory,
} from '@/lib/api-client';

// Example: Vote on a directory
const { data, error } = await voteOnDirectory('directory-uuid');
if (error) {
  console.error('Failed to vote:', error);
} else {
  console.log('Vote status:', data.voted);
  console.log('Helpful count:', data.helpfulCount);
}

// Example: Add to favorites (requires auth)
const result = await addFavorite('directory-uuid');
if (result.error) {
  if (result.error.error === 'Unauthorized') {
    // Show login modal
  }
}
```

## Error Handling

All API endpoints return errors in the following format:

```json
{
  "error": "Error type",
  "message": "Detailed error message (optional)"
}
```

Common error types:
- `Unauthorized`: User not authenticated
- `Missing required field`: Request data incomplete
- `Invalid status`: Invalid enum value
- `Internal server error`: Server-side error

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production:
- Vote API: Prevent spam voting
- Submission API: Prevent abuse
- View tracking: Prevent count inflation

## Security

1. **RLS Policies**: Database has Row Level Security enabled
2. **JWT Verification**: API routes verify Supabase JWT tokens
3. **IP Hashing**: Vote IPs are hashed for privacy (SHA-256)
4. **CORS**: Configure CORS headers for production
5. **Input Validation**: All endpoints validate input data

## Testing

To test the API endpoints:

1. Start the development server: `npm run start`
2. Use a tool like Postman, curl, or the browser console
3. For authenticated endpoints, include the JWT token:

```bash
# Get JWT token from browser console
const { data: { session } } = await supabase.auth.getSession();
console.log(session.access_token);

# Use in curl
curl -X POST https://your-domain.com/api/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"directoryId": "uuid"}'
```
