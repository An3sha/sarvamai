#!/bin/bash

echo "🚀 Setting up Sarvam AI Widget Backend..."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env << EOF
# Sarvam AI API Configuration
SARVAM_API_KEY=your_sarvam_api_key_here

# Server Configuration
PORT=3001
EOF
    echo "✅ .env file created in backend/.env"
    echo "⚠️  Please update backend/.env with your actual Sarvam API key"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your Sarvam API key"
echo "2. Start the backend: cd backend && npm start"
echo "3. Start the frontend: npm run serve"
echo ""
echo "🌐 URLs:"
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo "   Widget Test: http://localhost:3000/test"
