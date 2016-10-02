var Module= new core.VW.Module(__dirname)
Module.loadConfigFile("./core-modules.json")
Module.import()
core.org.voxsoftware.Korpu.Http.version= require("./package.json").version
module.exports= core.org.voxsoftware.Korpu.Http