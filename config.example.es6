export default {
	"port": 1200,
	"timeout": 560000,
	"console": "default",
	"extensions": [
	],
	"autoresponder": [
		{
			"match": /http:\/\/dl.oneplay.tv\/WTS_MEDIA:\S*\.ts/g,
			"code": `
				import Path from 'path'
				import fs from 'fs'
				var exec= async function(ev){
					var e= ev.request
					var Proxy= ev.proxy
					var responder= Proxy.autoResponders.getById("org.voxsoftware.proxy.oneplaygrabber")
					var file, path, saveDir= responder.env("savedir")		
					var request= Proxy.getChannelRequest(e)
					var url= e.request.url
					var parts= url.split("/")
					for(var i=0;i<parts.length;i++){
						if(parts[i] && parts[i].toUpperCase().startsWith("PROFILE")){
							path= parts[i]
							break
						}
					}

					if(!fs.existsSync(saveDir))
						fs.mkdirSync(saveDir)

					if(path)
						path= Path.join(saveDir, path)
					else
						path= saveDir

					if(!fs.existsSync(path))
						fs.mkdirSync(path)


					// Ahora se guarda en un archivo y también se devuelve al response ...
					path= Path.join(path, parts[parts.length-1])
					file=fs.createWriteStream(path)

					request.beginGetResponse()
					e.request.pipe(request.innerRequest) 
					request.innerRequest.pipe(e.response)
					request.innerRequest.pipe(file)

					await request.endGetResponse()

				}
				export default exec
			`, 
			"id": "org.voxsoftware.proxy.oneplaygrabber",
			"savedir": "/Users/james/grabaciones" // Aquí debería ir la carpeta donde se debe grabar

		}

	]
}