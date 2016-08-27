
class JsonResponse{
	constructor(args){
		this.args=args
	}

	parse(key, value){
		var v= this[key]
		if(Buffer.isBuffer(v)){
			return {
				"type": "base64",
				"value": v.toString("base64")
			}
		}
		return value
	}

	write(arg){
		var data= arg, er
		if(arg instanceof Error){
			data={
				message: arg.message,
				stack: arg.stack
			}

			for(var id in arg){
				data[id]= arg
			}
			er= true
		}

		

		data= core.safeJSON.stringify(data, this.parse, '\t')
		if(er)
			this.args.response.statusCode= 500
		else
			this.args.response.statusCode= 200

		this.args.response.setHeader("Content-type", "application/json; Charset=utf-8")
		this.args.response.write(data)
		this.args.response.end()
	}
}
export default JsonResponse