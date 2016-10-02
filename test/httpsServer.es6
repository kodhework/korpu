

var tls= require("tls")
var https = require('https');
var http = require('http');
var fs = require('fs');



var getChannelRequest=(req)=>{

	
		var request= new core.VW.Http.Request(req.request.url)
		for(var id in req.request.headers){
			request.headers[id]= req.request.headers[id]
		}
		// Mandar el boy ...
		req.channel= request
		request.followRedirect= false
		request.validateStatusCode= false
		return request
	}


var options = {
  key: fs.readFileSync(__dirname + '/device.key'),
  cert: fs.readFileSync(__dirname + '/device.crt')
};

var a = http.createServer( async function (req, res) {

	var c= {
		key: fs.readFileSync(__dirname + '/device2.key'),
 	 	cert: fs.readFileSync(__dirname + '/device2.crt')
	}
	var b= tls.createSecureContext(c)
	//a._sharedCreds= b
	//a.addContext("github.com",c)


	vw.info("HERE")
  	//res.writeHead(200);
  	//res.end("hello world\n");

  	var args={
  		request:req,
  		response:res
  	}

  	var request= getChannelRequest(args)
		request.beginGetResponse()
		args.request.pipe(request.innerRequest) 
		request.innerRequest.pipe(args.response)
		//this.finalize(args)
		await request.endGetResponse()



}).listen(8000);


a.on("upgrade", function(){
	vw.info("UPGRADE ....", arguments)
})

a.on("connect", function(){
	vw.info("connect ....", arguments)
})

/*
var a = http.createServer(function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);


+/*/