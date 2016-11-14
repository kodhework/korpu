import Net from 'net'
var v= core.org.voxsoftware.Korpu.Http
import Tls from 'tls'
import {EventEmitter} from 'events'
class TcpServer extends EventEmitter{
	

	constructor(config){
		if(!config)
			throw new core.System.ArgumentException("Debe especificar el parámetro config")
		this.config= config


	}
	
	async init(throwOnError){
		await this.createConn()
		await this.httpServer.init()
	}


	get httpServer(){
		if(!this.$httpServer)
			this.$httpServer= new v.Server(this.config, this)

		return this.$httpServer
	}


	get server(){
		return this.$server
	}


	createConn(){
		var task= new core.VW.Task(), server
		server= Net.createServer(this.tcpConnection.bind(this))
		server.on("error", (e)=>{
			this.console.error(e)
		})
		this.$server= server
		server.listen(this.config.port, function(err){
			if(err)
				task.exception= err

			task.finish()
		})


		return task

	}


	get certificate(){
		if(!this.$certificate)
			this.$certificate= new v.Certificate(this.config)
		return this.$certificate
	}


	async getHttpsServer(){


		var hostname= "localhost"
		var self= this
		var iHttps= v.HttpsServer.getForHostname("default")


		// Por ahora esta parte funciona solo en Linux 
		// Crear un certificado para el sitio
		var credentials= await self.certificate.getForHostname(hostname)


		try{
			if(!iHttps){
				iHttps= new v.HttpsServer(self.config)
				v.HttpsServer.addForHostname("default", iHttps)


				iHttps.hostname= hostname
				iHttps.secureOptions= credentials

				


				// Este método permite obtener un 
				iHttps.secureOptions.SNICallback= (hostname,cb)=>{

					var parts= hostname.split(".")
					if(parts.length>2){
						parts[0]= "*"
					}
					parts= parts.join(".")


					try{

						if(cb){
							self.certificate.getForHostname(parts).then(function(credentials){
								var context= Tls.createSecureContext(credentials)
								return cb(null, context)
							}).catch(function(err){
								return cb(err)
							})
						}
						else{
							var credentials2= self.certificate.getCacheForHostName(parts)
							var context= Tls.createSecureContext(credentials2)
							return context
						}
					}
					catch(e){
						self.console.error(e)
					}
				}
				

				setImmediate(()=>{
					iHttps.init()
				})
				
				await iHttps.awaitInit()
				self.httpServer.$proxy.addServer(iHttps)
				await iHttps.awaitListen()
				
			}
			else{
				await iHttps.awaitFirstInit()
			}

			//addr[1]= iHttps.server.port
			//addr[0]= "127.0.0.1"

		}
		catch(e){
			self.console.error(e)
			return false
		}



		return iHttps
	}

	get console(){
		if(!this.$console)
			this.$console= this.config.console

		return this.$console
	}


	tcpConnection(conn) {

		vw.log("Conexión recibida",arguments.length)
		var self= this

		conn.on("error", function(e){
			self.console.error(e)
		})

	    conn.once('data', function (buf) {

	        var address
	        var continuar= function(){
	        
		        var proxy = Net.createConnection(address, function () {
		            proxy.write(buf);
		            conn.pipe(proxy).pipe(conn);
		        })

		    }


		    var useHttps= self.config.useHttps

	        if(!useHttps || buf[0]!=22){
	        	// usa el servidor http normalmente ...
	        	address= self.httpServer.server.port //(buf[0] === 22) ? this.httpServer : redirectAddress
	        	continuar()
	        }
	        else{



	        	self.getHttpsServer().then(function(httpsServer){
	        		
	        		address= httpsServer.server.port
	        		//vw.info(address)
	        		continuar()
	        	}).catch(function(err){
	        		vw.error(err)
	        	})
	        }

	       
	    })
	}




	
}
export default TcpServer