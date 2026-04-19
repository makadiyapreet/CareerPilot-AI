#!/bin/bash

# CareerPilot Roadmap Feature - Quick Setup & Test Script
# Run this script to verify everything is working

echo "🚀 CareerPilot Roadmap Feature - Setup & Test"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -d "ai_ml" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the CareerPilot root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Checking roadmap templates...${NC}"
if [ -f "ai_ml/roadmap_generator/roadmap_templates.json" ]; then
    echo -e "${GREEN}✅ Roadmap templates found${NC}"

    # Validate JSON
    if python3 -c "import json; json.load(open('ai_ml/roadmap_generator/roadmap_templates.json'))" 2>/dev/null; then
        echo -e "${GREEN}✅ Templates are valid JSON${NC}"

        # Count roles
        role_count=$(python3 -c "import json; print(len(json.load(open('ai_ml/roadmap_generator/roadmap_templates.json'))))" 2>/dev/null)
        echo -e "${GREEN}✅ Found $role_count career roles${NC}"
    else
        echo -e "${RED}❌ Templates JSON is invalid${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Templates file not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Step 2: Testing roadmap generator module...${NC}"
python3 -c "
import sys
sys.path.append('ai_ml')
from roadmap_generator.roadmap_generator import generate_roadmap, get_available_roles

try:
    # Test generate_roadmap
    result = generate_roadmap('Data Analyst', [], 'beginner')
    assert result.get('target_role') == 'Data Analyst', 'Role mismatch'
    assert len(result.get('steps', [])) > 0, 'No steps generated'
    assert len(result['steps'][0].get('resources', [])) > 0, 'No resources'
    print('✅ Roadmap generation working')

    # Test get_available_roles
    roles = get_available_roles()
    assert len(roles) > 0, 'No roles available'
    print(f'✅ Available roles: {len(roles)}')

    print('✅ All module tests passed')
except Exception as e:
    print(f'❌ Module test failed: {e}')
    sys.exit(1)
" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Roadmap generator module is working${NC}"
else
    echo -e "${RED}❌ Roadmap generator has issues${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Step 3: Checking backend dependencies...${NC}"
if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    cd backend
    python3 -m venv venv
    cd ..
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Step 4: Checking frontend dependencies...${NC}"
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Node modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  Node modules not found. Run 'cd frontend && npm install'${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📝 To start the application:"
echo ""
echo "   1. Start Backend:"
echo "      cd backend"
echo "      source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "      pip install -r requirements.txt"
echo "      uvicorn main:app --reload --port 8000"
echo ""
echo "   2. Start Frontend (in new terminal):"
echo "      cd frontend"
echo "      npm install  # if not done"
echo "      npm run dev"
echo ""
echo "   3. Open browser to: http://localhost:5173"
echo ""
echo "   4. Navigate to /roadmap page and generate a roadmap"
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Setup complete! Happy learning!${NC}"
