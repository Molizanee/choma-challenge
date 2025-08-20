# Todo App - Supabase Integration

This todo application now integrates with Supabase for user authentication and data storage.

## Features

- ✅ User Authentication via Supabase Auth
- ✅ CRUD operations for todos (Create, Read, Update, Delete)
- ✅ Row Level Security (RLS) - users can only see their own todos
- ✅ Soft delete functionality (todos are marked as deleted, not permanently removed)
- ✅ Priority levels (High=1, Medium=2, Low=3)
- ✅ Due dates
- ✅ Search and filtering
- ✅ Real-time updates
- ✅ TypeScript support with database types

## Database Schema

The todos table has the following structure:

```sql
CREATE TABLE public.todos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  title text,
  description text,
  due_date timestamp with time zone,
  priority smallint DEFAULT '2'::smallint,  -- 1=High, 2=Medium, 3=Low
  is_complete boolean DEFAULT false,
  user_id uuid,
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## Setup Instructions

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration** - Execute the SQL schema in your Supabase SQL editor

3. **Enable Row Level Security** by running the policies in `database/policies.sql`

4. **Set up environment variables** in your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Configure authentication** in your Supabase dashboard:
   - Go to Authentication > Settings
   - Configure your preferred auth providers (Google, GitHub, etc.)
   - Set up redirect URLs for your app

## Usage

### Authentication
- Users must sign in through the `/auth` page
- Authentication is handled by Supabase Auth
- Users are automatically redirected to login if not authenticated

### Todo Operations

#### Create Todo
- Fill out the form in the "Add Todo" dialog
- Required: Title
- Optional: Description, Due Date, Priority (defaults to Medium)

#### View Todos
- All todos are displayed on the main page
- Filter by status: All, Completed, Pending
- Sort by: Due Date, Priority, Created Date
- Search by title or description

#### Update Todo
- Click the circle icon to toggle completion status
- Changes are immediately saved to the database

#### Delete Todo
- Click the trash icon to delete a todo
- This performs a "soft delete" (sets `is_deleted` = true)
- Deleted todos are not shown in the UI

### Priority System
- **High Priority** (1): Red badge
- **Medium Priority** (2): Yellow badge  
- **Low Priority** (3): Green badge

## Database Functions

The app provides the following CRUD operations:

- `loadTodos()` - Fetches all non-deleted todos for the current user
- `createTodo()` - Creates a new todo
- `toggleTodo()` - Updates the completion status
- `deleteTodo()` - Soft deletes a todo

## Security

Row Level Security (RLS) is enabled to ensure:
- Users can only see their own todos
- Users can only modify their own todos
- All operations are scoped to the authenticated user

## Error Handling

The app includes comprehensive error handling:
- Loading states during API calls
- Error messages displayed to users
- Console logging for debugging
- Graceful fallbacks for failed operations

## Type Safety

Full TypeScript support with:
- Database schema types in `lib/database.types.ts`
- Typed Supabase client
- Proper type checking for all database operations
