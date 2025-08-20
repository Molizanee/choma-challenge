# Server Docker Compose Setup

This Docker Compose configuration sets up three services:

1. **PostgreSQL Database** - Shared database for both N8N and Evolution API
2. **N8N** - Workflow automation platform
3. **Evolution API** - WhatsApp API service

## Services Overview

### PostgreSQL (postgres)
- **Port**: Internal only (5432)
- **Image**: postgres:16
- **Volumes**: `db_storage` for persistent data
- **Health Check**: Ensures database is ready before other services start

### N8N
- **Port**: 5678 (accessible at http://localhost:5678)
- **Image**: docker.n8n.io/n8nio/n8n
- **Database**: Uses PostgreSQL for data persistence
- **Volumes**: `n8n_storage` for N8N data

### Evolution API
- **Port**: 8080 (accessible at http://localhost:8080)
- **Image**: atendai/evolution-api:v2.1.1
- **Database**: Uses PostgreSQL for data persistence
- **Volumes**: `evolution_instances` for WhatsApp instances

## Getting Started

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Check service status**:
   ```bash
   docker-compose ps
   ```

4. **View logs**:
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f n8n
   docker-compose logs -f evolution-api
   docker-compose logs -f postgres
   ```

## Access URLs

- **N8N**: http://localhost:5678
- **Evolution API**: http://localhost:8080

## Environment Variables

Key environment variables can be configured in the `.env` file:

- `POSTGRES_USER`: PostgreSQL admin user
- `POSTGRES_PASSWORD`: PostgreSQL admin password
- `POSTGRES_DB`: Database name
- `POSTGRES_NON_ROOT_USER`: Application database user
- `POSTGRES_NON_ROOT_PASSWORD`: Application database password
- `EVOLUTION_API_KEY`: API key for Evolution API authentication
- `N8N_HOST`: N8N host configuration
- `WEBHOOK_URL`: Webhook URL for N8N

## Stopping Services

```bash
docker-compose down
```

To also remove volumes (⚠️ **This will delete all data**):
```bash
docker-compose down -v
```

## Troubleshooting

1. **Database connection issues**: Check that PostgreSQL is healthy before other services start
2. **Port conflicts**: Ensure ports 5678 and 8080 are not in use by other applications
3. **Permission issues**: Ensure the `init-data.sh` script has execute permissions

## Network

All services are connected via a custom bridge network (`app-network`) which allows them to communicate with each other using service names as hostnames.
