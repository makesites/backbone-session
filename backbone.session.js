// **Session** 
// _Backbone Model to save User Credentials locally using localStorage_
// (Using the localStorage adapter for Backbone by Jerome Gravel-Niquet)
// Example: 
//   this.session = new APP.Session();
//
if(typeof APP == "undefined"){ var APP = { }; }
 
APP.Session = Backbone.Model.extend({
	url: "/session", 
	//localStorage: new Store("session"),
	defaults: {
		id: 1, // this will make the access account unique on subsequent visits
		local: false
	},
	initialize: function( model, options ){
		// pick a persistance solution 
		if(typeof localStorage != "undefined" && localStorage !== null){
			// choose localStorage
			this.store = this.localStorage;
		} else {
			// otherwise we need to store data in a cookie
			this.store = this.cookie;
		}

		// setting up custom domain for session
		//if( !_.isUndefined(options.url) ) this.url = options.url;
		this.fetch();
		
		//this.bind("change",this.cache);
		this.bind("error", this.error);
	}, 
	parse: function( data ) {
		
		// create the components collection
		if ( _.isEmpty( data ) ){
			/*
			//get the latest version from localStorage
			if( _.isNull( this.localStorage.find( this ) ) ){ 
				// redirect the user to register
			} else { 
				data = this.localStorage.find( this );
				this.set({local: true});
			}
			*/
		}
		
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
		console.log( req );
	},
	localStorage : {
		get : function(name) {
		},
		set : function( name, val ){
		}, 
		check : function( name ){
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
