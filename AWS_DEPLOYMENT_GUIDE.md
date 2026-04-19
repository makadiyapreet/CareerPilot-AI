# 🚀 CareerPilot AI — AWS Deployment Guide

> **Authors:** Preet Makadiya & Om Kathiriya  
> **Stack:** FastAPI (Python) · React + Vite · SQLite · Docker · AWS EC2  
> **Last Updated:** April 2026

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Architecture Overview](#2-architecture-overview)
3. [Option A — EC2 with Docker Compose (Recommended)](#3-option-a--ec2-with-docker-compose-recommended)
4. [Option B — EC2 Manual Setup (No Docker)](#4-option-b--ec2-manual-setup-no-docker)
5. [Domain & SSL Setup](#5-domain--ssl-setup)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Troubleshooting](#7-troubleshooting)
8. [Cost Estimates](#8-cost-estimates)

---

## 1. Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **AWS Account** | Cloud hosting | [aws.amazon.com](https://aws.amazon.com) |
| **AWS CLI** | Command-line access | `brew install awscli` (Mac) |
| **Docker** | Containerization | [docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Git** | Source control | `brew install git` |
| **SSH Key Pair** | EC2 access | Created in AWS Console |

### AWS CLI Setup

```bash
aws configure
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region name: ap-south-1       # Mumbai (closest to India)
# Default output format: json
```

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                       │
│                 (Ubuntu 22.04 LTS)                        │
│                                                          │
│  ┌──────────────┐        ┌──────────────────────┐        │
│  │   Nginx      │ :80    │   FastAPI (Backend)   │ :8000  │
│  │  (Frontend   │───────▶│   uvicorn             │        │
│  │   static +   │  proxy │   SQLite DB           │        │
│  │   reverse    │        │   NLTK / ML models    │        │
│  │   proxy)     │        └──────────────────────┘        │
│  └──────────────┘                                        │
│         ▲                                                │
│         │ :80 / :443                                     │
└─────────┼────────────────────────────────────────────────┘
          │
      Internet
    (Users / Browsers)
```

---

## 3. Option A — EC2 with Docker Compose (Recommended)

This is the **fastest** way to deploy. Both services run in Docker containers.

### Step 1: Launch an EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure:
   - **Name:** `CareerPilot-AI`
   - **AMI:** Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance type:** `t2.medium` (2 vCPU, 4 GB RAM — needed for ML deps)
   - **Key pair:** Create or select an existing key pair (download the `.pem` file)
   - **Security Group:** Allow these inbound rules:

   | Type | Port | Source |
   |------|------|--------|
   | SSH | 22 | Your IP |
   | HTTP | 80 | 0.0.0.0/0 |
   | HTTPS | 443 | 0.0.0.0/0 |
   | Custom TCP | 8000 | 0.0.0.0/0 |

3. **Launch** the instance and note the **Public IPv4** address.

### Step 2: Connect to EC2

```bash
# Make key file read-only
chmod 400 ~/Downloads/CareerPilot-AI.pem

# SSH into the instance
ssh -i ~/Downloads/CareerPilot-AI.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Step 3: Install Docker & Docker Compose on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2

# Add ubuntu user to docker group (avoids sudo for docker commands)
sudo usermod -aG docker ubuntu

# Apply group change (or logout/login)
newgrp docker

# Verify
docker --version
docker compose version
```

### Step 4: Clone & Configure the Project

```bash
# Clone repository
git clone https://github.com/<your-username>/CareerPilot_AI.git
cd CareerPilot_AI

# Create backend .env from template
cp backend/.env.example backend/.env
nano backend/.env
```

**Edit `backend/.env` with production values:**

```env
SECRET_KEY=<generate-a-strong-random-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./careerboost.db
UPLOAD_FOLDER=uploads/
ALLOWED_ORIGINS=http://<YOUR_EC2_PUBLIC_IP>,http://<YOUR_DOMAIN>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

> **💡 Tip:** Generate a strong secret key:
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```

### Step 5: Update Docker Compose for Production

Edit the `VITE_API_URL` build arg in `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Change the frontend build arg:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      VITE_API_URL: http://<YOUR_EC2_PUBLIC_IP>:8000
```

Also update `ALLOWED_ORIGINS` in the backend environment:

```yaml
backend:
  environment:
    - ALLOWED_ORIGINS=http://<YOUR_EC2_PUBLIC_IP>
```

### Step 6: Build & Run

```bash
# Build and start all services
docker compose up --build -d

# Check containers are running
docker compose ps

# View logs
docker compose logs -f
```

### Step 7: Verify Deployment

```bash
# Test backend API
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Test frontend (should return HTML)
curl -s http://localhost | head -5
```

Now open `http://<YOUR_EC2_PUBLIC_IP>` in your browser — you should see CareerPilot AI! 🎉

---

## 4. Option B — EC2 Manual Setup (No Docker)

If you prefer running without Docker.

### Step 1–2: Same as Option A

(Launch EC2 and SSH into it)

### Step 3: Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx
```

### Step 4: Setup Backend

```bash
cd ~/CareerPilot_AI/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLP data
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('omw-1.4')"

# Create .env
cp .env.example .env
nano .env    # fill in production values

# Test that the server starts
uvicorn main:app --host 0.0.0.0 --port 8000
# Ctrl+C to stop after verifying
```

### Step 5: Create Systemd Service for Backend

```bash
sudo nano /etc/systemd/system/careerpilot-backend.service
```

Paste:

```ini
[Unit]
Description=CareerPilot AI Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/CareerPilot_AI/backend
Environment=PATH=/home/ubuntu/CareerPilot_AI/backend/venv/bin:/usr/bin
ExecStart=/home/ubuntu/CareerPilot_AI/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable careerpilot-backend
sudo systemctl start careerpilot-backend
sudo systemctl status careerpilot-backend
```

### Step 6: Build & Serve Frontend

```bash
cd ~/CareerPilot_AI/frontend

# Install node deps and build
npm ci
VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000 npm run build

# Copy build output to Nginx serving directory
sudo rm -rf /var/www/careerpilot
sudo mkdir -p /var/www/careerpilot
sudo cp -r dist/* /var/www/careerpilot/
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/careerpilot
```

Paste:

```nginx
server {
    listen 80;
    server_name <YOUR_EC2_PUBLIC_IP>;

    root /var/www/careerpilot;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy to FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/careerpilot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Domain & SSL Setup

### Point Domain to EC2

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an **A record**:
   - **Name:** `@` (or subdomain like `app`)
   - **Value:** `<YOUR_EC2_PUBLIC_IP>`
   - **TTL:** 300

### Free SSL with Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically — verify:
sudo certbot renew --dry-run
```

After SSL, update your environment:

```bash
# Update backend ALLOWED_ORIGINS to use https
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# If using Docker, rebuild frontend with https API URL
VITE_API_URL=https://yourdomain.com/api
```

---

## 6. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key (keep secret!) | `a3f8b2c...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifespan | `1440` |
| `DATABASE_URL` | SQLite connection string | `sqlite:///./careerboost.db` |
| `UPLOAD_FOLDER` | File upload path | `uploads/` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `https://yourdomain.com` |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Email username | `user@gmail.com` |
| `SMTP_PASSWORD` | Email app password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM_EMAIL` | Sender address | `user@gmail.com` |

---

## 7. Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| **Connection refused on port 8000** | Check EC2 Security Group allows port 8000 inbound |
| **CORS errors in browser** | Make sure `ALLOWED_ORIGINS` includes your frontend URL |
| **502 Bad Gateway** | Backend not running — check `docker compose logs backend` or `systemctl status careerpilot-backend` |
| **Frontend shows blank page** | Check `VITE_API_URL` was set correctly during build |
| **Permission denied on .pem file** | Run `chmod 400 your-key.pem` |
| **NLTK download errors** | Run NLTK downloads manually inside container: `docker exec -it careerpilot-backend python -c "import nltk; nltk.download('all')"` |

### Useful Commands

```bash
# Docker
docker compose ps                       # Check container status
docker compose logs -f backend          # Stream backend logs
docker compose restart backend          # Restart backend
docker compose down && docker compose up --build -d   # Full rebuild

# Systemd (non-Docker)
sudo systemctl status careerpilot-backend
sudo journalctl -u careerpilot-backend -f    # Stream logs

# Nginx
sudo nginx -t                           # Test config
sudo systemctl reload nginx             # Apply config changes
```

---

## 8. Cost Estimates (Mumbai Region — ap-south-1)

| Resource | Specification | Monthly Cost |
|----------|--------------|--------------|
| **EC2** (t2.micro) | 1 vCPU, 1 GB RAM — Free Tier | **$0** (1st year) |
| **EC2** (t2.medium) | 2 vCPU, 4 GB RAM — recommended | **~$27/mo** |
| **EBS Storage** | 20 GB gp3 | **~$1.60/mo** |
| **Data Transfer** | First 100 GB/mo | **$0** |
| **Elastic IP** | While attached to running instance | **$0** |
| **Domain** | Optional | **~$10-15/year** |
| **SSL** | Let's Encrypt | **Free** |

> **💡 Free Tier:** If you're within the first 12 months of AWS, a `t2.micro` instance is free. It will work for demo/testing but may be slow for ML workloads. Use `t2.medium` for production.

---

## 🎯 Quick Deploy Checklist

```
□  Launch EC2 (Ubuntu 22.04, t2.medium, Security Group configured)
□  SSH into instance
□  Install Docker & Docker Compose
□  Clone repo & create backend/.env
□  Update docker-compose.yml with EC2 IP
□  Run: docker compose up --build -d
□  Verify: curl http://<EC2_IP>/health
□  (Optional) Point domain & setup SSL with Certbot
□  🎉 Live!
```

---

**Built with ❤️ by Preet Makadiya & Om Kathiriya**
