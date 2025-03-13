const { connect } = require("mongoose");
require("dotenv").config();


<<<<<<< HEAD
const encryptedMongoUrl = process.env.HASHED_MONGO_URL; 
const mongoUrl = decryptor.decrypt(encryptedMongoUrl);
=======
>>>>>>> 78db24db7178d1e1be19a6971be8029b4c882f44

const ConnecToDb = async () => {
    console.log("MongoDB is loading...");
    try {
        await connect(process.env.MONGO_URL);
        console.log("MongoDB is connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

module.exports = ConnecToDb;
