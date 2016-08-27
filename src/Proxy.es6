import Path from 'path'
var v= core.org.voxsoftware.Korpu.Http
var fsSync= core.System.IO.Fs.sync
class Proxy{

	
	
	constructor(server){
		this.$server= server
		server.on("init", ()=>{
			this.initServer()
		})

		server.on("listen", ()=>{
			this.console.log("Proxy disponible: 127.0.0.1:", server.server.port)
		})
	}

	get config(){
		return this.$server.config
	}

	get server(){
		return this.$server
	}
	get internalServer(){
		return this.$server.server
	}

	get console(){
		return this.$server.console
	}	

	get informer(){
		return this.$server.informer
	}

	finalize(args){
		this.server.finalize(args)
	}


	getChannelRequest(req){
		var request= new core.VW.Http.Request(req.request.url)
		for(var id in req.request.headers){
			request.headers[id]= req.request.headers[id]
		}
		// Mandar el boy ...
		req.channel= request
		request.followRedirect= false
		request.validateStatusCode= false
		return request
	}


	get autoResponders(){
		if(!this.$autoresponders)
			this.$autoresponders= new v.AutoResponderList(this, this.config)

		return this.$autoresponders
	}




	initServer(){
		var router=this.internalServer.router, self=this
		router.use("", async function(req){
			self.informer.request(req)
			await self.autoResponders.matchAndExecute(req)
		})
		router.use("", async function(req){
			
			var request= self.getChannelRequest(req)
			request.beginGetResponse()
			req.request.pipe(request.innerRequest) 
			request.innerRequest.pipe(req.response)
			self.finalize(req)
			await request.endGetResponse()
		})
	}

	


	
}
export default Proxy