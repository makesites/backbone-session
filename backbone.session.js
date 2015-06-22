/*
 * Backbone Session
 * Source: https://github.com/makesites/backbone-session
 * Copyright © Makesites.org
 *
 * Initiated by Makis Tracend (@tracend)
 * Distributed through [Makesites.org](http://makesites.org)
 * Released under the [MIT license](http://makesites.org/licenses/MIT)
 */

(function (lib) {

	//"use strict";

	// Support module loaders
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('backbone.session', ['underscore', 'backbone'], lib);
	} else if ( typeof module === "object" && module && typeof module.exports === "object" ){
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = lib;
	} else {
		// Browser globals
		lib(window._, window.Backbone);
	}

}(function (_, Backbone) {

	var APP = window.APP;
	// support for Backbone APP() view if available...
	var isAPP = ( typeof APP !== "undefined" && typeof APP.View !== "undefined" );

var Session = Backbone.Model.extend({
	url: function(){ return this.options.host + "/session" },
	defaults : {
		auth: 0,
		updated: 0
	},
	state: false,
	options: {
		broadcast: true,
		local: true,
		remote: true,
		persist: false,
		host: ""
	},
	initialize: function( model, options ){
		_.bindAll(this, "logout", "cache", "update");
		// default vars
		options = options || {};
		// parse options
		this.options = _.extend(this.options, options);
		// replace the whole URL if supplied
		if( !_.isUndefined(options.url) ) this.url = options.url;

		// pick a persistance solution
		if( !this.options.persist && typeof sessionStorage != "undefined" && sessionStorage !== null ){
			// choose localStorage
			this.store = this.sessionStorage;
		} else if( this.options.persist && typeof localStorage != "undefined" && localStorage !== null ){
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
			this.set({ updated : 0 });
			// fetch if not authenticated (every time)
			if( !this.get('auth') && this.options.remote ) this.fetch();
			// sync with the server ( if broadcasting local info )
			if( this.options.broadcast ) this.save();
		}

		// event binders
		this.bind("change",this.update);
		this.bind("error", this.error);
		this.on("logout", this.logout);
	},

	parse: function( data ) {
		// if there is no response, keep what we've got locally
		if( _.isNull(data) ) return;
		// add updated flag
		if( typeof data.updated == "undefined" ){
			data.updated = ( new Date() ).getTime();
		}
		// add an id if one is not supplied
		if( !data.id) data.id = this.generateUid();
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
		if( !this.options["remote"] || (!this.options["broadcast"] && method != "read") ) return this.update();

		return Backbone.sync.call(this, method, model, options);
	},
	update: function(){
		// set a trigger
		if( !this.state ) {
			this.state = true;
			this.trigger("loaded");
		};
		// caching is triggered after every model update (fetch/set)
		if( this.get("updated") || !this.options["remote"] ){
			this.cache();
		}
	},
	cache: function(){
		// update the local session
		this.store.set("session", JSON.stringify( this.toJSON() ) );
		// check if the object has changed locally
		//...
	},
	// Destroy session - Source: http://backbonetutorials.com/cross-domain-sessions/
	logout: function( options ) {
		// Do a DELETE to /session and clear the clientside data
		var self = this;
		options = options || {};
		// delete local version
		this.store.clear("session");
		// notify remote
		this.destroy({
			wait: true,
			success: function (model, resp) {
				model.clear();
				model.id = null;
				// Set auth to false to trigger a change:auth event
				// The server also returns a new csrf token so that
				// the user can relogin without refreshing the page
				self.set({auth: false});
				if( resp && resp._csrf) self.set({_csrf: resp._csrf});
				// reload the page if needed
				if( options.reload ){
					window.location.reload();
				}
			}
		});
	},
	// if data request fails request offline mode.
	error: function( model, req, options, error ){
		// consider redirecting based on statusCode
		console.log( req );
	},

	// Stores
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
		},

		clear: function( name ) {
			document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
	},

	// Helpers
	// - Creates a unique id for identification purposes
	generateUid : function (separator) {

		var delim = separator || "-";

		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}

		return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
	}
});


	// fallbacks
	// reference in the Backbone namespace
	if( _.isUndefined( Backbone.Session) ){
		Backbone.Session = Session;
	}

	// If there is a window object, that at least has a document property
	if ( typeof window === "object" && typeof window.document === "object" ) {
		// update APP namespace
		if( isAPP ){
			APP.Session = Session;
			// save namespace
			window.APP = APP;
		}
		// save Backbone namespace either way
		window.Backbone = Backbone;
	}

	// for module loaders:
	return Session;


}));
