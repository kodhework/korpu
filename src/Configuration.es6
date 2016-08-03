var v= core.org.voxsoftware.Korpu.Http
class Configuration{
	
	constructor(file){
		this.$= require(file)
		if(this.$.default)
			this.$= this.$.default
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



}

export default Configuration