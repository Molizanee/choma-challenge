# Choma Challenge

A todo management system with WhatsApp integration. Users can manage tasks through a web interface and create todos by sending WhatsApp messages that are processed by AI.

## Architecture

The system consists of four main components:
- **Next.js Web Application**: Frontend interface for todo management
- **Supabase**: Cloud database service providing PostgreSQL database and real-time subscriptions
- **Server Infrastructure**: Docker services including N8N, Evolution API, and local PostgreSQL
- **AI Integration**: Google Gemini processes WhatsApp messages to create structured todos

## Server Setup

The server runs three Docker services that work together:

### Prerequisites
- Docker and Docker Compose installed

### Starting the Server

1. Navigate to the server directory:
```bash
cd server
```

2. Start all services:
```bash
docker-compose up -d
```

3. Verify services are running:
```bash
docker-compose ps
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 (internal) | Shared database for N8N and Evolution API |
| N8N | 5678 | Workflow automation platform |
| Evolution API | 8080 | WhatsApp Business API integration |

Access URLs:
- N8N: http://localhost:5678
- Evolution API: http://localhost:8080

### Environment Configuration

Configure these variables in the server `.env` file:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database credentials
- `EVOLUTION_API_KEY`: API key for Evolution API authentication
- `N8N_HOST`: N8N host configuration
- `WEBHOOK_URL`: Webhook URL for N8N workflows

## Web Application

The Next.js frontend provides a modern interface for todo management with real-time updates.

### Technology Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Radix UI components
- Supabase for database and real-time subscriptions

### Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. Set up Supabase database schema:
   - Create the `todos` and `phone_link` tables (see schema below)
   - Enable real-time subscriptions for the `todos` table
   - Configure Row Level Security policies if needed

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Features
- Create, update, delete, and complete todos
- Priority levels (High, Medium, Low)
- Due date management
- Markdown support for descriptions
- Real-time updates across devices
- WhatsApp phone number linking

## Supabase Integration

The web application uses Supabase as its primary database and backend service. Supabase provides:

### Database
- **PostgreSQL Database**: Hosted cloud database for storing todos and phone links
- **Real-time Subscriptions**: Live updates when todos are created, updated, or deleted
- **Row Level Security**: Built-in security policies for data protection
- **Auto-generated API**: RESTful API endpoints for database operations

### Setup Requirements
1. Create a Supabase project at https://supabase.com
2. Set up the database schema using the tables below
3. Configure environment variables with your Supabase credentials
4. Enable real-time subscriptions for the `todos` table

### Real-time Features
The application automatically updates the UI when:
- New todos are created (including via WhatsApp)
- Existing todos are modified
- Todos are completed or deleted
- Phone numbers are linked or unlinked

This ensures all connected devices stay synchronized without manual refresh.

## Supabase Database Schema

| Table | Column | Type | Description |
|-------|--------|------|-------------|
| **todos** | id | uuid | Primary key |
| | created_at | timestamp | Creation date |
| | title | text | Todo title |
| | description | text | Todo description (supports markdown) |
| | due_date | timestamp | Due date |
| | priority | smallint | Priority level (1=high, 2=medium, 3=low) |
| | is_complete | boolean | Completion status |
| | is_deleted | boolean | Soft delete flag |
| | deleted_at | timestamp | Deletion timestamp |
| | user_id | uuid | Foreign key to auth.users |
| **phone_link** | id | uuid | Primary key |
| | created_at | timestamp | Creation date |
| | phone_number_linked | text | WhatsApp phone number |
| | auth_code | integer | 8-digit authentication code |
| | is_active | boolean | Link status |
| | is_deleted | boolean | Soft delete flag |
| | deleted_at | timestamp | Deletion timestamp |
| | user_id | uuid | Foreign key to auth.users |

## WhatsApp Integration

Users can create todos by sending WhatsApp messages using these formats:

**Link phone number:**
```
#auth 12345678
```

**Create todos:**
```
#todo Meeting with client tomorrow at 10am
#todo Buy groceries this evening
#todo High priority: Submit report by Friday
```

The N8N workflow processes these messages, extracts todo information using Google Gemini AI, and creates structured todos in the database.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/todos` | GET | Fetch todos |
| `/api/todos` | POST | Create todo |
| `/api/todos/[id]` | PUT | Update todo |
| `/api/todos/[id]` | DELETE | Delete todo |
| `/api/whatsapp-auth` | POST | Link WhatsApp number |
| `/api/phone-status` | POST | Check phone link status |
| `/api/phone-unlink` | POST | Unlink phone |
| `/api/auth-code` | POST | Generate auth code |
| `/api/webhook/evolution-api` | POST | WhatsApp webhook |

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd choma-challenge
```

2. Set up Supabase:
   - Create a new project at https://supabase.com
   - Create the database tables using the schema above
   - Copy your project URL and API keys

3. Start the server:
```bash
cd server
docker-compose up -d
```

4. Configure and start the web application:
```bash
cd web
npm install
# Configure .env.local with your Supabase credentials
npm run dev
```

5. Access the application at http://localhost:3000
