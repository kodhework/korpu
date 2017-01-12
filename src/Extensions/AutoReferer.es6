


class AutoReferer{
	
	// async 
	async handle(ev){

		try{
			var proxy= ev.proxy
			var args= ev.request, change
			


			var autoResponders= proxy.autoResponders
			var autoResponder= autoResponders.getById("org.voxsoftware.autoreferer")
			var referer= autoResponder.env("referer")
			
			var req= proxy.getChannelRequest(args)
			req.headers["referer"]= referer

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
		
	}


	// Como usar esta extensión
	// se coloca a continuación un ejemplo: 

	static get example(){
		return {

			"match":[
				/http:\/\/*/i, // Aquí va según su necesidad,
				/https:\/\/*/i // Aquí va según su necesidad
			],
			"referer": "http://xxx",
			"active": true,
			"id": "org.voxsoftware.autoreferer", // Esto debe ir tal como está acá
			"require": "korpu:referer" // Esto también va tal como está


		}

	}


}

export default AutoReferer