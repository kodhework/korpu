
// Archivo que crea un servidor para realizar pruebas ...

init()
var Id=0
function init(){
	let scontinue,init, initServer;
	init= async function(){
		try{
			var server= new core.VW.E6Html.Http.Server()
			server.timeout=460000
			server.port= 1200
			server.path= __dirname + "/dist"
			server.useBodyParser= false
			initServer(server)
			await server.listen()


			vw.log("Servicio disponible: ", server.port)
			while(true){
				var reqArgs= await server.acceptAsync()
				scontinue(reqArgs);
			}
		}
		catch(e){
			vw.error(e)
		}
	}

	initServer= function(server){
		var router=server.router
		router.use("", async function(req){
			
			var request= new core.VW.Http.Request(req.request.url)
			for(var id in req.request.headers){
				request.headers[id]= req.request.headers[id]
			}

			// Mandar el boy ...
			request.validateStatusCode= false
			request.beginGetResponse()
			req.request.pipe(request.innerRequest) 
			request.innerRequest.pipe(req.response)
			await request.endGetResponse()
		})
	}

	scontinue= async function(req){

		// Mostrar en consola las solicitudes
		var time= new Date()
		var id= ++Id
		vw.warning(req.request.method, req.request.url, " Request: ", (id))
		try{
			await req.catch(req.continue)
			vw.log("Request: ", id, " ", new Date()-time , "ms")
		}
		catch(e){
			try{
				req.response.statusCode=500
				try{req.response.write(JSON.stringify({error:e.stack},4,'\t'));}catch(ex){}
				req.response.end()
			}
			catch(ex){}

			vw.warning("Error en request ", id, " Tiempo transcurrido: ", new Date()-time,"ms")
			vw.error(e);
		}
	}
	init();
}
