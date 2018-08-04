const Generator = require('yeoman-generator');
const cloneDeep = require( "lodash.clonedeep" );

const FEATURES = [
	[ "config", {
		test({ inputPackage, inputComposer }) {
			return !!inputPackage.scripts.config;	
		},
		output( { generator, outputPackage } ) {
			generator.fs.writeJSON( generator.destinationPath( "config.default.json" ), {} );
			outputPackage.scripts = Object.assign({
				"config": "cross-env config-builder config.default.json \"$APP_CONFIG\" +config.json --output-dir \"dist:$APP_BUILD_DIR\" -o config.json -o config.php",
			}, outputPackage.scripts);
		},
		"package-dev": {
			"@renanhangai/config-builder": "^0.1.1",
		},
	} ],
	[ "pug", {
		"package-dev": {
			"pug": "^2.0.3",
			"pug-plain-loader": "^1.0.0",
		},
	} ],
	[ "sass", {
		"package-dev": {
			"node-sass": "^4.9.2",
			"sass-loader": "^7.0.3"
		},
	} ],
];

/**
 * Helper class for testing features and enabling then
 */
class FeatureHelper {

	static checkFeature( name, inputContext ) {
		const { inputPackage, inputComposer } = inputContext;
		const feature = FEATURES.find( ( feature ) => feature[0] === name );
		if ( !feature )
			throw new Error( `Invalid feature ${name}` );

		const featureDescription = feature[1];
		if ( !featureDescription )
			return;
		
		if ( featureDescription["package-dev"] ) {
			if ( !inputPackage.devDependencies )
				return false;
			for ( const key in featureDescription["package-dev"] ) {
				if ( !inputPackage.devDependencies[key] )
					return false;
			}
		}
		if ( featureDescription["package"] ) {
			if ( !inputPackage.dependencies )
				return false;
			for ( const key in featureDescription["package"] ) {
				if ( !inputPackage.dependencies[key] )
					return false;
			}
		}
		return true;
	}

	static getPromptChoices( { inputPackage, inputComposer } ) {
		const choices = [];
		FEATURES.forEach( function( feature ) {
			const featureName = feature[0];
			const c = { name: featureName, disabled: FeatureHelper.checkFeature( featureName, { inputPackage, inputComposer } ) };
			choices.push( c );
		});
		return choices;
	}

	static writeFeature( name, outputContext ) {
		const { outputPackage } = outputContext;
		const feature = FEATURES.find( ( item ) => item[0] === name );
		if ( !feature )
			throw new Error( `Invalid feature ${name}` );

		const featureDescription = feature[1];
		if ( featureDescription["package-dev"] ) {
			outputPackage.devDependencies = Object.assign( {}, featureDescription["package-dev"], outputPackage.devDependencies );
		}
		if ( featureDescription["package"] ) {
			outputPackage.dependencies = Object.assign( {}, featureDescription["package"], outputPackage.dependencies );
		}
		if ( featureDescription.output )
			featureDescription.output.call( null, outputContext );
	}

	static sortObject( obj, key ) {
		const src = obj[key];
		const out = {};
		const keys = Object.keys( src ).sort();
		keys.forEach( ( k ) => { out[k] = src[k]; } );
		obj[key] = out;
	}
}

/**
 * Generator class
 */
module.exports = class extends Generator {

	prompting() {
		const inputPackage = this.fs.readJSON( this.destinationPath( "package.json" ), {} );
		const choices = FeatureHelper.getPromptChoices({ inputPackage });
		if ( !choices.some( ( item ) => !item.disabled ) ) {
			this.log( `Todos os módulos já foram instalados` );
			return;
		}
		return this.prompt([{
			name: 'features',
			type: 'checkbox',
			message: 'Diga quais módulos você quer',
			choices: FeatureHelper.getPromptChoices({ inputPackage }),
		}]).then( ( answers ) => {
			this.answers = answers;	
		});
	}

	writing() {
		if ( !this.answers )
			return;

		const inputPackage = this.fs.readJSON( this.destinationPath( "package.json" ), {} );
		
		const outputPackage = cloneDeep( inputPackage );

		const context = { generator: this, outputPackage };
		this.answers.features.forEach( ( f ) => FeatureHelper.writeFeature( f, context ) );

		FeatureHelper.sortObject( outputPackage, 'dependencies' );
		FeatureHelper.sortObject( outputPackage, 'devDependencies' );

		this.fs.writeJSON( this.destinationPath( "package.json" ), outputPackage );
	}

};