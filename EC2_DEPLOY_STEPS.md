# CareerPilot AI — EC2 + Docker Compose: Step-by-Step Commands

> **By:** Preet Makadiya & Om Kathiriya

---

## 🔧 PART 1: Launch EC2 Instance (AWS Console)

1. Go to **AWS Console → EC2 → Launch Instance**
2. **Name:** `CareerPilot-AI`
3. **AMI:** Ubuntu Server 22.04 LTS
4. **Instance type:** `t2.medium`
5. **Key pair:** Create new → name it `careerpilot-key` → download `.pem` file
6. **Security Group → Add these inbound rules:**

   | Type | Port | Source |
   |------|------|--------|
   | SSH | 22 | My IP |
   | HTTP | 80 | 0.0.0.0/0 |
   | HTTPS | 443 | 0.0.0.0/0 |
   | Custom TCP | 8000 | 0.0.0.0/0 |

7. **Storage:** 20 GB gp3
8. Click **Launch Instance**
9. Copy the **Public IPv4 address** (e.g., `13.232.xx.xx`)

---

## 🔑 PART 2: Connect to EC2

```bash
# Make key file read-only
chmod 400 ~/Downloads/careerpilot-key.pem

# SSH into instance (replace IP)
ssh -i ~/Downloads/careerpilot-key.pem ubuntu@<YOUR_EC2_IP>
```

---

## 📦 PART 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose-v2

# Add user to docker group (no sudo needed for docker)
sudo usermod -aG docker ubuntu

# Apply group change
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 📥 PART 4: Clone & Configure Project

```bash
# Clone your repo (replace with your actual repo URL)
git clone https://github.com/makadiyapreet/CareerPilot_AI.git

# Enter project directory
cd CareerPilot_AI

# Create .env file from template
cp backend/.env.example backend/.env

# Generate a strong secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Edit .env — paste the secret key and fill in your values
nano backend/.env
```

**Inside `nano`, update these values:**
```
SECRET_KEY=<paste-generated-key-here>
ALLOWED_ORIGINS=http://<YOUR_EC2_IP>
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## ✏️ PART 5: Update docker-compose.yml with EC2 IP

```bash
nano docker-compose.yml
```

**Change these two lines:**
```yaml
# Under backend → environment:
- ALLOWED_ORIGINS=http://<YOUR_EC2_IP>

# Under frontend → build → args:
VITE_API_URL: http://<YOUR_EC2_IP>:8000
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🚀 PART 6: Build & Start

```bash
# Build images and start containers (first time)
docker compose up --build -d
```

Wait 2-3 minutes for the build to complete.

```bash
# Check containers are running
docker compose ps

# Check logs (live)
docker compose logs -f
```

Press `Ctrl+C` to exit logs.

---

## ✅ PART 7: Verify

```bash
# Test backend
curl http://localhost:8000/health

# Test frontend
curl -s http://localhost | head -5
```

**Open in browser:**
- Frontend → `http://<YOUR_EC2_IP>`
- Backend API docs → `http://<YOUR_EC2_IP>:8000/docs`

---

## 🛑 STOP / ▶️ START / 🔄 RESTART

```bash
# ── STOP everything ──
docker compose down

# ── START (without rebuild) ──
docker compose up -d

# ── RESTART everything ──
docker compose restart

# ── RESTART only backend ──
docker compose restart backend

# ── RESTART only frontend ──
docker compose restart frontend

# ── FULL REBUILD (after code changes) ──
docker compose down
docker compose up --build -d
```

---

## 📋 USEFUL COMMANDS

```bash
# View running containers
docker compose ps

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Enter backend container shell
docker exec -it careerpilot-backend bash

# Enter frontend container shell
docker exec -it careerpilot-frontend sh

# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -f
```

---

## 🔄 UPDATE AFTER CODE CHANGES

When you push new code to GitHub and want to update on EC2:

```bash
# SSH into EC2
ssh -i ~/Downloads/careerpilot-key.pem ubuntu@<YOUR_EC2_IP>

# Go to project
cd CareerPilot_AI

# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose up --build -d

# Verify
docker compose ps
```

---

## ⚠️ COMMON FIXES

```bash
# Container not starting? Check logs:
docker compose logs backend

# Port already in use?
sudo lsof -i :8000
sudo kill -9 <PID>

# Permission denied on docker?
sudo usermod -aG docker ubuntu
newgrp docker

# Out of disk space?
docker system prune -a -f

# CORS errors in browser?
# → Make sure ALLOWED_ORIGINS in .env matches your frontend URL exactly
```

---

**🎉 You're live at `http://<YOUR_EC2_IP>` !**
