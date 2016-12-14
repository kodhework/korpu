import Path from 'path'
var v= core.org.voxsoftware.Korpu.Http
var fsSync= core.System.IO.Fs.sync
import Url from 'url'
class Proxy{

	
	
	constructor(server){
		this.$server= server
		this.$server.$proxy= this
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


	async pass1(req){
		this.informer.request(req)
		await this.autoResponders.matchAndExecute(req)
	}


	async pass2(req){
		var request= this.getChannelRequest(req)
		request.beginGetResponse()
		req.request.pipe(request.innerRequest) 
		request.innerRequest.pipe(req.response)
		this.finalize(req)
		await request.endGetResponse()
	}


	pass2NoAwait(req){
		var self= this,request= this.getChannelRequest(req)
		request.beginGetResponse()
		req.request.pipe(request.innerRequest) 
		request.innerRequest.on("error", function(e){
			self.server.console.error(e)
		})
		if(req.response)
			request.innerRequest.pipe(req.response)
		this.finalize(req)
		//await request.endGetResponse()
	}




	addServer(server){


		var router=server.server.router, self=this
		router.use("", this.pass1.bind(this))
		router.use("", this.pass2.bind(this))
	}


	getChannelRequest(req){

		var self= this, url1
		var request= new core.VW.Http.Request(req.request.url)
		if(req.remakeHost)
			url1= Url.parse(req.request.url.toString())
		/*if(req.remakeHost){
			// Proxy this ...
			request.proxy= "http://127.0.0.1:" + this.$server.server.port
		}*/
		//request.proxy= null
		for(var id in req.request.headers){
			if(id.toLowerCase()=="host" && req.remakeHost)
				request.headers[id]= url1.hostname
			else
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
		return this.addServer(this.server)
	}

	


	
}
export default Proxy