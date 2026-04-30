---
description: How to add a new API route to Verdict
---
# Workflow: Adding a New API Route

1.  **Define the Route**: Create a new file in `src/app/api/[path]/route.ts`.
2.  **Auth (Optional)**: If the route requires authentication, use the `AuthContext` pattern.
    ```typescript
    import { NextResponse } from 'next/server';
    import { cookies } from 'next/headers';
    import jwt from 'jsonwebtoken';

    export async function POST(req: Request) {
        // Auth logic here using JWT_SECRET
    }
    ```
3.  **Error Handling**: Wrap logic in try-catch and return standardized JSON error responses.
    ```json
    { "error": "Descriptive error message" }
    ```
4.  **Logging**: Log key events to the console (Docker logs will catch them).
5.  **Test**: Use `vcl status` or a manual curl to verify the endpoint is up.
