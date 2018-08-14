const cloneDeep = require( "lodash.clonedeep" );
const path = require( "path" );

/**
 * Project information
 */
module.exports = class ProjectInfo {

	constructor( generator ) {
		this._generator = generator;
		this._context = {};
		this._readComposer();
		this._readPackage();
	}

	_readComposer() {
		const inputComposerJson    = this._generator.fs.readJSON( this._generator.destinationPath( "composer.json" ) );

		this.composerJson = cloneDeep( inputComposerJson );
		this._context.phpNamespace = getPhpNamespace( this.composerJson );
	}

	_readPackage() {
		const inputPackageJson = this._generator.fs.readJSON( this._generator.destinationPath( "package.json" ) );
		this.packageJson = cloneDeep( inputPackageJson );
	}

	check( feature ) {
		if ( feature["package-dev"] ) {
			if ( !this.packageJson.devDependencies )
				return false;
			for ( const key in feature["package-dev"] ) {
				if ( !this.packageJson.devDependencies[key] )
					return false;
			}
		}
		if ( feature["package"] ) {
			if ( !this.packageJson.dependencies )
				return false;
			for ( const key in feature["package"] ) {
				if ( !this.packageJson.dependencies[key] )
					return false;
			}
		}
		return true;
	}

	install( feature, name ) {
		this._installPackageDependencies( feature, name );
		this._installOutput( feature, name );
		this._installFeatureFile( feature, name );
		this._installFiles( feature, name );
		this._normalize();
	}

	_installPackageDependencies( feature ) {
		this.packageJson.dependencies = Object.assign( {}, feature["package"], this.packageJson.dependencies );
		this.packageJson.devDependencies = Object.assign( {}, feature["package-dev"], this.packageJson.devDependencies );
	}
	_installOutput( feature ) {
		if ( !feature.output )
			return;
		feature.output.call( null, this, { 
			generator: this._generator,
		} );
	}
	_installFeatureFile( feature, name ) {
		if ( !feature.featureFile || !name )
			return;
		this.packageJson["nuxt-helper-features"] = [].concat( this.packageJson["nuxt-helper-features"] ).concat( name );
		this._generator.fs.copy( this._generator.templatePath( feature.featureFile ), this._generator.destinationPath( `www/common/nuxt/features/${name}.js` ) );
	}
	_installFiles( feature, name ) {
		if ( !feature.files )
			return;
		for( const destFile in feature.files ) {
			const srcFile = feature.files[ destFile ];
			this._generator.fs.copyTpl( this._generator.templatePath( srcFile ), this._generator.destinationPath( path.join( destFile ) ), this._context );
		}
	}


	write() {
		this._normalize();
		this._generator.fs.writeJSON( this._generator.destinationPath( "package.json" ), this.packageJson );
		this._generator.fs.writeJSON( this._generator.destinationPath( "composer.json" ), this.composerJson );
	}

	_normalize() {
		const nuxtHelperFeatures = [].concat( this.packageJson['nuxt-helper-features'] ).filter( Boolean );
		this.packageJson['nuxt-helper-features'] = Array.from( new Set( nuxtHelperFeatures ) );
	}

};

function getPhpNamespace( composerJson ) {
	let namespace = Object.keys( composerJson.autoload["psr-4"] )[0];
	return namespace.substr(0, namespace.length - 1 );
}