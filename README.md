# Choma Challenge - AI-Powered WhatsApp Todo Manager

A sophisticated todo management system that integrates **WhatsApp messaging** with **AI-powered task processing** through Evolution API, N8N workflows, and a modern Next.js web application.

## 🎯 Project Overview

This project demonstrates a complete full-stack solution that allows users to manage their todos through multiple interfaces:
- **Web Application**: Modern React/Next.js interface with real-time updates
- **WhatsApp Integration**: Send todos directly via WhatsApp messages using natural language
- **AI Processing**: Google Gemini AI automatically processes WhatsApp messages to create structured todos
- **Workflow Automation**: N8N orchestrates the entire message processing pipeline

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │────│  Evolution API   │────│   N8N Workflow  │
│   Messages      │    │  (Webhook)       │    │   (AI Process)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │────│   API Routes     │────│   Supabase      │
│   Frontend      │    │   (Backend)      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Markdown** - Rich text rendering for todo descriptions

### Backend & Infrastructure
- **Supabase** - Database and authentication
- **Evolution API** - WhatsApp Business API integration
- **N8N** - Workflow automation and AI processing
- **Google Gemini AI** - Natural language processing
- **Docker** - Containerization
- **Google Cloud Platform** - Production deployment

### Database
- **PostgreSQL** (via Supabase)
- **Real-time subscriptions** for live updates

## 📊 Database Schema

| Table | Description | Key Fields |
|-------|-------------|------------|
| **`todos`** | Main todo items with full task management | `id`, `title`, `description`, `due_date`, `priority`, `is_complete`, `user_id` |
| **`phone_link`** | Links WhatsApp phone numbers to user accounts | `id`, `phone_number_linked`, `auth_code`, `user_id`, `is_active` |

### Detailed Schema

```sql
-- Todos table for task management
CREATE TABLE public.todos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  title text,
  description text,
  due_date timestamp with time zone,
  priority smallint DEFAULT '3'::smallint,  -- 1: high, 2: medium, 3: low
  is_complete boolean DEFAULT false,
  user_id uuid,
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Phone linking for WhatsApp integration
CREATE TABLE public.phone_link (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean,
  auth_code integer,                        -- 8-digit authentication code
  phone_number_linked text,                 -- WhatsApp phone number
  user_id uuid DEFAULT gen_random_uuid(),
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  CONSTRAINT phone_link_pkey PRIMARY KEY (id),
  CONSTRAINT phone_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## 🔗 API Endpoints

### Todo Management
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/todos` | GET | Fetch user todos (with optional filtering) | ❌ |
| `/api/todos` | POST | Create new todo | ❌ |
| `/api/todos/[id]` | PUT | Update existing todo | ❌ |
| `/api/todos/[id]` | DELETE | Soft delete todo | ❌ |

### WhatsApp Integration
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/whatsapp-auth` | POST | Link WhatsApp number with auth code | ❌ |
| `/api/phone-status` | POST | Check if phone number is linked | ✅ API Key |
| `/api/phone-lookup` | POST | Get user info for linked phone | ❌ |
| `/api/phone-unlink` | POST | Unlink phone from account | ❌ |
| `/api/auth-code` | POST | Generate authentication code | ❌ |

### Webhook & Integration
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/webhook/evolution-api` | POST | Main webhook for WhatsApp messages | ✅ API Key |
| `/api/webhook/evolution-api-secure` | POST | Secure webhook with enhanced validation | ✅ API Key |
| `/api/cleanup-expired-codes` | POST | Clean up expired auth codes | ✅ API Key |

## 🤖 N8N Workflow Automation

The N8N workflow orchestrates the entire WhatsApp message processing pipeline:

### Workflow Steps

1. **Webhook Trigger** - Receives WhatsApp messages from Evolution API
2. **Phone Status Check** - Verifies if sender's phone is linked to an account
3. **Message Type Detection** - Determines if message is authentication or todo creation
4. **Authentication Flow** - Links phone numbers using 8-digit codes
5. **AI Processing** - Google Gemini AI extracts todo information from natural language
6. **Todo Creation** - Structured todo data is sent to the web app API

### Message Formats

**Authentication**: 
```
#auth 12345678
```

**Todo Creation**:
```
#todo Meeting with client tomorrow at 10am about project proposal
#todo Buy groceries this evening - milk, bread, eggs
#todo High priority: Submit report by Friday
```

### AI Processing Features

- **Natural Language Understanding**: Converts messages into structured todo data
- **Smart Date Recognition**: Interprets relative dates ("tomorrow", "next Friday")
- **Priority Detection**: Analyzes message content to assign priority levels
- **Context Preservation**: Maintains sender information and timestamps

## 🌐 Web Application Features

### User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: Live todo synchronization using Supabase subscriptions
- **Rich Text Editor**: Markdown support for detailed todo descriptions
- **Mobile Responsive**: Optimized for all device sizes

### Todo Management
- **CRUD Operations**: Create, read, update, delete todos
- **Priority System**: Visual priority indicators (High, Medium, Low)
- **Due Date Management**: Calendar integration and overdue indicators
- **Completion Tracking**: Mark todos as complete with progress visualization
- **Search & Filter**: Find todos by title, description, or status

### WhatsApp Integration
- **Phone Linking**: Secure authentication process with generated codes
- **Status Dashboard**: View linked WhatsApp numbers and connection status
- **Message History**: Track todos created via WhatsApp

## 🚀 Deployment & Infrastructure

### Local Development
```bash
# Frontend
cd web
npm install
npm run dev

# Backend Services
cd server
docker-compose up -d
```

### Production Deployment (Google Cloud Platform)

The project includes comprehensive GCP deployment automation:

- **Cloud Run**: Containerized microservices deployment
- **Cloud SQL**: Managed PostgreSQL database
- **Memorystore**: Redis caching layer
- **Container Registry**: Docker image storage
- **Load Balancing**: Automatic traffic distribution

```bash
cd server/gcp-deployment
chmod +x deploy-enhanced.sh
./deploy-enhanced.sh
```

### Environment Configuration

**Frontend (Next.js)**:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Backend Services**:
```env
DATABASE_URL=postgresql://user:pass@host:port/db
EVOLUTION_API_KEY=your-evolution-api-key
N8N_ENCRYPTION_KEY=your-encryption-key
WEBHOOK_URL=your-webhook-endpoint
```

## 🔐 Security Features

### API Security
- **API Key Authentication**: Secure webhook endpoints
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **IP Whitelisting**: Restrict access to trusted sources
- **Input Validation**: Comprehensive request sanitization

### Data Protection
- **Encrypted Communication**: HTTPS/TLS for all endpoints
- **Secure Token Storage**: JWT tokens with proper expiration
- **Database Security**: Row-level security policies
- **Audit Logging**: Track all data modifications

### WhatsApp Integration Security
- **Authentication Codes**: Time-limited 8-digit codes
- **Phone Verification**: Multi-step verification process
- **Session Management**: Secure phone-to-account linking

## 📈 Performance & Scalability

### Optimization Features
- **Database Indexing**: Optimized queries for large datasets
- **Caching Strategy**: Redis caching for frequently accessed data
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Lazy loading for optimal bundle sizes

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and throughput monitoring
- **Usage Analytics**: User interaction and feature adoption tracking
- **Health Checks**: Automated service availability monitoring

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and workflow testing
- **E2E Tests**: Complete user journey validation
- **Load Testing**: Performance under various traffic conditions

### Quality Assurance
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

## 🎨 Design Principles

### User Experience
- **Intuitive Interface**: Clear navigation and consistent design patterns
- **Accessibility**: WCAG 2.1 compliance with keyboard navigation
- **Progressive Enhancement**: Works without JavaScript enabled
- **Offline Support**: Service worker for basic offline functionality

### Code Quality
- **SOLID Principles**: Maintainable and extensible architecture
- **DRY**: Reusable components and utilities
- **Separation of Concerns**: Clear boundaries between layers
- **Documentation**: Comprehensive inline and external documentation

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- Supabase account
- Google Cloud Platform account (for production)
- WhatsApp Business Account for Evolution API

### Quick Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/choma-challenge
   cd choma-challenge
   ```

2. **Set up the web application**
   ```bash
   cd web
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

3. **Deploy backend services**
   ```bash
   cd server
   docker-compose up -d
   ```

4. **Access the application**
   - Web App: http://localhost:3000
   - N8N: http://localhost:5678
   - Evolution API: http://localhost:8080

## 📞 Support & Contact

For questions about this project or to discuss development opportunities:

- **GitHub**: [Your GitHub Profile]
- **LinkedIn**: [Your LinkedIn Profile]
- **Email**: [Your Email]

---

*This project showcases modern full-stack development practices, AI integration, and scalable cloud architecture. It demonstrates proficiency in React, Node.js, AI/ML integration, DevOps, and enterprise-grade application development.*
