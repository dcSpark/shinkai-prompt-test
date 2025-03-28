FROM node:22-alpine AS build

WORKDIR /app

COPY . .
RUN cd projects/shinkai-tool-generator && npm ci && npm run build
COPY projects/shinkai-tool-generator/out ./public

FROM denoland/deno:2.2.3 AS runtime
# Copy required files and folders
COPY . .

# Expose the port
EXPOSE 8080

# Environment variables - these will be required at runtime
# Use ARG to declare them without values, then ENV to convert them to environment variables
ARG SHINKAI_API_URL
ARG SHINKAI_BEARER_TOKEN
ARG OLLAMA_API_URL
ARG BRAVE_API_KEY
ARG FIRECRAWL_API_URL
ARG FIRECRAWL_API_KEY
ARG OPEN_AI_KEY

# Set environment variables from ARGs
ENV SHINKAI_API_URL=${SHINKAI_API_URL}
ENV SHINKAI_BEARER_TOKEN=${SHINKAI_BEARER_TOKEN}
ENV OLLAMA_API_URL=${OLLAMA_API_URL}
ENV BRAVE_API_KEY=${BRAVE_API_KEY}
ENV FIRECRAWL_API_URL=${FIRECRAWL_API_URL}
ENV FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
ENV OPEN_AI_KEY=${OPEN_AI_KEY}

# Set the entrypoint command
CMD ["deno", "run", "-A", "projects/code-generation-api/src/main.ts"] 