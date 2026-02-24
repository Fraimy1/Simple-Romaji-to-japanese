FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-warm jamdict so the DB is ready at container start
RUN python -c "from jamdict import Jamdict; jmd = Jamdict(); print('JMDict ready')" || echo "JMDict init skipped"

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
