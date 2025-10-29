# Development Dockerfile with Air for hot reload
FROM golang:1.23-alpine

# Install Air for hot reload (v1.61.1 is compatible with Go 1.23)
RUN go install github.com/air-verse/air@v1.61.1

# Install build dependencies
RUN apk add --no-cache git wget

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8080

# Run Air for hot reload
CMD ["air", "-c", ".air.toml"]
