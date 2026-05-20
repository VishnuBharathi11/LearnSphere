# LearnSphere Discussion Forum Module

## Backend Architecture (Spring Boot + MongoDB)

### Collections

#### `threads`
- `id` (String)
- `courseId` (String)
- `title` (String)
- `content` (String, sanitized HTML)
- `authorId` (String)
- `authorName` (String)
- `authorRole` (`LEARNER` | `INSTRUCTOR` | `ADMIN`)
- `upvotes` (String[] userIds)
- `createdAt` (Instant)
- `isLocked` (boolean)
- `isArchived` (boolean)
- `replyCount` (long)

#### `replies`
- `id` (String)
- `threadId` (String)
- `parentReplyId` (String | null)
- `content` (String, sanitized HTML)
- `authorId` (String)
- `authorName` (String)
- `authorRole` (`LEARNER` | `INSTRUCTOR` | `ADMIN`)
- `upvotes` (String[] userIds)
- `reports` (array of `{ userId, reason, createdAt }`)
- `createdAt` (Instant)
- `isDeleted` (boolean)

#### `notifications`
- `id`
- `userId`
- `title`
- `message`
- `isRead`
- `createdAt`

### Security
- JWT middleware: `JwtAuthFilter`
- Role extracted from JWT claim `role`
- `ROLE_LEARNER`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN` authorities assigned
- All `/api/**` and `/notifications/**` endpoints authenticated
- Instructor moderation restricted to their own course threads via course-service lookup

### Implemented APIs

- `POST /api/courses/{courseId}/threads`
- `GET /api/courses/{courseId}/threads?page=0&size=10`
- `GET /api/threads/{threadId}?page=0&size=20`
- `POST /api/threads/{threadId}/replies`
- `PUT /api/threads/{id}/upvote`
- `PUT /api/replies/{id}/upvote`
- `POST /api/replies/{id}/report`
- `DELETE /api/threads/{id}` (Instructor/Admin)
- `DELETE /api/replies/{id}` (Instructor/Admin)
- `PUT /api/threads/{id}/lock?locked=true` (Instructor/Admin)
- `GET /api/courses/{courseId}/threads/reported` (Instructor/Admin)

## Frontend Architecture (React)

### Component Structure
- `forum/pages/ForumPage.jsx` : thread list per selected course + filters + pagination
- `forum/pages/TopicPage.jsx` : thread detail + nested reply tree + lazy "Load more"
- `forum/components/TopicCard.jsx` : summary card (title/author/time/replies/upvotes)
- `forum/components/ReplyItem.jsx` : recursive nested replies with report/upvote/reply
- `forum/components/ReplyBox.jsx` : rich reply composer
- `forum/components/CreateTopicModal.jsx` : create thread modal with rich text
- `forum/components/RichTextEditor.jsx` : inline rich text toolbar (bold/italic/list)
- `forum/components/ReportModal.jsx` : report reason modal
- `forum/hooks/useForum.js` : API state, loading/error, mutations, pagination
- `services/discussionApi.js` : backend API client

### UX Features
- Course-linked discussions (course selector + route support)
- Nested replies (multi-level tree)
- Upvote toggle protection per user
- Report modal per reply
- Role-based moderation controls for Instructor/Admin (delete + lock)
- Thread pagination
- Lazy-loading top-level replies
- Real-time refresh after create reply/topic actions
- XSS mitigation: backend sanitization + controlled HTML rendering

## Sample Payloads

### Create Thread
`POST /api/courses/699c9f6abc/threads`
```json
{
  "title": "How to handle JWT refresh in React?",
  "content": "<p>I need best practice for refresh tokens.</p>",
  "authorName": "Vishnu"
}
```

### List Threads Response
```json
{
  "items": [
    {
      "id": "67cabc123",
      "courseId": "699c9f6abc",
      "title": "How to handle JWT refresh in React?",
      "content": "<p>I need best practice for refresh tokens.</p>",
      "authorId": "717823s129@kce.ac.in",
      "authorName": "Vishnu",
      "authorRole": "LEARNER",
      "upvoteCount": 3,
      "replyCount": 5,
      "createdAt": "2026-02-24T10:20:30Z",
      "locked": false,
      "archived": false,
      "upvotedByCurrentUser": true
    }
  ],
  "page": 0,
  "size": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

### Create Reply
`POST /api/threads/67cabc123/replies`
```json
{
  "parentReplyId": null,
  "content": "<p>Use short-lived access token + silent refresh.</p>",
  "authorName": "Instructor A"
}
```

### Upvote Reply
`PUT /api/replies/67cad001/upvote`

Response:
```json
{
  "id": "67cad001",
  "upvoteCount": 7,
  "upvotedByCurrentUser": true
}
```

### Report Reply
`POST /api/replies/67cad001/report`
```json
{
  "reason": "Contains abusive language"
}
```

## Role Matrix

- Learner: create thread, reply, upvote, report
- Instructor: learner permissions + lock/delete/report moderation within owned course
- Admin: full moderation across all courses
