import Path from 'path'
var Fs= core.System.IO.Fs
import Cp from 'child_process'

class Certificate{
	

	constructor(config){
		this.$config= config
	}
		
	get config(){
		return this.$config
	}


	executeSpawn(exe, args, options){

		var task= new core.VW.Task(), bufs=[]
		var cp= Cp.spawn(exe, args,options)
		cp.on("error", function(er){

			task.exception=er
			task.finish()

		})

		if(cp.stderr){

			cp.stderr.on("data", function(er){
				bufs.push(er)
			})

		}

		cp.on("exit", function(code){
			//vw.warning(code)
			if(code>0 && bufs.length>0)
				task.exception= Buffer.concat(bufs).toString()
			task.finish()
		})

		return task

	}


	getCacheForHostname(hostname){

		filehostname= hostname.replace("*", "@")
		var path= this.config.certicateCache
		var name1= filehostname+".crt"
		var name2= filehostname+".key"
		var name3= filehostname+".csr"
		var file1= Path.join(path, filehostname+".crt")
		var file2= Path.join(path, filehostname+".key")

		return {

			"cert": Fs.sync.readFile(file1),
			"key": Fs.sync.readFile(file2)

		}


	}


	async getForHostname(hostname){
		// Obtiene un certificado para el host especificado ...

		filehostname= hostname.replace("*", "@")
		var path= this.config.certicateCache
		var name1= filehostname+".crt"
		var name2= filehostname+".key"
		var name3= filehostname+".csr"
		var file1= Path.join(path, filehostname+".crt")
		var file2= Path.join(path, filehostname+".key")

		if(!Fs.sync.exists(file1)){

			Fs.sync.writeFile(file2, Fs.sync.readFile(
				Path.join(__dirname, "..", "certs", "korpu.key")
			))
			
			var args= [
				"req", "-new", "-key", 
				name2, "-out", 
				name3, "-subj",
				"/C=EC/ST=Napo/L=Tena/O=Korpu proxy/CN=" + hostname
			]
			//vw.info("openssl",args.join(" "))
			await this.executeSpawn("openssl", args, {
				"cwd": path
			})


			args=  [

				"x509", "-req", "-in",
				name3, "-CA",
				this.config.CACertificateFile,
				"-CAkey",
				this.config.CAKeyFile,
				"-CAcreateserial",
				"-out",
				name1,
				"-days", "10000",
				"-sha256",
				"-passin",
				"pass:496712"

			]


			await this.executeSpawn("openssl", args, {
				"cwd": path
			})

		}



		return {

			"cert": Fs.sync.readFile(file1),
			"key": Fs.sync.readFile(file2)

		}

	}


}

export default Certificate