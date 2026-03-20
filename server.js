import mongoose from 'mongoose';
import app from './src/app.js';

const MONGODB_URI = "mongodb+srv://khanhduylenguyen74_db_user:Guwa67x6n8U24vlH@cluster0.rqijgek.mongodb.net/?appName=Cluster0";
const PORT = 3000;

const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Ket Noi MongoDB Thanh Cong');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Loi ket noi MongoDB");
        process.exit(1);
    }
};

startServer();
