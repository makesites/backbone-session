##Backbone Session

A uniform approach to session control for backbone.js apps. 


## Install 

Using Bower: 
```
bower install backbone.session
```


## Usage

To load a new session, simply instantiate APP.Session : 
```
app.session = new APP.Session();
```
If a remote is defined it will immediately be requested with a ```fetch()```. Results will be saved locally and used for subsequent requests to the server. 

Get info from the session like in any other Backbone Model: 
```
app.session.get("user");
...

```

## Options

* __local__: Boolean, defining if the session will be saved locally
* __remote__: Boolean, defining if a remote service will be called
* __persist__: Boolean, using localStorage instead of sessionStorage (where available) 


## Conventions

There are a few things the plugin takes for granted and is good to note: 

* In the examples we're assuming there is an app in the global namespace. 
* Prefered api URL is "/session" (on the same domain) 
* The session is stored preferably in sessionStorage unless the ```persist :  true``` in which case localStorage is used.
* If the remote has no session an attempt will be made for the local info to be passed to the remote service. 


## Credits

Created by Makis Tracend ( [@tracend](http://github.com/tracend) )

Originally released as gist:[1824154](http://gist.github.com/1824154) (still maintained to sustain bower support...) 

Distributed through [Makesites.org](http://makesites.org/)

Released under the [MIT license](http://makesites.org/licenses/MIT)

