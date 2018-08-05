const path = require( "path" );
const fs = require( "fs" );
const BUILD_DIR = process.env.APP_BUILD_DIR ? path.resolve( process.env.APP_BUILD_DIR ) : path.resolve( __dirname, "../../../dist" );
const ROOT_DIR  = path.resolve( __dirname, "../../../" );

class NuxtConfigHelper {

	constructor( dir, options ) {
		this._dir     = dir;
		this._options = options || {};

		this._baseDir = path.basename( dir );
	}

	generate() {
		this.config = {
			rootDir: ROOT_DIR,
			srcDir: this._dir,
			buildDir: path.join( BUILD_DIR, "tmp/.nuxt", this._baseDir ),
			generate: {
				dir: path.join( BUILD_DIR, "www", this._baseDir ),
			},
			modules: [],
			plugins: [],
		};
		const packageJson = require( path.resolve( ROOT_DIR, 'package.json' ) );
		const helperFeatures = packageJson["nuxt-helper-features"] || [];
		helperFeatures.forEach( ( f ) => {
			const feature = require( path.resolve( __dirname, "./features", f+".js" ) );
			const featureOptions = this._options.features ? this._options.features[f] : void(0);
			feature.call( null, this.config, featureOptions );
		});

		this.config.plugins = [].concat( this.config.plugins ).concat( this._options.plugins ).filter( Boolean );
		this.config.modules = [].concat( this.config.modules ).concat( this._options.modules ).filter( Boolean );
		this.config.router = this.config.router || {};
		this.config.router.middleware = [].concat( this.config.router.middleware ).concat( this._options.middleware ).filter( Boolean );
		
		return this.config;
	}
};

module.exports = function( dir, options ) {
	const baseDir = path.basename( dir );

	const helper = new NuxtConfigHelper( dir, options );
	return helper.generate();
};
