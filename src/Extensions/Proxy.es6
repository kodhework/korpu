


class Proxy{
	
	// async 
	async handle(ev){

		try{
			var proxy= ev.proxy
			var args= ev.request, change
			


			var autoResponders= proxy.autoResponders
			var autoResponder= autoResponders.getById("org.voxsoftware.proxy")
			var proxyUrl= autoResponder.env("proxy")
			
			var req= proxy.getChannelRequest(args)
			req.proxy= proxyUrl
			vw.warning(req.proxy)

			req.beginGetResponse()
			args.request.pipe(req.innerRequest) 
			req.innerRequest.pipe(args.response)
			proxy.finalize(args)
			await req.endGetResponse()


		}
		catch(e){
			proxy.server.console.error(e)
			args.response.end()
		}
		

		
		//vw.error(response.body)
		//args.response.end()

		//return args.continue()

	}


	// Como usar esta extensión
	// se coloca a continuación un ejemplo: 

	static get example(){
		return {

			"match":[
				/http:\/\/*/i, // Aquí va según su necesidad,
				/https:\/\/*/i // Aquí va según su necesidad
			],
			"proxy": "http://91.186.9.174:8080",
			"active": true,
			"id": "org.voxsoftware.proxy", // Esto debe ir tal como está acá
			"require": "korpu:proxy" // Esto también va tal como está


		}

	}


}

export default Proxy