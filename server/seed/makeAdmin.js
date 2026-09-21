import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const makeAdmin = async () => {
    try {
        await connectDB();
        
        // Find the user by the email you registered with
        const user = await User.findOne({ email: 'test@example.com' }); // Update this if you used a different email!

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`Success! ${user.name} is now an Admin.`);
        } else {
            console.log('User not found. Check the email address.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

makeAdmin();