FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install openpyxl

# Create app structure
COPY app/ /app/app/
COPY run.py /app/

# Create query package
RUN mkdir -p /app/query
COPY query/*.py /app/query/

# Create an __init__.py file to make query directory a package
RUN touch /app/query/__init__.py

# Set environment variables with defaults
ENV PORT=8080
ENV PYTHONPATH=/app

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"] 