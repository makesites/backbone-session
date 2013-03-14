// **Session** 
// _Backbone Model to save User Credentials locally using localStorage_
// (Using the localStorage adapter for Backbone by Jerome Gravel-Niquet)
// Example: 
//   this.session = new APP.Session();
//
if(typeof APP == "undefined"){ var APP = { }; }

APP.Session = Backbone.Model.extend({
	url: function(){ return this.options.host + "/session" }, 
	defaults : {
		auth: false,
		updated: false
	}, 
	options: {
		local: true, 
		remote: true,
		persist: false, 
		host: ""
	},
	initialize: function( model, options ){
		// default vars
		options = options || {};
		// parse options
		this.options = _.extend(this.options, options);
		// replace the whole URL if supplied
		if( !_.isUndefined(options.url) ) this.url = options.url;
		
		// pick a persistance solution 
		if( !this.get("persist") && typeof sessionStorage != "undefined" && sessionStorage !== null ){
			// choose localStorage
			this.store = this.sessionStorage;
		} else if( this.get("persist") && typeof localStorage != "undefined" && localStorage !== null ){
			// choose localStorage
			this.store = this.localStorage;
		} else {
			// otherwise we need to store data in a cookie
			this.store = this.cookie;
		}
		
		// try loading the session
		var localSession = this.store.get("session");
		// 
		if( _.isNull(localSession) ){
			// - no valid local session, try the server
			this.fetch();
		} else {
			this.set( JSON.parse( localSession ) );
			// reset the updated flag
			this.set({ updated : false });
			// sync with the server
			this.save();
		}
		
        // event binders
		this.bind("change",this.cache);
		this.bind("error", this.error);
	}, 
	
	parse: function( data ) {
		// if there is no response, keep what we've got locally
		if( _.isNull(data) ) return;
        //console.log("data", data);
		// add updated flag
		if( typeof data.updated == "undefined" ){
			data.updated = ( new Date() ).getTime();
		}
		// set a trigger
		if( !this.get("updated") ) this.trigger("loaded");
		return data;
	}, 
	
	sync: function(method, model, options) {
		// fallbacks
		options = options || {};
		//console.log("method", method);
		// intercept local store actions
		switch(method){
			case "read":
				
			break;
			case "update":
				//this.store.set("session", JSON.stringify( model.toJSON() ) );
			break;
		}
		// exit if explicitly noted as not calling a remote
		if( !this.options["remote"] ) return;
		
		return Backbone.sync.call(this, method, model, options);
	}, 
	// caching is triggered after every model update (fetch/set)
	cache: function(){
		//console.log("CACHE!!!!", this.toJSON());
		// update the local session
		this.store.set("session", JSON.stringify( this.toJSON() ) );
		// check if the object has changed locally
		//console.log("changed", this.changed );
		
	}, 
	// if data request fails request offline mode. 
	error: function( model, req, options, error ){
		// consider redirecting based on statusCode
		console.log( req );
	},
	sessionStorage : {
		get : function( name ) {
			return sessionStorage.getItem( name );
		},
		set : function( name, val ){
			// validation first?
			return sessionStorage.setItem( name, val );
		}, 
		check : function( name ){
			return ( sessionStorage.getItem( name ) == null );
		},
		clear: function( name ){
			// actually just removing the session...
			return sessionStorage.removeItem( name );
		}
	}, 
	localStorage : {
		get : function( name ) {
			return localStorage.getItem( name );
		},
		set : function( name, val ){
			// validation first?
			return localStorage.setItem( name, val );
		}, 
		check : function( name ){
			return ( localStorage.getItem( name ) == null );
		},
		clear: function( name ){
			// actually just removing the session...
			return localStorage.removeItem( name );
		}
	}, 
	cookie : {
		get : function( name ) {
			var i,key,value,cookies=document.cookie.split(";");
			for (i=0;i<cookies.length;i++){
				key=cookies[i].substr(0,cookies[i].indexOf("="));
				value=cookies[i].substr(cookies[i].indexOf("=")+1);
				key=key.replace(/^\s+|\s+$/g,"");
				if (key==name){
					return unescape(value);
				}
			}
		}, 
		
		set : function( name, val ){
			// automatically expire session in a day
			var expiry = 86400000;
			var date = new Date( ( new Date() ).getTime() + parseInt(expiry) );
			var value=escape(val) + ((expiry==null) ? "" : "; expires="+date.toUTCString());
			document.cookie=name + "=" + value;
		}, 
		
		check : function( name ){
			var cookie=this.get( name );
			if (cookie!=null && cookie!=""){
				return true;
			} else {
				return false;
			}
		}
		
	}
});
