import {EventEmitter} from 'events'
import Path from 'path'
import oUrl from 'url'
var v= core.org.voxsoftware.Korpu.Http
var fsSync= core.System.IO.Fs.sync

class HttpsServer extends v.Server{
	

	awaitListen(){
		var task= new core.VW.Task()
		this.once("listen", function(){
			task.finish()
		})

		return task
	}

	awaitFirstInit(){
		if(this.$inited)
			return 

		return this.awaitInit()
	}


	awaitInit(){
		var task= new core.VW.Task()
		this.once("init", function(){
			task.finish()
		})

		return task
	}


	static addForHostname(hostname, server){
		var g= HttpsServer._servers=HttpsServer._servers||{}
		return g[hostname]= server
	}


	static getForHostname(hostname){
		var g= HttpsServer._servers=HttpsServer._servers||{}
		return g[hostname]
	}


	get hostname(){
		return this.$hostname
	}

	set hostname(v){
		return this.$hostname=v
	}


	async init(throwOnError, port){
		var c=this.console
		try{
			// Inicia el servidor ...
			var server= new core.VW.Http.SecureServer(this.secureOptions)
			/*
			var server= new core.VW.E6Html.Http.SecureServer({
				"cert": this.config.siteCertificate,
				"key": this.config.siteKey
			})
			*/
			this.$server= server
			server.timeout=this.config.timeout
			server.port= port | 0 // Esto es dinámico ...
			//server.path= __dirname 
			server.useBodyParser= false
			
			this.emit("init")

			this.$inited= true
			await server.listen()
			this.initServer()
			this.emit("listen")


			while(true){
				var reqArgs= await server.acceptAsync()
				this._continue(reqArgs);
			}



		}
		catch(e){
			if(throwOnError)
				throw e
			this.console.error(e)
		}
	}





	initServer(){
		var router= this.server.router, self= this	

		this.server.innerServer.on("connect", function(req, socket, head){
			vw.log("No implementado: ", req.url)
		})
	}


	async _continue(req){
		var time= new Date()
		var id= ++v.Server.id
		req.id= id
		
		try{


			
			req.request.url= req.request.protocol + "://"  + req.request.headers.host + req.request.url.trim()
			this.console.request(req.request.method, req.request.url, " ID: ", id)
			await req.catch(req.continue)
			this.console.info("Solicitud completa HTTPS: ", id, " Tiempo: ", new Date()-time, "ms")
		}
		catch(e){
			try{
				req.response.statusCode=500
				try{req.response.write(JSON.stringify({error:e.stack},4,'\t'));}catch(ex){}
				req.response.end()
			}
			catch(ex){}
		}
	}

}
export default HttpsServer