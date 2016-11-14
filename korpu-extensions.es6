var K= core.org.voxsoftware.Korpu
class Extensions{
	

	static getExtension(extension){

		// HTTPSFROMHTTP 
		extension= extension.toUpperCase()
		var Ext


		if(extension=="HTTPSFROMHTTP"){
			Ext= new K.Extensions.HttpsFromHttp()
			return Ext.handle.bind(Ext)
		}

		else if(extension=="HTTPSTOHTTP"){
			Ext= new K.Extensions.HttpsToHttp()
			return Ext.handle.bind(Ext)
		}

		else if(extension=="PROXY"){
			Ext= new K.Extensions.Proxy()
			return Ext.handle.bind(Ext)
		}

		else if(extension=="HTTP2CLEAR"){
			Ext= new K.Extensions.Http2Clear()
			return Ext.handle.bind(Ext)
		}


	}

}
export default Extensions