
import Path from 'path'
var Cli,v
v= core.org.voxsoftware.Korpu.Http

class CommandLine{
	

	static prompt(){
		
		core.VW.Console.foregroundColor= core.System.ConsoleColor.Green
		core.VW.Console.write("Korpu proxy ")
		core.VW.Console.resetColors()
		core.VW.Console.write("versión ")
		core.VW.Console.foregroundColor= core.System.ConsoleColor.Yellow
		core.VW.Console.writeLine(v.version,"")
		core.VW.Console.resetColors()
	}
	

	static error(e){
		
		core.VW.Console.backgroundColor= core.System.ConsoleColor.Red
		core.VW.Console.foregroundColor= core.System.ConsoleColor.White
		core.VW.Console.write(" ERROR ")
		core.VW.Console.resetColors()
		core.VW.Console.foregroundColor= core.System.ConsoleColor.Yellow
		core.VW.Console.write("", e.stack||e.toString())
	}
	static cli(){

		var Command=new  core.VW.CommandLine.Parser()
		Command.addParameter("start", true, null)
		Command.addParameter("help")
		try{
			Command.parse()
			var options= Command.getAsOptionsObject()
		}
		catch(e){
			Cli.prompt()
			core.VW.Console.writeLine()
			return Cli.error(e)			
		}
		var v= Cli.execute(options)
		core.VW.Console.writeLine()
		return v

	}


	static execute(options){
		
		if(options.help){
			Cli.help()
		}		
		else{
			Cli.start(options)
		}
	}

	static get options(){
		return {
			"--config": "Establecer archivo de configuración"
		}
	}

	static get commands(){
		return {
			"-help": "Mostrar ayuda", 
			"-start": "Iniciar proxy. No es necesario colocar este comando"
		}
	}


	static async start(options){
		Cli.prompt()
		try{
			var config, proxy, server
			if(!options.config){
				config= v.Server.defaultConfig
			}
			else{
				options.config= Path.normalize(options.config)
				config= new v.Config(options.config)
			}
			
			server= new v.Server(config)
			proxy= new v.Proxy(server)
			await server.init()

		}
		catch(e){
			Cli.error(e)
		}
	}
	


	static help(){
		var help=Cli.options
		var cmds=Cli.commands

		Cli.prompt()
		core.VW.Console.writeLine()
		core.VW.Console.writeLine()

		vw.warning("Modo de uso:")
		core.VW.Console.writeLine("  comando [opcion [argumento], opcion [argumento] ...] [argumentos]")
		

		core.VW.Console.writeLine()
		vw.warning("Comandos:")
		var maxl=0
		for(var id in help){
			maxl= Math.max(maxl, id.length)
		}
		for(var id in cmds){
			maxl= Math.max(maxl, id.length)
		}
		maxl+= 5

		for(var id in cmds){
			core.VW.Console.setColorLog().write(("  " + id).padRight(maxl,' ')).resetColors()
			core.VW.Console.writeLine(cmds[id])
		}


		core.VW.Console.writeLine()
		vw.warning("Opciones:")
		for(var id in help){
			core.VW.Console.setColorLog().write(("  " + id).padRight(maxl,' ')).resetColors()
			core.VW.Console.writeLine(help[id])
		}

	}


}
Cli= CommandLine
export default CommandLine