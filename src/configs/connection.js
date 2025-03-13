const { connect } = require("mongoose");
const CustomEncryptor = require("custom-decryptor"); 
require("dotenv").config();

const decryptor = new CustomEncryptor(); 

const encryptedMongoUrl = process.env.HASHED_MONGO_URL; 
const mongoUrl = decryptor.decrypt(encryptedMongoUrl);

const ConnecToDb = async () => {
    console.log("MongoDB is loading...");
    try {
        await connect(mongoUrl);
        console.log("MongoDB is connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

module.exports = ConnecToDb;
