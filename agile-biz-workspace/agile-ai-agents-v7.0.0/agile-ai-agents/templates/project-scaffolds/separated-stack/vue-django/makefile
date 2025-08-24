# Development Commands
.PHONY: install dev build test clean

# Install all dependencies
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

# Start development servers
dev:
	@echo "Starting development servers..."
	docker-compose up -d postgres
	@echo "Waiting for database..."
	sleep 5
	cd backend && python manage.py migrate
	@echo "Starting backend and frontend..."
	(cd backend && python manage.py runserver) & \
	(cd frontend && npm run dev) & \
	wait

# Build for production
build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Collecting Django static files..."
	cd backend && python manage.py collectstatic --noinput

# Run tests
test:
	@echo "Running frontend tests..."
	cd frontend && npm run test:unit
	@echo "Running backend tests..."
	cd backend && python manage.py test

# Database operations
migrate:
	cd backend && python manage.py makemigrations && python manage.py migrate

# Create superuser
superuser:
	cd backend && python manage.py createsuperuser

# Clean generated files
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "node_modules" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Django shell
shell:
	cd backend && python manage.py shell

# Generate API schema
schema:
	cd backend && python manage.py generateschema --file ../docs/api/openapi-schema.yml