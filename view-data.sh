#!/bin/bash

# FaceFace Database Viewer
# Quick script to view your user and group data

echo "╔════════════════════════════════════════════════════╗"
echo "║    FaceFace Database Viewer                        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Start it with: brew services start mongodb-community"
    exit 1
fi

echo "📊 Database: faceface_db"
echo ""

# Count users
USER_COUNT=$(mongosh faceface_db --quiet --eval "db.users.countDocuments()" 2>/dev/null | tail -n 1)
echo "👥 Total Users: $USER_COUNT"

# Count groups  
GROUP_COUNT=$(mongosh faceface_db --quiet --eval "db.groups.countDocuments()" 2>/dev/null | tail -n 1)
echo "📚 Total Groups: $GROUP_COUNT"

echo ""
echo "════════════════════════════════════════════════════"
echo ""

# Show menu
echo "What would you like to view?"
echo ""
echo "1) All Users (without passwords)"
echo "2) All Groups"
echo "3) User Details (by email)"
echo "4) Group Details (by name)"
echo "5) Statistics"
echo "6) Open MongoDB Shell"
echo "7) Exit"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo ""
        echo "═══ ALL USERS ═══"
        mongosh faceface_db --quiet --eval "db.users.find({}, { password: 0 }).forEach(u => print('\nName:', u.name, '\nEmail:', u.email, '\nCreated:', u.createdAt, '\n---'))" 2>/dev/null
        ;;
    2)
        echo ""
        echo "═══ ALL GROUPS ═══"
        mongosh faceface_db --quiet --eval "db.groups.find().forEach(g => print('\nGroup:', g.name, '\nDescription:', g.description, '\nMax Members:', g.max_teilnehmer, '\nCurrent Members:', g.members.length, '\nCreated:', g.createdAt, '\n---'))" 2>/dev/null
        ;;
    3)
        read -p "Enter email address: " email
        echo ""
        echo "═══ USER DETAILS ═══"
        mongosh faceface_db --quiet --eval "printjson(db.users.findOne({ email: '$email' }, { password: 0 }))" 2>/dev/null
        ;;
    4)
        read -p "Enter group name: " groupname
        echo ""
        echo "═══ GROUP DETAILS ═══"
        mongosh faceface_db --quiet --eval "printjson(db.groups.findOne({ name: '$groupname' }))" 2>/dev/null
        ;;
    5)
        echo ""
        echo "═══ STATISTICS ═══"
        echo ""
        echo "Users registered today:"
        mongosh faceface_db --quiet --eval "db.users.countDocuments({ createdAt: { \$gte: new Date(new Date().setHours(0,0,0,0)) } })" 2>/dev/null | tail -n 1
        echo ""
        echo "Groups created today:"
        mongosh faceface_db --quiet --eval "db.groups.countDocuments({ createdAt: { \$gte: new Date(new Date().setHours(0,0,0,0)) } })" 2>/dev/null | tail -n 1
        echo ""
        echo "Average group size:"
        mongosh faceface_db --quiet --eval "const result = db.groups.aggregate([{ \$project: { memberCount: { \$size: '\$members' } } }, { \$group: { _id: null, avg: { \$avg: '\$memberCount' } } }]).toArray(); print(result[0]?.avg || 0)" 2>/dev/null | tail -n 1
        ;;
    6)
        echo ""
        echo "Opening MongoDB Shell..."
        echo "Useful commands:"
        echo "  db.users.find({}, { password: 0 }).pretty()"
        echo "  db.groups.find().pretty()"
        echo "  exit (to quit)"
        echo ""
        mongosh faceface_db
        ;;
    7)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════"












