const express = require("express");
const Message = require("../dbMessages")
const router = express.Router();

router.get("/sync", (req, res) => {
    Message.find((err, data) => {
        if(err){
            res.status(501).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

module.exports = router