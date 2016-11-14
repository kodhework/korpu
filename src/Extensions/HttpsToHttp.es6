
// Esta es una extensión útil para desarrolladores.
// si están por ejemplo desarrollando un sitio 
// web seguro, y ya se tiene el servidor HTTP
// por medio de este proxy se crea el servidor HTTPS
// y los request se efectúan sobre el HTTP
import Url from 'url'




class HttpsToHttp{
	
	// async 
	async handle(ev){

		return await this._handle(ev, false)

	}


	async _handle(ev, redirect, urlO){
		try{
			var proxy= ev.proxy
			var args= ev.request, change
			


			var autoResponders= proxy.autoResponders
			var autoResponder= autoResponders.getById("org.voxsoftware.httpstohttp")
			autoResponder.prefix= autoResponder.env("prefix")
			var host= autoResponder.env("host") || args.request.headers.host
			var part= args.request.url.substring(7 + autoResponder.prefix.length)
			while(part.startsWith(autoResponder.prefix)){
				part= part.substring(autoResponder.prefix.length)
			}
			args.request.url= "https://"  + part

			var urli= Url.parse(urlO || args.request.url)

			var req= proxy.getChannelRequest(args), repeat
			req.headers["accept-encoding"]= "chunked"
			req.headers["host"]= urli.host	
			vw.error("AQUIIIII")
			delete req.headers["upgrade-insecure-requests"]


			req.method= args.request.method
			req.followRedirect= redirect
			req.beginGetResponse()

			//args.request.pipe(req.innerRequest)
			
			args.request.on("data", function(buf){
				
				req.innerRequest.write(buf)
			})

			req.innerRequest.on("error", function(e){
				if(proxy.server && proxy.server.console)
					proxy.server.console.error(e)
			})


			req.innerRequest.on("response", (response)=>{
				args.response.statusCode= args.response.status= response.statusCode
				var headers= response.headers
				vw.warning("---------------------", response.statusCode+0)
				if(response.statusCode+0==307){



					var u= headers.location
					if(u.startsWith("https://")){
						u= u.substring(8)
						if(u.startsWith(autoResponder.prefix))
							u= u.substring(autoResponder.prefix.length)


						u= "http://" + u
					}
					repeat= u
					return 
				}
				

				var contentType= headers["content-type"]
				var options= ["text/css", "application/json", "text/plain", "text/html", "text/xml"]
				for(var i=0;i<options.length;i++){
					if(contentType && contentType.toLowerCase().indexOf(options[i])>=0){
						change= true
						break
					}

				}


				for(var id in headers){
					if(change){
						if(headers[id])
							args.response.setHeader(id, headers[id].replace? headers[id].replace("https://", "http://"+ autoResponder.prefix): headers[id])
					}
					else{
						args.response.setHeader(id, headers[id])
					}
				}
				args.response.setHeader("Proxy-app", "korpu")



				

				response.on("end", function(){
					//args.response.end()
				})
			})

			req.innerRequest.on("data", (buf)=>{
				if(change)
					return 


				if(repeat)
					return 

				//vw.warning("NO CHANGE")
				args.response.write(buf)
			})

			var response= await req.endGetResponse()
			if(repeat)
				return await this._handle(ev, false, repeat)


			if(change){
				

				//vw.warning("CHANGE", response.body)
				response.body= response.body.replace(/https\:\/\/*/ig, function(e){
					return e.replace("https://", "http://" + autoResponder.prefix)
				})
				//vw.log(response.body)
				args.response.write(response.body)


			}
			args.response.end()
			

		}
		catch(e){
			proxy.server.console.error(e)
			args.response.end()
		}
		return 

		
		//vw.error(response.body)
		//args.response.end()

		//return args.continue()

	}


	// Como usar esta extensión
	// se coloca a continuación un ejemplo: 

	static get example(){
		return {

			"match":[
				/http:\/\/vpn.local.dev\/\S*/i // Aquí va según su necesidad
			],
			"prefix": "vpn.",
			"active": true,
			"id": "org.voxsoftware.httpstohttp", // Esto debe ir tal como está acá
			"require": "korpu:httpstohttp" // Esto también va tal como está

			// En este ejemplo
			// desde el navegador se colocaría 
			// vpn.local.dev e internamente carga https://local.dev

		}

	}


}

export default HttpsToHttp