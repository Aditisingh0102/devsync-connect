# Frontend Knowledge Base for Backend Integration

## Executive Overview

**DevSync** is a student-focused collaboration and team-matching platform. It enables technical builders to discover collaborators, form balanced teams, manage projects, and apply for roles. Currently, the frontend uses client-side state management with local storage persistence; however, it is architected to transition seamlessly to a backend API.

**Current Architecture**: Client-side React + Context API (mimicking a relational database)  
**Tech Stack**: React 18.3, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack React Query  
**Authentication**: Currently username/email + password (client-side validation; **no real authentication**—backend must implement JWT/OAuth)

---

## 1. Project Overview

### 1.1 Tech Stack & Framework

| Component | Library/Tool | Version |
|-----------|------------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Language** | TypeScript | 5.8.3 |
| **Build Tool** | Vite | 5.4.19 |
| **Router** | React Router DOM | 6.30.1 |
| **State Management** | React Context + useReducer | Built-in |
| **UI Component Library** | Radix UI + Shadcn | Latest |
| **Styling** | Tailwind CSS | 3.4.17 |
| **Form Handling** | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| **Data Fetching** | TanStack React Query | 5.83.0 |
| **Charting** | Recharts | 2.15.4 |
| **3D Graphics** | Three.js | 0.160.0 |
| **Icons** | Lucide React | 0.462.0 |
| **Notifications** | Sonner | 1.7.4 |
| **Testing** | Vitest + React Testing Library | 3.2.4 / 16.0.0 |

### 1.2 Architecture Pattern

- **Component-Based Architecture**: Modular React components organized by type (pages, components, UI primitives)
- **Client-Side State Management**: React Context API with a custom reducer (AppProvider in [src/lib/store.tsx](src/lib/store.tsx))
- **Local Storage Persistence**: State automatically persists to `localStorage` under key `devsync_app_state_v3`
- **No Backend API Integration**: Currently, all data operations are client-side; **backend integration required for production**

### 1.3 Project Structure

```
src/
├── components/               # Reusable presentation components
│   ├── ui/                  # Radix + Shadcn UI primitives
│   ├── ApplyRoleModal.tsx   # Role application with resume upload
│   ├── AvatarUpload.tsx     # Base64 avatar image encoder
│   ├── CreatePostModal.tsx  # Post creation for collaboration feed
│   ├── CreatePostModal.tsx  # Post creation for collaboration feed
│   ├── EditProjectModal.tsx # Project edit overlay
│   ├── ErrorBoundary.tsx    # Error fallback UI
│   ├── Feed.tsx             # Collaboration feed with filters
│   ├── Hero3D.tsx           # Landing page WebGL 3D network
│   ├── Layout.tsx           # Main app shell (Navbar, Footer, outlet)
│   ├── Navbar.tsx           # Top navigation bar
│   ├── PostCard.tsx         # Individual post card UI
│   ├── ProjectCard.tsx      # Individual project card UI
│   ├── UserFollowButton.tsx # Follow/unfollow action button
│   └── theme-provider.tsx   # Dark mode theme switching
├── pages/                    # Route-level page components
│   ├── Dashboard.tsx        # Analytics & overview dashboard
│   ├── DiscoverBuilders.tsx # Search builders by skills
│   ├── EditProfilePage.jsx  # Profile edit form
│   ├── FeedPage.tsx         # Collaboration feed page
│   ├── FindProjects.tsx     # Discover projects
│   ├── Index.tsx            # Landing home page
│   ├── Login.tsx            # Authentication page
│   ├── MyProjects.tsx       # User's owned projects
│   ├── MyTeam.tsx           # Team dashboard (for future team features)
│   ├── Notifications.tsx    # Notification feed
│   ├── Onboarding.tsx       # Multi-step profile setup wizard
│   ├── PostPage.tsx         # Single post detail view
│   ├── Profile.tsx          # User profile + activity heatmap
│   ├── ProjectDetail.tsx    # Project detail with roles & tasks
│   ├── Requests.tsx         # Collaboration request inbox
│   ├── Reviews.tsx          # Peer reviews (placeholder)
│   ├── Settings.tsx         # User preferences & account settings
│   ├── Signup.tsx           # Account creation
│   └── TeamDetail.tsx       # Team workspace (future)
├── data/
│   └── mock.ts              # Demo data: users, projects, teams
├── hooks/
│   ├── use-mobile.tsx       # Mobile viewport detection
│   └── use-toast.ts         # Toast notification trigger
├── lib/
│   ├── store.tsx            # AppProvider, reducer, actions
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions (cn, merge classes)
├── utils/
│   └── keyboardAccessibility.ts  # Accessibility utilities
├── App.tsx                   # Route registry & provider setup
├── index.css                # Global styles, theme variables
└── main.tsx                 # Entry point

```

---

## 2. Data Models & Types

All TypeScript interfaces are defined in [src/lib/types.ts](src/lib/types.ts). Here is the complete schema:

### 2.1 User Type

```typescript
type User = {
  id: ID;                           // Unique identifier (format: u_<timestamp> on client)
  name: string;                     // Full name
  username?: string;                // Unique username for login
  email?: string;                   // Email address
  password?: string;                // **Client-side only; backend must hash & never expose**
  handle?: string;                  // Display handle (e.g., @username)
  avatar?: string;                  // Base64 image data URI or URL
  bio?: string;                     // Short bio/description
  college?: string;                 // College/university affiliation
  skills?: string[];                // Array of technical skills (e.g., ["React", "Python", "Node.js"])
  roles?: string[];                 // Preferred roles (e.g., ["Frontend Dev", "Full Stack"])
  domains?: string[];               // Interest domains (e.g., ["Web", "AI/ML", "DevOps"])
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  followers?: ID[];                 // Array of follower user IDs
  following?: ID[];                 // Array of user IDs being followed
  pendingRequests?: ID[];           // Incoming collaboration request IDs
  sentRequests?: ID[];              // Outgoing collaboration request IDs
  profileCompleted?: boolean;       // Onboarding completion flag
  savedPosts?: ID[];                // Bookmarked post IDs
  savedBuilders?: ID[];             // Bookmarked builder IDs
  accountStatus?: "active" | "pending_deletion";   // Account deletion status
  deactivatedAt?: string;           // ISO timestamp for scheduled deletion
  loginHistory?: Record<string, number>;  // { "YYYY-MM-DD": loginCount } for activity heatmap
  preferences?: {
    profileVisibility?: "public" | "team-only" | "private";
    emailNotifications?: boolean;
    collaborationAlerts?: boolean;
    discoverable?: boolean;
    teamInviteNotifications?: boolean;
  };
};
```

**Backend Notes:**
- `password` must never be exposed; hash using bcrypt/argon2.
- `loginHistory` is client-generated for the profile heatmap; backend should generate from server logs.
- `pendingRequests` and `sentRequests` maintain relationship edges; normalize in backend as a separate `requests` table.
- `followers`, `following`, `savedPosts`, `savedBuilders` should be computed/queried via joins, not stored as arrays.

### 2.2 Post Type

```typescript
type PostType =
  | "Looking for Team"
  | "Seeking Contributor"
  | "Open to Join"
  | "Project Update"
  | "Hiring for Hackathon"
  | "Final Year Project Need"
  | "Open Source Collaboration"
  | "Resource Share";

type Post = {
  id: ID;                    // Unique post ID (format: p_<timestamp>)
  authorId: ID;              // Author user ID
  title: string;             // Post title
  body: string;              // Post content/description
  type: PostType;            // Post category
  domain?: string | string[]; // Domain (e.g., "Frontend", "AI/ML")
  tech?: string[];           // Technology stack
  projectType?: string;      // Project category (e.g., "Hackathon", "Open Source")
  projectName?: string;      // Associated project name
  lookingFor?: string | string[];  // Roles/skills looking for
  imageUrl?: string;         // Embedded image URL
  referenceLink?: string;    // External reference URL
  createdAt: string;         // ISO timestamp
  status?: "open" | "closed" | "filled";  // Post status
  visibility?: "public" | "private" | "friends";  // Post visibility
  responses?: ID[];          // Array of response IDs
};
```

**Backend Notes:**
- `responses` should be normalized as a separate `responses` table with foreign key to `postId`.
- `visibility` enables privacy controls; filter responses based on logged-in user relationships.
- Auto-generate `createdAt` server-side with `CURRENT_TIMESTAMP`.

### 2.3 Project Type

```typescript
type Project = {
  id: ID;                    // Unique project ID (format: proj_<id>)
  title: string;             // Project name
  owner: string;             // Owner name (denormalized; should reference ownerId in backend)
  ownerId?: ID;              // Owner user ID (reference to User.id)
  team: string;              // Team name (e.g., "Product Team Alpha")
  description: string;       // Project description
  tech: string[];            // Technology stack
  roles: string[];           // Open roles/positions
  members: number;           // Current member count
  maxMembers: number;        // Maximum allowed members
  memberIds?: ID[];          // Array of member user IDs
  progress: number;          // Progress percentage (0-100)
  status: "Recruiting" | "In Progress" | "Completed";
  category: string;          // Project category (e.g., "Web", "AI", "Mobile")
  visibility?: "public" | "private" | "friends";  // Project visibility
  bookmarked?: boolean;      // Client-side bookmark flag (transient)
};
```

**Backend Notes:**
- `memberIds` should be stored/queried via a `project_members` junction table.
- `visibility` controls project discovery; backend must enforce ACL checks.
- `bookmarked` is user-specific and transient; store separately per user.

### 2.4 Request Type (Collaboration Request)

```typescript
type Request = {
  id: ID;                    // Unique request ID
  fromId: ID;                // Requester user ID
  toId: ID;                  // Target user/project owner ID
  message?: string;          // Cover letter/message
  status: "pending" | "accepted" | "declined";
  createdAt: string;         // ISO timestamp
  role?: string;             // Requested role (e.g., "Frontend Dev")
  resume?: string;           // Base64 resume data URI or S3 URL
  resumeName?: string;       // Original resume filename
  skills?: string[];         // Applicant's skills at time of request
  projectId?: ID;            // Associated project ID (if applicable)
};
```

**Backend Notes:**
- `resume` should store S3 presigned URL, not base64 data.
- Implement transaction: on `status = "accepted"`, auto-add `fromId` to project's `memberIds` and update `project.members` count.
- `projectId` is optional; handle both personal collaboration and role-specific applications.

### 2.5 Response Type (Post Response)

```typescript
type Response = {
  id: ID;                    // Unique response ID
  postId: ID;                // Parent post ID
  fromId: ID;                // Responder user ID
  toId?: ID;                 // Target user ID (optional)
  message: string;           // Response message
  skillsSummary?: string[];  // Responder's relevant skills
  resumeUrl?: string;        // Resume URL
  createdAt: string;         // ISO timestamp
  status?: "pending" | "accepted" | "declined";
};
```

### 2.6 Review Type (Peer Review)

```typescript
type Review = {
  id: ID;                    // Unique review ID
  reviewerId?: ID;           // Reviewer user ID
  authorId?: ID;             // Review author ID
  subjectId: ID;             // Subject (person/project reviewed)
  projectId?: ID;            // Associated project
  rating: number;            // Rating (1-5 stars)
  text?: string;             // Review text
  createdAt: string;         // ISO timestamp
};
```

### 2.7 Notification Type

```typescript
type AppNotification = {
  id: ID;
  type: "invite" | "project" | "task" | "system" | "request" | "follow" | "review";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;             // Link to navigate to (e.g., "/profile/<id>")
  userId?: ID;               // Recipient user ID
};
```

---

## 3. State Management & Data Flow

### 3.1 AppState Structure

The entire application state is centralized in [src/lib/store.tsx](src/lib/store.tsx):

```typescript
type AppState = {
  currentUser?: User;                    // Logged-in user
  users: Record<ID, User>;               // All users (user ID → User)
  posts: Record<ID, Post>;               // All posts (post ID → Post)
  projects: Record<ID, Project>;         // All projects (project ID → Project)
  responses: Record<ID, Response>;       // All post responses
  reviews: Record<ID, Review>;           // All reviews
  requests: Record<ID, Request>;         // All collaboration requests
  notifications: Record<ID, AppNotification>;  // All notifications
};
```

**Backend Translation**: These are normalized records; backend will store as relational tables with foreign keys.

### 3.2 Actions & Reducer

All state mutations are dispatched via a reducer with the following action types:

```typescript
type AppAction =
  | { type: "setCurrentUser"; payload?: User }
  | { type: "createPost"; payload: Post }
  | { type: "createResponse"; payload: Response }
  | { type: "follow"; payload: { fromId: ID; toId: ID } }
  | { type: "unfollow"; payload: { fromId: ID; toId: ID } }
  | { type: "sendRequest"; payload: Request }
  | { type: "updateRequest"; payload: { id: ID; status: "pending" | "accepted" | "declined" } }
  | { type: "updateUser"; payload: User }
  | { type: "updateProject"; payload: Project }
  | { type: "deleteProject"; payload: ID }
  | { type: "createNotification"; payload: AppNotification }
  | { type: "markNotificationRead"; payload: ID };
```

### 3.3 Key Action Logic (Backend Equivalent)

| Action | Frontend Logic | Backend Endpoint |
|--------|---|---|
| **setCurrentUser** | Validates credentials against `state.users`; if match, sets `currentUser` | `POST /api/auth/login` |
| **createPost** | Generates post ID, sets `createdAt`, appends to `posts` record | `POST /api/posts` |
| **sendRequest** | Creates request, stores base64 resume, appends to sender/receiver request lists | `POST /api/requests` (with multipart file upload) |
| **updateRequest** | Changes status; on accept, adds user to project members & increments count | `PATCH /api/requests/:id` (transactional) |
| **follow** | Appends `toId` to `fromId.following` and `fromId` to `toId.followers` | `POST /api/users/:id/follow` |
| **unfollow** | Removes from both arrays | `DELETE /api/users/:id/follow/:targetId` |
| **updateProject** | Patches project properties (title, status, progress, visibility) | `PATCH /api/projects/:id` |
| **deleteProject** | Deletes project and cascades deletion of associated posts | `DELETE /api/projects/:id` |

### 3.4 Persistence

- **Current**: State saved to `localStorage` under key `devsync_app_state_v3`
- **Backend Requirement**: Replace with HTTP API calls; localStorage becomes cache
- **Migration Strategy**: Add TanStack React Query to manage server state; dispatch actions only after API success

---

## 4. API Integration Details

### 4.1 Current State

The frontend currently has **no backend API integration**. All operations are client-side. The following section outlines **anticipated backend endpoints** for production migration.

### 4.2 Anticipated REST API Endpoints

#### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Alex Carter",
  "username": "alex_carter",
  "email": "alex@university.edu",
  "password": "SecurePass123!"
}

Response 201:
{
  "id": "u_1234567890",
  "name": "Alex Carter",
  "username": "alex_carter",
  "email": "alex@university.edu",
  "token": "eyJhbGc..."
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "alex_carter",  // username or email
  "password": "SecurePass123!"
}

Response 200:
{
  "id": "u_1234567890",
  "name": "Alex Carter",
  "username": "alex_carter",
  "email": "alex@university.edu",
  "profileCompleted": true,
  "token": "eyJhbGc..."
}

Errors:
- 401: Invalid credentials
- 404: User not found
```

#### Users

```http
GET /api/users
Response 200: Array<User>

GET /api/users/:id
Response 200: User

PATCH /api/users/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Alex Carter",
  "bio": "Full stack developer...",
  "skills": ["React", "Node.js"],
  "profileCompleted": true,
  "preferences": { "discoverable": true }
}

Response 200: User

DELETE /api/users/:id
Authorization: Bearer <token>
Response 204: No Content
```

#### Posts

```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Looking for Frontend Dev",
  "body": "Need a React developer for hackathon...",
  "type": "Looking for Team",
  "domain": "Frontend",
  "tech": ["React", "TypeScript"],
  "projectName": "HackPrep Planner",
  "visibility": "public"
}

Response 201: Post

GET /api/posts
Query: ?status=open&domain=Frontend&skip=0&limit=20
Response 200: { data: Array<Post>, total: number }

GET /api/posts/:id
Response 200: Post

PATCH /api/posts/:id
Authorization: Bearer <token>
Response 200: Post

DELETE /api/posts/:id
Authorization: Bearer <token>
Response 204: No Content
```

#### Projects

```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "DevSync Team Match AI",
  "description": "AI engine for matching...",
  "team": "Product Team Alpha",
  "tech": ["React", "FastAPI"],
  "roles": ["ML Engineer", "Backend Dev"],
  "maxMembers": 5,
  "category": "AI",
  "visibility": "public"
}

Response 201: Project

GET /api/projects
Query: ?category=Web&status=Recruiting&skip=0&limit=20
Response 200: { data: Array<Project>, total: number }

GET /api/projects/:id
Response 200: Project

PATCH /api/projects/:id
Authorization: Bearer <token>

{
  "progress": 75,
  "status": "In Progress",
  "members": 4
}

Response 200: Project

DELETE /api/projects/:id
Authorization: Bearer <token>
Response 204: No Content
```

#### Collaboration Requests

```http
POST /api/requests
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- projectId: "proj_123"
- fromId: "u_456"
- toId: "u_789"
- role: "Frontend Dev"
- message: "I'm very interested in this project..."
- skills: ["React", "CSS"]
- resume: <binary file>

Response 201: Request

GET /api/requests
Query: ?status=pending&toId=u_123
Response 200: Array<Request>

PATCH /api/requests/:id
Authorization: Bearer <token>

{
  "status": "accepted"
}

Response 200: Request
(Side effect: Update project.members count)

PATCH /api/requests/:id
{
  "status": "declined"
}

Response 200: Request
```

#### Followers

```http
POST /api/users/:id/follow
Authorization: Bearer <token>
Response 201: { followerId: ID, followeeId: ID }

DELETE /api/users/:id/follow/:targetId
Authorization: Bearer <token>
Response 204: No Content

GET /api/users/:id/followers
Response 200: Array<User>

GET /api/users/:id/following
Response 200: Array<User>
```

#### Search & Discovery

```http
GET /api/search
Query: ?q=alex&type=builder&domain=Web
Response 200: { builders: Array<User>, projects: Array<Project> }

GET /api/discover/builders
Query: ?skills=React&domain=Web&skip=0&limit=20
Response 200: { data: Array<User>, total: number }

GET /api/discover/projects
Query: ?userSkills=React,Node.js&skip=0&limit=20
Response 200: { data: Array<Project>, total: number, recommendations: Array<Project> }
```

### 4.3 Error Handling Patterns

**Frontend Expected Error Responses:**

```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate username/email
- `500 Internal Server Error` - Server error

### 4.4 Authentication & Authorization

**Current Frontend**: No authentication; client-side validation only.

**Backend Requirements**:
- **JWT Token**: Issue on login/register; expire after 24 hours
- **Refresh Token**: Optional; rotate on each request
- **Authorization Header**: `Authorization: Bearer <token>`
- **Protected Routes**: All POST/PATCH/DELETE endpoints require valid token
- **Role-Based Access Control (RBAC)**: Optional; currently not implemented

---

## 5. Routing & Navigation

### 5.1 Route Map

All routes are defined in [src/App.tsx](src/App.tsx) using React Router v6 with Hash-based routing:

| Route | Component | Purpose | Protected |
|-------|-----------|---------|-----------|
| `/` | Index | Landing/home page | No |
| `/dashboard` | Dashboard | User analytics & overview | Yes |
| `/feed` | FeedPage | Collaboration feed | No |
| `/post/:id` | PostPage | Single post detail | No |
| `/discover-builders` | DiscoverBuilders | Search builder directory | No |
| `/find-projects` | FindProjects | Discover projects | No |
| `/find-builders` | DiscoverBuilders | Alias for discover-builders | No |
| `/my-projects` | MyProjects | User's owned projects | Yes |
| `/my-team` | MyTeam | Team workspace (future) | Yes |
| `/profile` | Profile | Current user's profile | Yes |
| `/profile/:id` | Profile | Other user's profile | No |
| `/profile/edit` | EditProfilePage | Edit profile info | Yes |
| `/project/:id` | ProjectDetail | Project detail + roles | No |
| `/team/:id` | TeamDetail | Team workspace detail | No |
| `/requests` | Requests | Collaboration inbox | Yes |
| `/reviews` | Reviews | Peer reviews (placeholder) | Yes |
| `/settings` | Settings | Account preferences | Yes |
| `/notifications` | Notifications | Notification feed | Yes |
| `/onboarding/profile-setup` | Onboarding | Multi-step profile wizard | Yes |
| `/login` | Login | Sign in page | No |
| `/signup` | Signup | Create account page | No |
| `*` | NotFound | 404 page | No |

**Protected Routes**: In current client-side app, "protected" routes just check `currentUser` and redirect to `/login`. Backend must enforce this via token validation.

### 5.2 Navigation Patterns

- **Layout**: All pages except login/signup wrap in `<Layout>` component, which includes Navbar and Footer
- **Hash-Based Routing**: `HashRouter` enables GitHub Pages deployment; use path-based routing in production backend
- **Mobile Responsiveness**: `use-mobile` hook provides responsive navbar/sidebar toggles

---

## 6. Key Business Logic & Client-Side Validation

### 6.1 Authentication Flow

**Current (Client-Side)**:
1. User enters username/email + password on `/login`
2. Frontend searches `state.users` for matching user
3. If `user.password === inputPassword`, login succeeds
4. `setCurrentUser` dispatched; stored in `localStorage`
5. Redirect to `/dashboard` (if `profileCompleted`) or `/onboarding/profile-setup`

**Backend Equivalent**:
```
POST /api/auth/login → validate credentials → return JWT → store in secure cookie/localStorage → redirect
```

**Password Requirements** (Signup validation):
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 6.2 User Registration Flow

1. User fills signup form: name, email, username, password, confirm password
2. **Client-side validation**:
   - All fields required
   - Username unique (checked against `state.users`)
   - Email valid (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Username 3+ characters, alphanumeric + underscore only
   - Password matches confirm password
   - Must agree to terms
3. User created with ID `u_<timestamp>`, avatar auto-generated from initials
4. `profileCompleted: false` flag; redirect to `/onboarding/profile-setup`

**Backend Equivalent**: Hash password, check uniqueness in DB, return JWT, enforce email verification.

### 6.3 Profile Completion (Onboarding)

Wizard with steps:
1. **Basic Info**: Name, college, bio (required)
2. **Skills & Interests**: Select skills (multi-select), roles, domains
3. **Links**: GitHub, LinkedIn, portfolio URLs (optional)

Post-completion, `profileCompleted: true` is set in localStorage and database.

### 6.4 Post Creation Validation

**CreatePostModal.tsx** validates:
- Title: 5-150 characters
- Body: 10-3000 characters
- Type: One of 8 post types
- Tech stack: 1-10 items
- Domain: Optional
- Visibility: public/private/friends

On submission:
1. Generate post ID: `p_<timestamp>`
2. Set `createdAt: new Date().toISOString()`
3. Auto-create associated project if `projectName` provided
4. Dispatch `createPost` action
5. Clear form; close modal

**Backend Validation**: Enforce same rules server-side; sanitize input (XSS prevention).

### 6.5 Resume Upload & File Handling

**Current (Client-Side)**:
- Max file size: 2 MB
- Formats: PDF, Word, Images (jpg, png)
- Converted to base64 data URI: `data:application/pdf;base64,...`
- Stored in `request.resume` field

**Backend Migration**:
- Accept multipart file upload in `POST /api/requests`
- Upload to S3 with ACL (owner-only access)
- Store presigned URL in database
- Return presigned URL in API responses for download

### 6.6 Project Member Management

**Workflow**:
1. User applies to project role via `ApplyRoleModal`
2. Request created: `{ projectId, fromId, toId, status: "pending" }`
3. Project owner sees in `/requests` inbox
4. Owner clicks "Accept" → `updateRequest` action
5. **Side effect**: User added to `project.memberIds`; `project.members` incremented
6. User now appears in project members list

**Backend Transaction**:
```sql
BEGIN;
UPDATE requests SET status = 'accepted' WHERE id = ?;
INSERT INTO project_members (project_id, user_id) VALUES (?, ?);
UPDATE projects SET members = members + 1 WHERE id = ?;
COMMIT;
```

### 6.7 Follow/Unfollow Logic

**Current**:
- `follow`: Append `toId` to `fromId.following`, append `fromId` to `toId.followers`
- `unfollow`: Remove from both arrays

**Backend**: Use separate `follows` table with unique constraint on `(follower_id, followee_id)`.

### 6.8 Search & Discovery

**DiscoverBuilders.tsx** implements dynamic relevance scoring:

```typescript
const relevanceScore = 
  (name match ? 100 : 0) +
  (username prefix ? 60 : 0) +
  (username contains ? 30 : 0) +
  (skill match ? 15-40 : 0) +
  (domain match ? 10-20 : 0);
```

Builders sorted by score; results update in real-time as user types.

**FindProjects.tsx** ranks projects by tech-stack overlap:
```typescript
const matchScore = userSkills.filter(s => project.tech.includes(s)).length;
```

**Backend**: Use full-text search (PostgreSQL FTS or Elasticsearch) + ranking algorithm for better performance at scale.

### 6.9 Activity Heatmap

**Profile.tsx** generates GitHub-style contribution graph:
1. Reads `user.loginHistory: Record<"YYYY-MM-DD", number>`
2. Renders 53x7 grid (371 cells) covering past 52 weeks
3. Each cell colored by contribution level (0-4)
4. Deterministic seeded generation (based on user ID)

**Backend Requirement**: Track login events server-side; return aggregated counts in `GET /api/users/:id/profile`.

### 6.10 Notifications

**Current**:
- Notifications are manually created via `createNotification` actions
- Not persistent; lost on page refresh

**Backend Requirements**:
- Store in database
- Push via WebSocket or Server-Sent Events (SSE)
- Mark as read via `PATCH /api/notifications/:id`
- Batch fetch on login: `GET /api/notifications?unread=true`

---

## 7. Environment Variables & Configuration

### 7.1 Build & Runtime Configuration

**Vite Config** ([vite.config.ts](vite.config.ts)):
```typescript
base: "/devsync-connect/"     // GitHub Pages base URL
port: 8080                     // Dev server port
```

**TypeScript Config** ([tsconfig.json](tsconfig.json)):
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Path alias: `@` → `./src`

### 7.2 Anticipated Environment Variables

```env
# API
VITE_API_BASE_URL=https://api.devsync.io
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_TOKEN_KEY=devsync_token
VITE_REFRESH_TOKEN_KEY=devsync_refresh_token

# Storage
VITE_LOCAL_STORAGE_KEY=devsync_app_state_v3

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REVIEWS=false          # Currently placeholder
VITE_ENABLE_TEAMS=false            # MyTeam page incomplete

# Analytics
VITE_GA_ID=UA-...
VITE_SENTRY_DSN=https://...

# Build
VITE_BUILD_TIMESTAMP=${BUILD_TIMESTAMP}
```

**Backend Needs**:
- `VITE_API_BASE_URL`: Point to backend URL (e.g., `https://api.devsync.io`)
- CORS configuration on backend to allow requests from `https://devsync-connect.io`

---

## 8. Dependencies & External Services

### 8.1 Critical Dependencies

| Package | Purpose | Version | Backend Consideration |
|---------|---------|---------|----------------------|
| `react-router-dom` | Client-side routing | 6.30.1 | N/A (frontend-only) |
| `@tanstack/react-query` | Server state management | 5.83.0 | Will cache API responses |
| `react-hook-form` | Form handling | 7.61.1 | Frontend validation only |
| `zod` | Schema validation | 3.25.76 | Validate same schemas on backend |
| `@hookform/resolvers` | Form resolution | 3.10.0 | N/A |
| `recharts` | Charts/graphs | 2.15.4 | Provide data via API |
| `three.js` | 3D WebGL | 0.160.0 | Optional; can remove if not needed |
| `next-themes` | Dark mode | 0.3.0 | User preference stored server-side |
| `tailwindcss` | Styling | 3.4.17 | N/A (frontend-only) |
| `@radix-ui/*` | UI primitives | latest | N/A (frontend-only) |
| `lucide-react` | Icons | 0.462.0 | N/A |
| `sonner` | Toast notifications | 1.7.4 | N/A |

### 8.2 Missing Dependencies (Anticipated)

- **HTTP Client**: Add `axios` or use `fetch` API
- **JWT Decoding**: Add `jwt-decode` to parse JWTs
- **Date Formatting**: Already have `date-fns`
- **File Upload**: No client-side library; use native `FormData`

### 8.3 Testing Dependencies

- `vitest`: Unit test runner
- `@testing-library/react`: Component testing
- `jsdom`: DOM simulation

**Backend**: No direct connection; ensure API endpoints can be mocked in tests.

### 8.4 External Services (Anticipated)

| Service | Purpose | Integration |
|---------|---------|-------------|
| **AWS S3** | Resume/file storage | Presigned URLs via backend |
| **SendGrid / Mailgun** | Email notifications | Backend sends; frontend receives push notifications |
| **Firebase / Auth0** | OAuth alternative | Optional; currently email/password only |
| **Sentry** | Error tracking | `@sentry/react` integration (optional) |

---

## 9. Key Gaps & Assumptions for Backend Developer

### 9.1 Assumptions Made in Frontend

1. **No Authentication**: Frontend assumes all users exist; no JWT validation
2. **No Real Database**: All state in localStorage; data reset on browser clear
3. **No Real File Upload**: Resumes stored as base64; no S3 integration
4. **No Real Notifications**: No WebSocket/push notifications
5. **No Email Validation**: Email address not verified
6. **No Rate Limiting**: No protection against spam/DOS
7. **No Account Deletion**: `accountStatus` and `deactivatedAt` fields unused
8. **No Pagination**: All posts/projects loaded at once (performance issue at scale)
9. **No Real-Time Updates**: No live feed updates; manual refresh required
10. **No Search/Filter Backend**: Search done in-memory on frontend

### 9.2 Critical Backend Gaps

| Feature | Current State | Backend Action |
|---------|---|---|
| Password Security | Plaintext | Implement bcrypt hashing, never expose |
| Email Verification | Not implemented | Add email OTP verification |
| Resume Storage | Base64 data URIs | Implement S3 upload + presigned URLs |
| Pagination | None | Add skip/limit to all list endpoints |
| Full-Text Search | In-memory filter | Implement PostgreSQL FTS or Elasticsearch |
| Rate Limiting | None | Add Redis-based rate limiter |
| Account Deletion | UI exists; non-functional | Implement soft delete + data cleanup |
| Activity Tracking | Client-generated | Track server-side login/action logs |
| Notifications | Manual; not persistent | Implement WebSocket or SSE push |
| File Download | Inline base64 | Generate presigned S3 URLs for download |
| CORS | Not tested | Configure CORS headers on backend |
| Database Migrations | N/A | Plan schema evolution strategy |

### 9.3 Hardcoded Values to Parameterize

- **Max file size**: 2 MB (in [ApplyRoleModal.tsx](src/components/ApplyRoleModal.tsx))
- **Password requirements**: 8 chars, uppercase, lowercase, number, special (in [Signup.tsx](src/pages/Signup.tsx))
- **Post character limits**: Title 5-150, body 10-3000 (in [CreatePostModal.tsx](src/components/CreatePostModal.tsx))
- **Project member limits**: Default maxMembers = 4 (in [store.tsx](src/lib/store.tsx))
- **localStorage key**: `devsync_app_state_v3` (hardcoded)
- **Allowed post types**: Fixed array of 8 types (in [CreatePostModal.tsx](src/components/CreatePostModal.tsx))
- **Skills/domains/roles**: Hardcoded arrays (should be fetched from backend)

---

## 10. Migration Roadmap: Frontend to Backend Integration

### 10.1 Phase 1: API Layer Setup (Week 1-2)

1. **HTTP Client Setup**:
   - Add `axios` or `fetch` wrapper
   - Configure base URL from env
   - Add request/response interceptors

2. **Auth Integration**:
   - Replace `Login.tsx` form submission with `POST /api/auth/login`
   - Store JWT in localStorage/cookie
   - Add token to all requests via interceptor
   - Implement logout (clear token)

3. **User Endpoints**:
   - Replace `GET /users` with API call
   - Integrate signup with `POST /api/auth/register`
   - Implement profile update: `PATCH /api/users/:id`

### 10.2 Phase 2: React Query Integration (Week 2-3)

1. **Replace Redux/Context**:
   - Convert actions to React Query mutations
   - Use `useQuery` for all GET requests
   - Use `useMutation` for POST/PATCH/DELETE

2. **State Management**:
   - Keep minimal local state (UI state only)
   - Server state managed by React Query
   - Implement optimistic updates for better UX

### 10.3 Phase 3: File Upload & Storage (Week 3-4)

1. **S3 Integration**:
   - Request presigned URL from backend
   - Client-side S3 upload
   - Store presigned URL for later download

2. **Resume Pipeline**:
   - Modify `ApplyRoleModal` to upload to S3
   - Pass S3 URL in `POST /api/requests`

### 10.4 Phase 4: Real-Time Features (Week 4-5)

1. **WebSocket Connection**:
   - Establish persistent connection on login
   - Subscribe to user's event channels

2. **Notification Push**:
   - Real-time request/follow notifications
   - Live feed updates

### 10.5 Phase 5: Performance & Monitoring (Week 5-6)

1. **Pagination**:
   - Add skip/limit to all list endpoints
   - Implement infinite scroll

2. **Caching Strategy**:
   - React Query cache time: 5 minutes for lists, 30 minutes for profiles
   - Background refetch

3. **Error Handling**:
   - Implement retry logic
   - User-friendly error messages
   - Error boundary with Sentry integration

---

## 11. Testing & Validation Strategy

### 11.1 Frontend Test Coverage

Currently minimal; [src/test/](src/test/) contains:
- `example.test.ts` - Placeholder
- `account-deletion.test.tsx` - Skeleton
- `setup.ts` - Vitest configuration

**Backend Requirement**: Mock API responses in tests using `msw` (Mock Service Worker).

### 11.2 API Contract Testing

Backend should provide:
1. **Swagger/OpenAPI Documentation** of all endpoints
2. **Example request/response JSON** for each endpoint
3. **Error response examples** for all error codes

Frontend can generate TypeScript types from OpenAPI schema using `openapi-typescript`.

---

## 12. Security Considerations

### 12.1 Frontend Vulnerabilities

- **XSS**: Sanitize user-generated content (posts, bios)
  - Frontend: Use React's built-in escaping
  - Backend: Use parameterized queries

- **CSRF**: Implement CSRF tokens
  - Backend: Issue token in login response
  - Frontend: Include in all state-changing requests

- **Sensitive Data**: Never log passwords or tokens
  - Frontend: Remove from Redux DevTools for production

### 12.2 Backend Responsibilities

- **Hash Passwords**: Use bcrypt with salt rounds ≥ 12
- **HTTPS Only**: Enforce TLS 1.2+
- **CORS Configuration**: Whitelist frontend domain
- **Rate Limiting**: Prevent brute-force attacks (5 attempts/min per IP)
- **Input Validation**: Server-side, not just frontend
- **SQL Injection**: Use parameterized queries/ORM
- **Token Expiry**: JWT expires after 24 hours; refresh token for renewal

---

## Appendix: Quick Reference

### Schema Quick Reference

**User**: { id, name, email, username, password, avatar, bio, college, skills, roles, domains, links, followers, following, profileCompleted, preferences }

**Post**: { id, authorId, title, body, type, domain, tech, projectName, lookingFor, imageUrl, createdAt, status, visibility, responses }

**Project**: { id, title, owner, ownerId, team, description, tech, roles, members, maxMembers, progress, status, category, visibility }

**Request**: { id, fromId, toId, message, role, resume, skills, status, createdAt, projectId }

### API Endpoint Summary

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/users` - List all users
- `GET /api/users/:id` - User profile
- `PATCH /api/users/:id` - Update profile
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `POST /api/requests` - Send collaboration request
- `PATCH /api/requests/:id` - Accept/decline request
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow/:targetId` - Unfollow user

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-14  
**Frontend Version**: React 18.3.1  
**Status**: Client-side MVP → Backend Integration Ready
