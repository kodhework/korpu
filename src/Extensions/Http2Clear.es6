
var v= core.org.voxsoftware.Korpu.Extensions.Http2Clear


// Esto se tomó del proyecto https://github.com/voxsoftware/korpu-http2-clear
// que desde ahora queda obsoleto, debido a que ahora se incluirá la extensión
// directamente en Korpu

class Http2Clear{
	
	handle(ev){

		// Lo que se debe hacer es sencillo, debido a las facilidades que ofrece 
		// vox-core, simplemente se evita que se mande en el header Connection 
		// la palabra Upgrade 

		ev.request.response.on("setheader", function(e){

			var y
			if(e.arguments[0]){
				if(e.arguments[0].toUpperCase()=="CONNECTION"){
					y= e.arguments[1].toUpperCase().indexOf("UPGRADE")
					if(y>=0)
						e.arguments[1]=e.arguments[1].substring(0,y)+e.arguments[1].substring(y+7)
					if(e.arguments[1][0]==",")
						e.arguments[1]= e.arguments[1].substring(1).trim()
				}
				else if(e.arguments[0].toUpperCase()==="UPGRADE")
					e.arguments[0]=undefined 
			}

		})
		ev.request.continue()
	}



	// Código de ejemplo para configurar el autoresponder...
	static get example(){

		return {

			"match":[
				/http:\/\/google.com\/\S*/i
			],
			"active": true,
			"id": "org.voxsoftware.http2clear", // esto debe ir tal como está
			"require": "korpu:http2clear"

		}

	}

}

export default Http2Clear