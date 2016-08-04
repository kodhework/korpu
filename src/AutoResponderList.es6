
var v= core.org.voxsoftware.Korpu.Http
class AutoResponderList{
	
	constructor(proxy, config){
		this.proxy= proxy
		this.config= config
		this.responders={}
	}

	match(url){
		var i, responder, responders=[],res=this.config.autoresponder, matchs
		if(res){
			for(i=0;i<res.length;i++){
				responder= res[i]
				if(responder.active!==false){
					matchs= responder.match
					if(!(matchs instanceof Array)){
						matchs=[matchs]
					}
					for(var y=0;y<matchs.length;y++){
						if(matchs[y].test(url)){
							responders.push(this.get(i))
							break
						}
					}
				}
			}
		}
		return responders
	}


	matchAndExecute( req){

		try{
			
			var index=-1
			var responders= this.match(req.request.url), responder
			var ev={
				"proxy": this.proxy,
				"request": req
			}


			var procesar= function(){
				index++
				responder= responders[index]
				if(!responder){
					
					return req.continue()
				}

				return responder.execute(ev)
			}
			ev.continue= procesar
			return procesar()
		}
		catch(e){
			vw.error(e)
		}
	}

	get(index){
		var id, responder,res=this.config.autoresponder
		if(res){
			responder= res[index]
			id= responder.id
			if(responder)
				responder= this.responders[responder.id]

			if(!responder)
				this.responders[id]= responder=new v.AutoResponder(this.proxy, this.config, res[index])
		}

		return responder
	}


	getById(id){
		if(this.responders[id])
			return this.responders[id]

		var responder,res=this.config.autoresponder
		if(res){
			for(var i=0;i<res.length;i++){
				responder= res[i]
				if(responder.id==id)
					break
			}

			if(responder)
				this.responders[id]= responder= new v.AutoResponder(this.proxy, this.config, responder)
		}

		return responder

	}

}

export default AutoResponderList