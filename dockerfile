# Use official Python image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Copy the backend code into the container
COPY backend/ ./backend/

# Move into backend where app.py lives
WORKDIR /app/backend

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask port
EXPOSE 8000

# Command to run the Flask app
CMD ["python", "app.py"]
