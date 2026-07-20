# Builds Docker container for production

# Compile frontend source code
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Create directory for docker container
FROM python:3.13-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Add backend source code
COPY backend/ ./backend

# Add frontend compiled file
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Cloud Run Port 
EXPOSE 8080

# Change to correct directory
WORKDIR /app/backend

# Execute application server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]