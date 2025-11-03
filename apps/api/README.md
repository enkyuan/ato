# Ato API

Go backend API for the Ato todo application.

## Prerequisites

- Go 1.23 or higher
- PostgreSQL (optional, for database)
- Make (optional, for using Makefile commands)

## Getting Started

### 1. Install Dependencies

```bash
make install
# or
go mod download
```

### 2. Set Up Environment Variables

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` and update the values as needed.

### 3. Run the Server

```bash
make run
# or
go run main.go
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## Development

### Hot Reload with Air

For development with hot reload, install [Air](https://github.com/cosmtrek/air):

```bash
go install github.com/cosmtrek/air@latest
```

Then run:

```bash
make dev
# or
air
```

### Available Commands

```bash
make help          # Show all available commands
make run           # Run the application
make dev           # Run with hot reload
make build         # Build the application
make test          # Run tests
make test-coverage # Run tests with coverage
make clean         # Clean build artifacts
make fmt           # Format code
make vet           # Run go vet
make lint          # Run golangci-lint
```

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout

### Todos
- `GET /api/v1/todos` - Get all todos
- `POST /api/v1/todos` - Create a new todo
- `GET /api/v1/todos/:id` - Get a specific todo
- `PUT /api/v1/todos/:id` - Update a todo
- `DELETE /api/v1/todos/:id` - Delete a todo

## Project Structure

```
api/
├── main.go                 # Application entry point
├── internal/
│   ├── server/            # HTTP server setup and routes
│   │   └── server.go
│   └── models/            # Data models
│       ├── todo.go
│       └── user.go
├── .env                   # Environment variables
├── .env.example          # Example environment variables
├── Dockerfile            # Docker configuration
├── Makefile              # Build and development commands
└── README.md             # This file
```

## Docker

### Build Docker Image

```bash
make docker-build
# or
docker build -t ato-api .
```

### Run Docker Container

```bash
make docker-run
# or
docker run -p 8080:8080 --env-file .env ato-api
```

## Testing

Run tests:

```bash
make test
```

Run tests with coverage:

```bash
make test-coverage
```

## Next Steps

1. **Implement Database Layer**: Add PostgreSQL integration using `pgx` or `sqlc`
2. **Add Authentication**: Implement JWT-based authentication middleware
3. **Add Validation**: Implement request validation using `go-playground/validator`
4. **Add Tests**: Write unit and integration tests
5. **Add Logging**: Improve logging with structured logging (e.g., `zerolog`)
6. **Add Documentation**: Generate API documentation with Swagger/OpenAPI

## License

MIT
