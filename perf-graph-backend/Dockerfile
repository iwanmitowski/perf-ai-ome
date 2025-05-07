FROM python:3.12.9-slim

RUN apt-get update && apt-get install -y build-essential curl wget
WORKDIR /app

COPY requirements.txt ./
RUN mkdir /cert
RUN wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /cert/global-bundle.pem

RUN pip install -r ./requirements.txt

COPY src/ ./
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", ":8088", "--workers", "3", "--timeout", "300", "main:app"]
