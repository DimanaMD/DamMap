FROM python:3.12-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Install system packages required to compile mysqlclient
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Configure uv
ENV UV_PROJECT_ENVIRONMENT=/app/.venv \
    UV_COMPILE_BYTECODE=0 \
    UV_LINK_MODE=copy

# Copy dependency manifests first
COPY pyproject.toml uv.lock ./

# Install dependencies only
RUN uv sync --frozen --no-install-project --no-dev

# Copy source
COPY . .

# Install project
RUN uv sync --frozen --no-dev


FROM python:3.12-slim AS runner

WORKDIR /app

# Install the mysql runtime shared library required by mysqlclient.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmariadb3 \
 && rm -rf /var/lib/apt/lists/*

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 appgroup \
 && adduser  --system --uid 1001 --ingroup appgroup appuser

# Copy the pre-built virtual environment and application source from the builder.
COPY --from=builder --chown=appuser:appgroup /app/.venv      ./.venv
COPY --from=builder --chown=appuser:appgroup /app/pyproject.toml ./pyproject.toml
COPY --from=builder --chown=appuser:appgroup /        ./app

# Pre-create the data directory with the correct ownership
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

USER appuser

EXPOSE 8000

# Prepend the venv's bin directory so python & all installed scripts are found.
ENV PATH="/app/.venv/bin:$PATH"

CMD ["python", "server.py"]