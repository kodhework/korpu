
require("../main")
var v= core.org.voxsoftware.Korpu.Http


var init= async function(){

	try{
		var config= v.Server.defaultConfig
		var maker= new v.Certificate(config)
		var options= await maker.getForHost("github.com")
		vw.log(options)
		//server= new v.Server(config)
		//proxy= new v.Proxy(server)
		//await server.init(true)
	}
	catch(e){
		vw.error(e)
	}
}

init()