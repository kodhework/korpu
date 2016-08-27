import oUrl from 'url'
class Informer{
	
	//sumo de uva y jarabe da vainilla al chocolate caliente
	constructor(config){
		this.config= config
		this.$reqs= []
		this.$reqsb= []
		this.$res=[]
		this.$res1={}
		this.$clients={}
		this.$pendiente= []
		this.$pendiente2= []
		this.$pendienteR= []
		this.limit= 2000
		this.localname= ["127.0.0.1", "localhost"]
	}


	_pending(){
		var pend,pends= this.$pendiente
		this.$pendiente=[]
		while(pend= pends.shift()){
			this.getRequestes(pend)
		}

		pends= this.$pendienteR
		this.$pendienteR=[]
		while(pend= pends.shift()){
			this.getResponses(pend)
		}

		pends= this.$pendiente2
		this.$pendiente2=[]
		while(pend= pends.shift()){
			this.getRequestesBody(pend)
		}
	}





	getRequestes(args){

		var id= args.id, task
		if(!id)
			throw new core.System.ArgumentException("Debe especificar un id de cliente")
		
		task= args.task || new core.VW.Task()

		var as, client= this.$clients[id]= this.$clients[id]||{}
		if(client.lastId===undefined)
			client.lastId=-1


		var regs=[], reg
		for(var i=this.$reqs.length-1;i>=0;i--){
			reg= this.$reqs[i]

			if(!as){
				as= reg.id
			}
			if(reg.id==client.lastId)
				break

			regs.push(reg)

		}

		client.lastId= as || client.lastId
		if(regs.length>0){
			regs.reverse()
			task.result= regs
			task.finish()
		}
		else{
			args.task= task
			this.$pendiente.push(args)
		}

		return task
	}


	getRequestesBody(args){

		var id= args.id, task
		if(!id)
			throw new core.System.ArgumentException("Debe especificar un id de cliente")
		
		task= args.task || new core.VW.Task()

		var as, client= this.$clients[id]= this.$clients[id]||{}
		if(client.lastId3===undefined)
			client.lastId3=-1


		var regs=[], reg
		for(var i=this.$reqsb.length-1;i>=0;i--){
			reg= this.$reqsb[i]

			if(!as){
				as= reg.id
			}
			if(reg.id==client.lastId3)
				break

			regs.push(reg)

		}

		client.lastId3= as || client.lastId3
		if(regs.length>0){
			regs.reverse()
			task.result= regs
			task.finish()
		}
		else{
			args.task= task
			this.$pendiente2.push(args)
		}

		return task
	}

	getResponses(args){

		var id= args.id, task
		if(!id)
			throw new core.System.ArgumentException("Debe especificar un id de cliente")
		
		task= args.task || new core.VW.Task()

		var as, client= this.$clients[id]= this.$clients[id]||{}
		if(client.lastId2===undefined)
			client.lastId2=-1


		var regs=[], reg
		for(var i=this.$res.length-1;i>=0;i--){
			reg= this.$res[i]

			if(!as){
				as= reg.id
			}
			if(reg.id==client.lastId2)
				break

			regs.push(reg)

		}

		client.lastId2= as || client.lastId2
		if(regs.length>0){
			regs.reverse()
			task.result= regs
			task.finish()
		}
		else{
			args.task= task
			this.$pendienteR.push(args)
		}

		return task
	}


	finalizeRequest(args){
		var reg={
			"id": args.id, 
			"buffer": []
		}

		var self= this
		args.request.on("data", function(b){
			if(reg.end)
				return 
			reg.buffer.push(b)
		})

		args.request.on("end", function(){
			
			if(reg.end)
				return 

			if(reg.buffer.length==0){
				reg.buffer= undefined
				return
			}
			reg.end= true
			reg.body= Buffer.concat(reg.buffer)
			reg.buffer= undefined 
			self.$reqsb.push(reg)

			while(self.$reqsb.length>=self.limit){
				self.$reqsb.shift()
			}
		})

	}



	request(args){
		if(!this.validate(args))
			return 



		var reg= {
			id: args.id,
			protocol: "http",
			host: args.request.header.host,
			url: args.request.url,
			start: new Date(),
			headers: args.request.headers
		}

		this.$reqs.push(reg)
		while(this.$reqs.length>=this.limit){
			this.$reqs.shift()
		}

		this.finalizeRequest(args)
		this._pending()
	}

	validate(args){
		var url= oUrl.parse(args.request.url)
		if(this.localname.indexOf(url.hostname)>-1 && url.port== this.config.port){
			return false
		}

		if(args.request.url.startsWith("/")){
			return false
		}

		return true
	}

	finalize(args){

		if(!this.validate(args))
			return 

		var self= this, e, pipe
		this.response(args)
		var len=0,reg= this.$res1[args.id]
		reg.buffer= []

		args.response.emitWrite= true
		args.response.on("headerssent", function(){
			reg.headers= args.response.getHeaders()
		})		
		args.response.on("data", function(b){

			if(reg.end)
				return 
			
			// Si la respuesta es máximo 1MB
			if(len<=1*1024*2014){
				len+= b.length
				reg.buffer.push(b)
			}
			else{
				args.response.emitWrite= false
			}
		})
		args.response.on("finish", function(){
			
			if(reg.end)
				return 


			reg.data= Buffer.concat(reg.buffer)
			reg.buffer= undefined			
			reg.end= new Date()
			self.$res.push(reg)
			//vw.warning(reg)

			while(self.$res.length>=self.limit){
				e=self.$res.shift()
				delete self.$res1[e.id]
			}

			reg.end= true
		})
	}

	response(args){
		var reg= {
			id: args.id,
			url: args.request.url
		}

		this.$res1[args.id]= reg
	}

}
export default Informer