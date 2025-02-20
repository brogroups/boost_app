exports.createSelleryPayed = async (req,res)=>{
    try{}
    catch(error){
        re.status(500).json({
            success:false,
            message:error.message
        })
    }
}