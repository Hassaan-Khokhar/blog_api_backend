import mongoose from 'mongoose';
import config from '../config/env.js';
import Users from '../models/userModel.js';

const runMigration = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('Connected!');

        console.log('Executing Zero-Data Liability Purge...');
        
        // Use $unset to completely delete the field from all documents
        const result = await Users.updateMany(
            {}, 
            { $unset: { encryptedKycData: 1 } }
        );

        console.log(`Purge Complete! Successfully wiped PII data from ${result.modifiedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
