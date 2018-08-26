const path = require( "path" );
const helperConfig = require( "@renanhangai/nuxt-helper-config" );
module.exports = helperConfig.create({
	rootDir:     path.resolve( __dirname, "../../../" ),
	buildDir:    path.resolve( __dirname, "../../../dist" ),
	featuresDir: path.resolve( __dirname, "features" ),
	defaults: {
	},
});