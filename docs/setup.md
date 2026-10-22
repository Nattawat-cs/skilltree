# Frontend Setup Guide

This guide explains how to set up and run the CS261 SkillTree frontend using Docker.

## 1. Prerequisites

Install the following tools before starting:

- **Git** — to clone the repository.
- **Docker Desktop** — to build and run Docker containers.

Make sure Docker Desktop is running before executing Docker commands.

## 2. Clone the Repository

Open a terminal and clone the project:

```bash
git clone https://github.com/Saranwich/CS261.git
cd CS261
```

To get the latest changes from the `dev` branch:

```bash
git switch dev
git pull origin dev
```

## 3. Run Frontend in Development Mode

Development mode runs the React + Vite development server and supports Hot Module Replacement (HMR), allowing code changes to appear in the browser without manually rebuilding the production image.

From the project root directory, run:

```bash
docker compose --profile dev up --build
```

Open the frontend in your browser:

http://localhost:5173

### Stop Development Mode

Press `Ctrl+C` in the terminal to stop the running services.

## 4. Run Frontend in Production Mode

Production mode builds the frontend into static files and serves them using Apache HTTP Server.

From the project root directory, run:

```bash
docker compose --profile prod up --build
```

Open the frontend in your browser:

http://localhost:8080

### Stop Production Mode

Press `Ctrl+C` in the terminal to stop the running services.

## 5. Useful Docker Commands

### View Running Containers

```bash
docker compose ps
```

### View Development Logs

```bash
docker compose --profile dev logs -f
```

### View Production Logs

```bash
docker compose --profile prod logs -f
```

### Stop Services

```bash
docker compose --profile dev down
docker compose --profile prod down
```

## 6. Project Structure

```text
CS261/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── docs/
├── Dockerfile.frontend
├── compose.yaml
├── apache.conf
└── README.md
```

The `components/`, `pages/`, and `services/` directories are prepared for future frontend development.

## 7. Troubleshooting

### Docker is not running

Start Docker Desktop and wait until the Docker engine is ready.

### Port is already in use

Another application may already be using port `5173` or `8080`. Stop the conflicting application before starting the frontend again.

### Changes do not appear in Development Mode

Check that the development container is running and that the files are saved. If necessary, stop the service and restart it:

```bash
docker compose --profile dev up --build
```

### The page does not load in Production Mode

Check the production container logs:

```bash
docker compose --profile prod logs --tail=50
```

## 8. Notes

- Development mode uses Vite.
- Production mode serves the built frontend through Apache.
- The Spring Boot backend and TU API authentication are not covered by this guide.
- Run Docker commands from the project root directory, where `compose.yaml` is located.