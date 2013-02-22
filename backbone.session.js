// **Session** 
// _Backbone Model to save User Credentials locally using localStorage_
// (Using the localStorage adapter for Backbone by Jerome Gravel-Niquet)
// Example: 
//   this.session = new APP.Session();
//
if(typeof APP == "undefined"){ var APP = { }; }
 
APP.Session = Backbone.Model.extend({
	url: "/session", 
	defaults : {
		auth: false,
		updated: false
	}, 
	options: {
		local: true, 
		remote: true,
		persist: false 
	},
	initialize: function( model, options ){
		console.log("options", this.options);
		// fallbacks
		if( typeof options == "undefined" ) options = {};
		// pick a persistance solution 
		if( !this.get("persist") && typeof sessionStorage != "undefined" && sessionStorage !== null ){
			// choose localStorage
			this.store = this.sessionStorage;
		} else if( typeof localStorage != "undefined" && localStorage !== null ){
			// choose localStorage
			this.store = this.localStorage;
		} else {
			// otherwise we need to store data in a cookie
			this.store = this.cookie;
		}
		// load local
		try {
			this.set( JSON.parse( this.store.get("session") ) );
		} catch ( exc ){
			// exception
		}
		// parse options
		if( !_.isUndefined(options.url) ) this.url = options.url;
		
		// calling remote domain for session
		if( this.options["remote"] ) this.fetch();
		
		//this.bind("change",this.cache);
		this.bind("error", this.error);
	}, 
	/*
	sync: function(method, model, options) {
		if(typeof options == "undefined") options = {};
		// intercept local store actions
		switch(method){
			case "read":
				model.parse( JSON.parse( this.store.get("session") ) );
			break;
			case "save":
				this.store.set("session", model.toJSON() );
			break;
		}
		// end now if there's no remote
		if( !this.get("remote") ){
			// work locally
			return;
		}
		
		options.success = function( model, resp, options ){
			console.log("SUCCESSS!", method );
		};
		
		return Backbone.sync.call(this, method, model, options);
	}, 
	*/
	parse: function( data ) {
		
		// add updated flag
		if( typeof data.updated == "undefined" ){
			data.updated = ( new Date() ).getTime();
		}
		// cache locally
		this.store.set("session", JSON.stringify( data ) );
		
		return data;
		
	}, 
	cache: function(){
		/*
		// either save or update
		if( _.isNull( this.localStorage.find( this ) ) ){ 
			this.localStorage.create( this );
		} else { 
			this.localStorage.update( this );
		}
		// save state back to the server
		if( this.get("local") ){
			this.save( this.toJSON() );
		}
		*/
	}, 
	// if data request fails request offline mode. 
	error: function( model, req, options, error ){
		console.log( error );
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
