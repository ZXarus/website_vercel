if(process.env.NODE_ENV === "production"){
    module.exports = require("../config/production.json")
}else{
    module.exports = require("../config/development.json")
}