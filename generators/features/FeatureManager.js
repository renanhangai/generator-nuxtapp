const cloneDeep = require( "lodash.clonedeep" );
const path = require( "path" );

/**
 * Project information
 */
module.exports = class ProjectInfo {

	constructor( generator ) {
		this._generator = generator;
		this.reload();
	}

	_readComposer() {
		try {
			const inputComposerJson    = this._generator.fs.readJSON( this._generator.destinationPath( "composer.json" ) );

			this.composerJson = cloneDeep( inputComposerJson );
			this._context.phpNamespace = getPhpNamespace( this.composerJson );
		} catch(e) {
			this.composerJson = {};
		}
	}

	_readPackage() {
		try {
			const inputPackageJson = this._generator.fs.readJSON( this._generator.destinationPath( "package.json" ) );
			this.packageJson = cloneDeep( inputPackageJson );
		} catch( e ) {
			this.packageJson = {};
		}
	}

	check( feature ) {
		if ( feature["package-dev"] ) {
			if ( !this.packageJson || !this.packageJson.devDependencies )
				return false;
			for ( const key in feature["package-dev"] ) {
				if ( !this.packageJson.devDependencies[key] )
					return false;
			}
		}
		if ( feature["package"] ) {
			if ( !this.packageJson || !this.packageJson.dependencies )
				return false;
			for ( const key in feature["package"] ) {
				if ( !this.packageJson.dependencies[key] )
					return false;
			}
		}
		if ( feature["composer"] ) {
			if ( !this.composerJson || !this.composerJson["require"] )
				return false;
			for ( const key in feature["composer"] ) {
				if ( !this.composerJson["require"][key] )
					return false;
			}
		}
		if ( feature["composer-dev"] ) {
			if ( !this.composerJson || !this.composerJson["require-dev"] )
				return false;
			for ( const key in feature["composer-dev"] ) {
				if ( !this.composerJson["require-dev"][key] )
					return false;
			}
		}
		if ( feature.test )
			return feature.test.call( null, this, { generator: this._generator } );
		return true;
	}

	reload() {
		this._context = {};
		this._readPackage();
		this._readComposer();
	}

	install( feature, context ) {
		this._installPackageDependencies( feature, context );
		this._installComposerDependencies( feature, context );
		this._installOutput( feature, context );
		this._installFeatureFile( feature, context );
		this._installFiles( feature, context );
		this._normalize();
	}

	_installPackageDependencies( feature ) {
		this.packageJson.dependencies = Object.assign( {}, this.packageJson.dependencies, feature["package"] );
		this.packageJson.devDependencies = Object.assign( {}, this.packageJson.devDependencies, feature["package-dev"] );
	}
	_installComposerDependencies( feature ) {
		this.composerJson["require"] = Object.assign( {}, this.composerJson["require"], feature["composer"] );
		this.composerJson["require-dev"] = Object.assign( {}, this.composerJson["require-dev"], feature["composer-dev"] );
	}
	_installOutput( feature, context ) {
		if ( !feature.output )
			return;
		feature.output.call( null, this, { 
			generator: this._generator,
			answers: context.answers,
			name: context.name,
		} );
	}
	_installFeatureFile( feature, { name } ) {
		if ( !feature.featureFile || !name )
			return;
		this.packageJson["nuxt-helper-features"] = [].concat( this.packageJson["nuxt-helper-features"] ).concat( name );
		this._generator.fs.copy( this._generator.templatePath( feature.featureFile ), this._generator.destinationPath( `www/common/nuxt/features/${name}.js` ) );
	}
	_installFiles( feature, { name } ) {
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
		this._generator.fs.write( this._generator.destinationPath( "composer.json" ), JSON.stringify( this.composerJson, null, 4 )+"\n" );
	}

	_normalize() {
		const nuxtHelperFeatures = [].concat( this.packageJson['nuxt-helper-features'] ).filter( Boolean );
		this.packageJson['nuxt-helper-features'] = Array.from( new Set( nuxtHelperFeatures ) );
		sortKeys( this.packageJson, "dependencies" );
		sortKeys( this.packageJson, "devDependencies" );
	}

};

function sortKeys( obj, key ) {
	const oldValue = obj[key];
	const newValue = {};
	const keys = Object.keys( oldValue );
	keys.sort( ( a, b ) => a.localeCompare( b ) );
	keys.forEach( ( k ) => { newValue[k] = oldValue[k]; } );
	obj[key] = newValue;
}

function getPhpNamespace( composerJson ) {
	let namespace = Object.keys( composerJson.autoload["psr-4"] )[0];
	return namespace.substr(0, namespace.length - 1 );
}