import {Module} from 'module'
var v= core.org.voxsoftware.Korpu.Http
class AutoResponder{
	constructor(Proxy, config, json){
		this.proxy= Proxy
		this.config=config
		this.json=json

	}

	get id(){
		return this.json.id
	}

	get match(){
		return this.json.match
	}

	env(param){
		return this.json[param]
	}


	get code(){
		return this.json.code
	}

	get require(){
		return this.json.require
	}

	compile(){
		if(!this.module){

			if(this.code){
				var parser= new core.VW.Ecma2015.Parser()
				var ast= parser.parse(this.code)
				this.module= new Module(this.id, __filename)
				this.module._compile(ast.code, this.id)
				this.module= this.module.exports
			}
			else if(this.require){
				this.module= require(this.require)
			}

		}
	}

	// Ejecutar el autoresponder ...
	// es await 
	execute(e){
		this.compile()

		var mod=this.module
		if(mod.default)
			mod= mod.default

		return mod(e)
	}

}

export default AutoResponder