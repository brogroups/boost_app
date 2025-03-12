const { connect } = require("mongoose");
const CustomEncryptor = require("custom-decryptor"); 
require("dotenv").config();

const decryptor = new CustomEncryptor(); 

const encryptedMongoUrl = process.env.HASHED_MONGO_URL; 

// 🔓 MongoDB URL ni decrypt qilish
const mongoUrl = decryptor.decrypt(encryptedMongoUrl);
console.log("Decrypted MongoDB URL:", mongoUrl);

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
