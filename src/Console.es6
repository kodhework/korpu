
class Console{
	
	write(type, args, special){
		var t,noline
		if(type=="info"){
			t= "INFO"
			core.VW.Console.backgroundColor= core.System.ConsoleColor.Blue
			core.VW.Console.foregroundColor= core.System.ConsoleColor.White
		}
		else if(type=="warning"){
			t= "WARNING"
			core.VW.Console.backgroundColor= core.System.ConsoleColor.Yellow
			core.VW.Console.foregroundColor= core.System.ConsoleColor.Black
		}
		else if(type=="log"){
			t= "LOG"
			core.VW.Console.backgroundColor= core.System.ConsoleColor.Green
			core.VW.Console.foregroundColor= core.System.ConsoleColor.White
		}
		else if(type=="error"){
			t= "ERROR"
			core.VW.Console.backgroundColor= core.System.ConsoleColor.Red
			core.VW.Console.foregroundColor= core.System.ConsoleColor.White
		}
		if(special){
			t=special
			// noline= true
		}
		

		core.VW.Console.write("",t,"").resetColors().write(" ")


		for(var i=0;i<args.length;i++){
			msg=args[i]
			if(msg instanceof Error){
				core.VW.Console.write(msg.message, msg.stack).writeLine()
				for(var id in msg){
					core.VW.Console.writeLine(" - " + id, msg[id])
				}
				
			}

			else if(Buffer.isBuffer(msg)){
				core.VW.Console.backgroundColor= core.System.ConsoleColor.Magenta
				core.VW.Console.foregroundColor= core.System.ConsoleColor.Black
				core.VW.Console.write("Buffer","").resetColors()
				core.VW.Console.write(msg.toString("ascii"))
			}

			else{
				core.VW.Console.write(msg)
			}
		}
		if(!noline)
			core.VW.Console.writeLine()

	}

	request(method, ... args){
		return this.write("log", args, method)
	}

	error(){
		return this.write("error", arguments)
	}

	warning(){
		return this.write("warning", arguments)
	}
	info(){
		return this.write("info", arguments)
	}
	log(){
		return this.write("log", arguments)
	}

}
export default Console