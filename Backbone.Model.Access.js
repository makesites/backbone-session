// **Access** 
// _Backbone Model to save User Credentials locally using localStorage_
// (Using the localStorage adapter for Backbone by Jerome Gravel-Niquet)
// Example: 
//   this.access = new Access();
// 
Access = Backbone.Model.extend({
	url: "/access", 
	localStorage: new Store("access"),
	defaults: {
		id: 1, // this will make the access account unique on subsequent visits
		local: false,
	},
	initialize: function( data ){
		this.fetch();
		
		this.bind("change",this.cache);
		this.bind("error", this.error);
	}, 
	parse: function( data ) {
		
		// create the components collection
		if ( _.isEmpty( data ) ){
			//get the latest version from localStorage
			if( _.isNull( this.localStorage.find( this ) ) ){ 
				// redirect the user to register
			} else { 
				data = this.localStorage.find( this );
				this.set({local: true});
			}
		
		}
		
		return data;
		
	}, 
	cache: function(){
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
	}, 
	// if data request fails request offline mode. 
	error: function( model, req, options, error ){
		console.log( req );
	},  
});
