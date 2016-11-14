var v= core.org.voxsoftware.Korpu.Http
import Path from 'path'
var Fs= core.System.IO.Fs
class Configuration{
	
	constructor(file){
		this.$= require(file)
		this.$file= file
		if(this.$.default)
			this.$= this.$.default
	}


	get file(){
		return this.$file
	}

	get console(){
		// Obtiene una consola
		var console= this.$.console, o
		if(!console){
			console= new v.NullConsole()
		}
		else if(console=="default"){
			console= new v.Console()
		}
		else{
			o= core
			console= console.split(".")
			for(var i=0;i<console.length;i++){
				o=o[console[i]]
			}
			console=o
		}
		return console

	}

	get informer(){
		// Obtiene una consola
		var informer= this.$.informer, o
		if(!informer){
			informer= new v.Informer(this)
		}
		else if(informer=="default"){
			informer= new v.Informer(this)
		}
		else{
			o= core
			informer= informer.split(".")
			for(var i=0;i<informer.length;i++){
				o=o[informer[i]]
			}
			informer=o
		}
		return informer

	}


	get port(){
		return this.$.port
	}

	env(param){
		return this.$[param]
	}

	get autoresponder(){
		return this.$.autoresponder
	}

	get useHttps(){
		return this.$.usehttps
	}


	get httpsHandle(){
		return this.$.httpsHandle
	}


	// Obtener el certificado de la entidad de certificación
	get CACertificate(){
		var e= this.$.CACertificate || Configuration.defaultCACertificate
		if(!e){
			e= this.CACertificateFile
			if(e)
				e= Fs.sync.readFile(e)
		}

		return e
	}


	get directory(){
		return Path.dirname(this.$file)
	}


	get CACertificateFile(){
		return this.$.CACertificateFile || Configuration.defaultCACertificateFile
	}


	get CAKeyFile(){
		return this.$.CAKeyFile || Configuration.defaultCAKeyFile
	}

	get siteCertificate(){
		return this.$.siteCertificate || Configuration.defaultSiteCertificate
	}

	get siteKey(){
		return this.$.siteKey || Configuration.defaultSiteKey
	}


	get certicateCache(){
		var dir= this.$.cacheCert || Path.join(this.directory, "cache-cert")
		if(!Fs.sync.exists(dir))
			Fs.sync.mkdir(dir)

		return dir
	}


	static get defaultCACertificate(){
		var srcfile= Path.join(__dirname, "..", "certs", "VoxSoftware.crt")
		return Fs.sync.readFile(srcfile)
	}

	static get defaultCACertificateFile(){
		var srcfile= Path.join(__dirname, "..", "certs", "VoxSoftware.crt")
		return srcfile
	}

	static get defaultCAKeyFile(){
		var srcfile= Path.join(__dirname, "..", "certs", "VoxSoftware.key")
		return srcfile
	}

	static get defaultSiteCertificate(){
		var srcfile= Path.join(__dirname, "..", "certs", "korpu.crt")
		return Fs.sync.readFile(srcfile)
	}

	static get defaultSiteKey(){
		var srcfile= Path.join(__dirname, "..", "certs", "korpu.key")
		return Fs.sync.readFile(srcfile)
	}

}

export default Configuration