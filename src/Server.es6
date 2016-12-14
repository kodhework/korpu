import {EventEmitter} from 'events'
import Path from 'path'
import oUrl from 'url'
import Tls from 'tls'
var v= core.org.voxsoftware.Korpu.Http
var fsSync= core.System.IO.Fs.sync

class Server extends EventEmitter{
	
	constructor(config, tcp){
		this.id=0
		if(!config)
			throw new core.System.ArgumentException("Debe especificar el parámetro config")
		this.config= config
		this.$tcpServer= tcp
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

	async init(throwOnError){

		var c=this.console

		try{
			// Inicia el servidor ...
			var server= new core.VW.E6Html.Http.Server()

			/*
			var server= new core.VW.E6Html.Http.SecureServer({
				"cert": this.config.siteCertificate,
				"key": this.config.siteKey
			})
			*/
			this.$server= server
			server.timeout=this.config.timeout
			server.port= this.$tcpServer?0: this.config.port
			server.path= __dirname 
			server.useBodyParser= false
			this.initServer()
			this.emit("init")
			await server.listen()

			
			this.initHttps()
			this.emit("listen")
			//this.console.log("Proxy disponible: 127.0.0.1:", server.port)
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

	finalize(args){
		this.informer.finalize(args)
	}

	captureRequest(args){
		var url= oUrl.parse(args.request.url)
		if(!url.host)
			args.capture= true


	}


	get certificate(){
		if(!this.$certificate)
			this.$certificate= new v.Certificate(this.config)
		return this.$certificate
	}



	connectHandler(req, socket, c){
		var a= req, self= this
		//vw.info("CONNECT ....", req)

		var id= ++this.id
		req.id= id
		var u= require("url").parse("https://"+ a.url)
		this.console.request("CONNECT", a.url, " ID: ", id)
		//vw.info("HHH CONNECT: ", u.hostname)

		var addr = req.url.split(':');
		var net= require("net")


		// Si este requerimiento está definido dentro
		// del parámetro httpsHandle

		var handles= self.config.httpsHandle, handled, handle, credentials
		if(handles){

			for(var i=0;i<handles.length;i++){
				handle= handles[i]
				if(handle=="all")
					handled= true
				else
					handled= handle.test(u.hostname)


				if(handled)
					break
			}


		}



		// Por ahora no sé bien como identificar si es WS o HTTPS
		// así que si el hostname empieza con número se tomará como ws o wss
		// y lo que se hará es transmitir directamente ...

		var primerBuf= Buffer.zero, continuar

		

		socket.write('HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', function() {
			socket.once("data", function(buf){
				primerBuf= buf
				if(buf[0]!=22){
					// Significa que es no seguro...
					handled= false
				}

				continuar()
			})
		
		})
		


		continuar= async function(){
			if(handled){
				var parts= u.hostname.split("."), hostname
				if(parts.length>2){
					parts[0]= "*"
				}
				hostname= parts.join(".")



				try{
					

					// En este punto debería crear un nuevo servidor HTTPS
					// esto no es muy eficiente, pero por ahora nodejs
					// no permite cambiar dinámicamente las crendeciales de un servidor HTTPS 
					var iHttps= v.HttpsServer.getForHostname("default")



					// Por ahora esta parte funciona solo en Linux 
					// Crear un certificado para el sitio
					credentials= await self.certificate.getForHostname(hostname)


					if(!iHttps){
						iHttps= new v.HttpsServer(self.config)
						v.HttpsServer.addForHostname("default", iHttps)


						iHttps.hostname= u.hostname
						iHttps.secureOptions= credentials

						


						// Este método permite obtener un 
						iHttps.secureOptions.SNICallback= (hostname,cb)=>{

							var parts= hostname.split(".")
							if(parts.length>2){
								parts[0]= "*"
							}
							parts= parts.join(".")
							//vw.warning(parts, hostname)


							try{
								var credentials= self.certificate.getCacheForHostname(parts)
								var context= Tls.createSecureContext(credentials)
								return cb?cb(null, context): context
							}
							catch(e){
								self.console.error(e)
							}
						}
						

						setImmediate(()=>{
							iHttps.init()
						})
						
						await iHttps.awaitInit()
						self.$proxy.addServer(iHttps)
						await iHttps.awaitListen()
						
					}
					else{
						await iHttps.awaitFirstInit()
					}

					addr[1]= iHttps.server.port
					addr[0]= "127.0.0.1"

				}
				catch(e){
					self.console.error(e)
					return false
				}

			}




			//creating TCP connection to remote server
			var conn = net.connect(addr[1]||443, addr[0], function() {

				
				conn.write(primerBuf, function(){
					conn.pipe(socket);
			    	socket.pipe(conn);
				})


				/*
			    // tell the client that the connection is established
			    socket.write('HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', function() {
			      // creating pipes in both ends
			      conn.pipe(socket);
			      socket.pipe(conn);
			    });
			    */

			});

			conn.on('error', function(e) {
			    console.log("Server connection error: " + e);
			    socket.end();
			});

		}

		//continuar()
	}


	initHttps(){

		var self= this


		this.server.innerServer.on("connect", this.connectHandler.bind(this))

		

		this.server.innerServer.on('upgrade', function(req, socket, head) {

			vw.info("UPGRADE ... .------------------------------------------------------------------------------------------")
			process.exit()
			var onOutgoingError= function(err) {
		    	server.emit('error', err, req, socket)
		    	socket.end()
		    }

			var continuar= function(args){


				var proxyReq= args.channel

				proxyReq.on('response', function (res) {
			      // if upgrade event isn't going to happen, close the socket
			      if (!res.upgrade) socket.end();
			    });

			    proxyReq.on('upgrade', function(proxyRes, proxySocket, proxyHead) {
			      proxySocket.on('error', onOutgoingError);

			      // Allow us to listen when the websocket has completed
			      proxySocket.on('end', function () {
			        server.emit('close', proxyRes, proxySocket, proxyHead);
			      });

			      // The pipe below will end proxySocket if socket closes cleanly, but not
			      // if it errors (eg, vanishes from the net and starts returning
			      // EHOSTUNREACH). We need to do that explicitly.
			      socket.on('error', function () {
			        proxySocket.end();
			      });

			      //common.setupSocket(proxySocket);

			      if (proxyHead && proxyHead.length) proxySocket.unshift(proxyHead);

			      //
			      // Remark: Handle writing the headers to the socket when switching protocols
			      // Also handles when a header is an array
			      //
			      socket.write(
			        Object.keys(proxyRes.headers).reduce(function (head, key) {
			          var value = proxyRes.headers[key];

			          if (!Array.isArray(value)) {
			            head.push(key + ': ' + value);
			            return head;
			          }

			          for (var i = 0; i < value.length; i++) {
			            head.push(key + ': ' + value[i]);
			          }
			          return head;
			        }, ['HTTP/1.1 101 Switching Protocols'])
			        .join('\r\n') + '\r\n\r\n'
			      );

			      proxySocket.pipe(socket).pipe(proxySocket);


			    })

			}



			var args={
				"request": req,
				"continue": function(args){
					args.continue= continuar
					return self.proxy.pass2NoAwait(args)
				},
				"socket": socket
			}
			self.proxy.pass1(args)

		})


		
	}


	get proxy(){
		return this.$proxy
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
		var id= ++Server.id
		req.id= id
		
		try{

			var h
			//vw.info(req.request.headers, req.request.protocol)	
			if(req.request.url.startsWith("/http://") || req.request.url.startsWith("/https://")){
				req.request.url= req.request.url.substring(1)
			}		
			else if(req.request.url.startsWith("/")){
				if(req.request.headers.host){
					h= req.request.headers.host.split(":")
					//vw.log(h, this.server.port)
					if(["127.0.0.1","localhost"].indexOf(h[0])<0 || (h[1]|0) != this.config.port)
						req.request.url= req.request.protocol + "://" + req.request.headers.host + req.request.url
				}
				
			}
			
			req.request.url=req.request.url.trim()
			this.console.request("j+"+req.request.method, req.request.url, " ID: ", id)
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

Server.id=0
export default Server