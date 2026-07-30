# Production - Build Docker container for production

# The following code was generated with the help of ChatGPT. This transcript: [https://docs.google.com/document/d/1ZctEc2OG-L5qCFgWMeN-HBGRJFmRPa7pp49o4UEmulA/edit?usp=sharing] 
# documents the GenAI interaction that led to this dockerfile.

# Compile frontend into static file
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Create new directory for container
FROM python:3.13-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Add backend
COPY backend/ ./backend

# Add frontend file
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Cloud Run Port 
EXPOSE 8080

# Point to correct directory
WORKDIR /app/backend

# Execute application server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]