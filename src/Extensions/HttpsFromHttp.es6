
// Esta es una extensión útil para desarrolladores.
// si están por ejemplo desarrollando un sitio 
// web seguro, y ya se tiene el servidor HTTP
// por medio de este proxy se crea el servidor HTTPS
// y los request se efectúan sobre el HTTP





class HttpsFromHttp{
	
	// async 
	async handle(ev){

		try{
			var proxy= ev.proxy
			var args= ev.request
			


			var autoResponders= proxy.autoResponders
			var autoResponder= autoResponders.getById("org.voxsoftware.httpsfromhttp")
			var host= autoResponder.env("host") || args.request.headers.host
			args.request.url= "http://"  + args.request.url.substring(8)


			var req= proxy.getChannelRequest(args)
			req.method= args.request.method
			
			req.beginGetResponse()

			//args.request.pipe(req.innerRequest)
			
			args.request.on("data", function(buf){
				vw.log(buf.toString())
				req.innerRequest.write(buf)
			})

			req.innerRequest.on("error", function(e){
				if(proxy.server && proxy.server.console)
					proxy.server.console.error(e)
			})


			req.innerRequest.on("response", (response)=>{
				args.response.statusCode= args.response.status= response.statusCode
				var headers= response.headers
				for(var id in headers){
					args.response.setHeader(id, headers[id])
				}
				args.response.setHeader("Proxy-app", "korpu")
				response.on("end", function(){
					args.response.end()
				})
			})

			req.innerRequest.on("data", (buf)=>{
				args.response.write(buf)
			})

			var response= await req.endGetResponse()
			//args.response.end()
			

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
				/http:\/\/local.dev\/\S*/i // Aquí va según su necesidad
			],
			"active": true,
			"id": "org.voxsoftware.httpsfromhttp", // Esto debe ir tal como está acá
			"require": "korpu:httpsfromhttp", // Esto también va tal como está, 
			"host": "local.dev" // esto es opcional. Si se deja vacío se toma el mismo del request 

		}

	}


}

export default HttpsFromHttp