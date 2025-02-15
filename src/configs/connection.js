const { connect } = require("mongoose");
require("dotenv").config()

const ConnecToDb = async () => {
    try{
        await connect(process.env.MONGO_URL)
        console.log("mongodb is connected");
    }
    catch(error){
        console.error("mongodb is not connected error:",error)
    }
}
module.exports = ConnecToDb