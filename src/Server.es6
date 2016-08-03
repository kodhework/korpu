import {EventEmitter} from 'events'
import Path from 'path'
import oUrl from 'url'
var v= core.org.voxsoftware.Korpu.Http
var fsSync= core.System.IO.Fs.sync

class Server extends EventEmitter{
	
	constructor(config){
		this.id=0
		if(!config)
			throw new core.System.ArgumentException("Debe especificar el parámetro config")
		this.config= config
	}

	static get defaultConfig(){
		var home=  process.env.HOME ||process.env.USERPROFILE
		var defPath= Path.join(home, ".korpu")
		if(!fsSync.exists(defPath))
			fsSync.mkdir(defPath)


		defPath= Path.join(defPath, "config.es6")
		if(!fsSync.exists(defPath)){
			fsSync.writeFile(defPath, fsSync.readFile(Path.join(__dirname, "config.es6")))
		}
		return new v.Configuration(defPath)
	}

	get console(){
		if(!this.$console)
			this.$console= this.config.console

		return this.$console
	}

	get informer(){
		if(!this.$informer)
			this.$informer= this.config.informer

		return this.$informer
	}


	get server(){
		return this.$server
	}

	async init(){

		var c=this.console

		try{
			// Inicia el servidor ...
			var server= new core.VW.E6Html.Http.Server()
			this.$server= server
			server.timeout=this.config.timeout
			server.port= this.config.port
			server.path= __dirname 
			server.useBodyParser= false
			this.initServer()


			this.emit("init")
			await server.listen()

			this.emit("listen")
			//this.console.log("Proxy disponible: 127.0.0.1:", server.port)
			while(true){
				var reqArgs= await server.acceptAsync()
				this._continue(reqArgs);
			}
		}
		catch(e){
			this.console.error(e)
		}
	}

	finalize(args){
		this.informer.finalize(args)
	}

	captureRequest(args){
		var url= oUrl.parse(args.request.url)
		if(!url.host)
			args.capture= true


	}

	initServer(){
		var router= this.server.router, self= this
		

		
		router.use("/api", function(args){
			self.captureRequest(args)
			if(!args.capture)
				return args.continue()

			core.VW.Http.Server.bodyParser.urlencoded({ extended: false })
			(args.request, args.response, args.continue)
		})
			
		router.get("/api/requestes/body", async function(args){
			if(!args.capture)
				return args.continue()

			var data= await self.informer.getRequestesBody({
				id: args.request.query.id
			})

			var json= new v.JsonResponse(args)
			json.write(data)
		})

		router.get("/api/requestes", async function(args){
			if(!args.capture)
				return args.continue()


			var data= await self.informer.getRequestes({
				id: args.request.query.id
			})

			var json= new v.JsonResponse(args)
			json.write(data)
		})

		

		router.get("/api/responses", async function(args){
			if(!args.capture)
				return args.continue()
				
			var data= await self.informer.getResponses({
				id: args.request.query.id
			})

			var json= new v.JsonResponse(args)
			json.write(data)
		})
		
		
	}


	async _continue(req){
		var time= new Date()
		var id= ++this.id
		req.id= id
		
		try{
			req.request.url=req.request.url.trim()
			this.console.request(req.request.method, req.request.url, " ID: ", id)
			await req.catch(req.continue)
			this.console.info("Solicitud completa: ", id, " Tiempo: ", new Date()-time, "ms")
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
export default Server