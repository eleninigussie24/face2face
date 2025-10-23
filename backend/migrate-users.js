// Migration script to add profile fields to existing users
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faceface_db';

async function migrateUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find all users without profile fields
        const usersToUpdate = await User.find({
            $or: [
                { studiengang: { $exists: false } },
                { semester: { $exists: false } },
                { module: { $exists: false } }
            ]
        });

        console.log(`Found ${usersToUpdate.length} users to migrate`);

        if (usersToUpdate.length > 0) {
            // Update users with default profile values
            const result = await User.updateMany(
                {
                    $or: [
                        { studiengang: { $exists: false } },
                        { semester: { $exists: false } },
                        { module: { $exists: false } }
                    ]
                },
                {
                    $set: {
                        studiengang: '',
                        semester: null,
                        module: []
                    }
                }
            );

            console.log(`Successfully migrated ${result.modifiedCount} users`);
        } else {
            console.log('All users already have profile fields');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrateUsers();

