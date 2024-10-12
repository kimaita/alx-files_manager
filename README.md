# Files manager

File upload app backend - a simple platform to upload and view files.

Features:
- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

## Endpoints

Endpoint | Function
|--------|---------|
GET /status | return if connections to Redis(session management) and the DB are alive
GET /stats | return the number of users and files in DB
POST /users | create a new user
GET /connect | sign-in the user by generating a new authentication token
GET /disconnect | sign-out the user based on the auth token
GET /users/me | retrieve the user based on the auth token
POST /files | create a new file in the DB and on disk.
GET /files | retrieve all of a user's file documents for a specific `parentId`(param) with pagination
GET /files/:id | retrieve the file document based on `id`
GET /files/:id/data |  return the content of the file document based on `id`
PUT /files/:id/publish | set `isPublic` to `true` on the file document based `id`
PUT /files/:id/unpublish | set `isPublic` to `false` on the file document based on `id`
