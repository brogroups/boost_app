const { connect } = require("mongoose");
require("dotenv").config();



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
