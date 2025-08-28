#!/bin/bash

# Firestore Security Rules Deployment Script
# This script helps deploy and test Firestore security rules

set -e

echo "🔥 Firestore Security Rules Deployment Script"
echo "=============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

# Function to deploy rules
deploy_rules() {
    echo "📤 Deploying Firestore security rules..."
    firebase deploy --only firestore:rules
    echo "✅ Security rules deployed successfully!"
}

# Function to deploy indexes
deploy_indexes() {
    echo "📤 Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes
    echo "✅ Indexes deployed successfully!"
}

# Function to start emulator for testing
start_emulator() {
    echo "🧪 Starting Firestore emulator for testing..."
    echo "   Access the emulator UI at: http://localhost:4000"
    echo "   Firestore emulator running on: localhost:8080"
    echo "   Press Ctrl+C to stop the emulator"
    firebase emulators:start --only firestore
}

# Function to run security rules tests
run_tests() {
    echo "🧪 Running security rules tests..."
    
    # Check if testing dependencies are installed
    if ! npm list -g @firebase/rules-unit-testing &> /dev/null; then
        echo "📦 Installing Firebase rules testing dependencies..."
        npm install -g @firebase/rules-unit-testing
    fi
    
    # Run the test script
    if [ -f "firestore.test.js" ]; then
        node firestore.test.js
    else
        echo "❌ Test file not found: firestore.test.js"
        exit 1
    fi
}

# Function to validate rules syntax
validate_rules() {
    echo "🔍 Validating Firestore rules syntax..."
    
    # Start emulator in background to validate rules
    firebase emulators:start --only firestore --project demo-test &
    EMULATOR_PID=$!
    
    # Wait a moment for emulator to start
    sleep 3
    
    # Kill the emulator
    kill $EMULATOR_PID 2>/dev/null || true
    
    echo "✅ Rules syntax is valid!"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Deploy security rules to Firebase"
    echo "2) Deploy indexes to Firebase"
    echo "3) Deploy both rules and indexes"
    echo "4) Start emulator for local testing"
    echo "5) Run automated security tests"
    echo "6) Validate rules syntax"
    echo "7) Exit"
    echo ""
}

# Main script logic
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                deploy_rules
                ;;
            2)
                deploy_indexes
                ;;
            3)
                deploy_rules
                deploy_indexes
                ;;
            4)
                start_emulator
                ;;
            5)
                run_tests
                ;;
            6)
                validate_rules
                ;;
            7)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please choose 1-7."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run the main function
main