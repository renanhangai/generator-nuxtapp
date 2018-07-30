const path = require( "path" );
const BUILD_DIR = path.resolve( __dirname, "../../../dist" );

module.exports = function( dir ) {
	const baseDir = path.basename( dir );
	return {
		srcDir: dir,
		buildDir: path.join( BUILD_DIR, "tmp/.nuxt", baseDir ),
	};
};