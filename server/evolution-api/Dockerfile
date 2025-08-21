# Evolution API Dockerfile for Google Cloud Run
FROM atendai/evolution-api:v2.1.1

# Set working directory
WORKDIR /evolution

# Create directories for instances and logs
RUN mkdir -p /evolution/instances /evolution/logs

# Copy any custom configurations if needed
# COPY ./custom-config/ /evolution/

# Set proper permissions
RUN chown -R node:node /evolution

# Switch to node user for security
USER node

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/manager/health || exit 1

# The base image already has the correct entrypoint
# CMD is inherited from the base image
