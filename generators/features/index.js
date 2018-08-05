const Generator = require('yeoman-generator');
const cloneDeep = require( "lodash.clonedeep" );
const inquirer = require( "inquirer" );
const path = require( "path" );

const FEATURES = [
	new inquirer.Separator( '***** Basic Support *****' ),
	[ "config", {
		checked: true,
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
	new inquirer.Separator( '***** Language Support *****' ),
	[ "coffeescript", {
		"package-dev": {
			"coffee-loader": "^0.9.0",
			"coffeescript": "^2.3.1",
		},
	} ],
	[ "less", {
		"package-dev": {
			"less": "^3.8.0",
			"less-loader": "^4.1.0",
		},
	} ],
	[ "pug", {
		checked: true,
		"package-dev": {
			"pug": "^2.0.3",
			"pug-plain-loader": "^1.0.0",
		},
	} ],
	[ "sass", {
		checked: true,
		"package-dev": {
			"node-sass": "^4.9.2",
			"sass-loader": "^7.0.3"
		},
	} ],
	[ "stylus", {
		"package-dev": {
			"stylus": "^0.54.5",
			"stylus-loader": "^3.0.2",
		},
	} ],
	[ "typescript", {
		"package-dev": {
			"ts-loader": "^4.4.2",
			"typescript": "^3.0.1"
		},
	} ],
	new inquirer.Separator( '***** Modules *****' ),
	[ "analytics", {
		"featureFile": "analytics.js",
		"package": {
			"@nuxtjs/google-analytics": "^2.0.2",
		},
	} ],
	[ "apollo", {
		"featureFile": "apollo.js",
		"package": {
			"@nuxtjs/apollo": "^4.0.0-rc1",
		},
	} ],
	[ "axios", {
		"featureFile": "axios.js",
		"package": {
			"@nuxtjs/axios": "^5.3.1",
		},
	} ],
	[ "buefy", {
		"featureFile": "buefy.js",
		"package": {
			"nuxt-buefy": "^0.1.0",
		},
	} ],
	[ "material-design-icons", {
		"featureFile": "material-design-icons.js",
		"package": {
			"nuxt-material-design-icons": "^1.0.4",
		},
	} ],
	[ "vuelidate", {
		"featureFile": "vuelidate.js",
		"package": {
			"vuelidate": "^0.7.4",
		},
		"files": {
			"www/common/nuxt/features/plugins/vuelidate.js": "vuelidate/plugin.js",
			"www/common/validators/index.js": "vuelidate/validators.js",
		},
	} ],
	[ "vuetify", {
		"featureFile": "vuetify.js",
		"package": {
			"@nuxtjs/vuetify": "^0.4.2",
		},
	} ],
];

/**
 * Helper class for testing features and enabling then
 */
class FeatureHelper {


	static findFeatureDescription( name ) {
		const feature = FEATURES.find( ( feature ) => {
			if ( !Array.isArray( feature ) )
				return false;
			return feature[0] === name;
		} );
		if ( !feature )
			throw new Error( `Invalid feature ${name}` );
		return feature[1];
	}

	static getPromptChoices( context ) {
		const { inputPackage, inputComposer } = context;
		const choices = [];
		FEATURES.forEach( function( feature ) {
			if ( feature instanceof inquirer.Separator ) {
				choices.push( feature );
				return;
			} 
			
			const featureName = feature[0];
			const featureDescription = FeatureHelper.findFeatureDescription( featureName );
			if ( !featureDescription )
				return;

			const c = { 
				name: featureName, 
				checked: featureDescription.checked,
				disabled: FeatureHelper.checkFeature( featureName, featureDescription, context ) ? "Instalado" : false,
			};
			choices.push( c );
		});
		return choices;
	}

	static checkFeature( featureName, featureDescription, inputContext ) {
		const { generator, inputPackage, inputComposer } = inputContext;

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

	static writeFeature( name, outputContext ) {
		const { generator, outputPackage } = outputContext;

		const featureDescription = FeatureHelper.findFeatureDescription( name );
		if ( !featureDescription )
			return;

		if ( featureDescription["package-dev"] ) {
			outputPackage.devDependencies = Object.assign( {}, featureDescription["package-dev"], outputPackage.devDependencies );
		}
		if ( featureDescription["package"] ) {
			outputPackage.dependencies = Object.assign( {}, featureDescription["package"], outputPackage.dependencies );
		}
		if ( featureDescription.output )
			featureDescription.output.call( null, outputContext );


		if ( featureDescription.featureFile ) {
			outputPackage["nuxt-helper-features"] = [].concat( outputPackage["nuxt-helper-features"] ).concat( name ).filter( Boolean );
			generator.fs.copy( generator.templatePath( featureDescription.featureFile ), generator.destinationPath( `www/common/nuxt/features/${name}.js` ) );
		}

		if ( featureDescription.files ) {
			for( const destFile in featureDescription.files ) {
				const srcFile = featureDescription.files[ destFile ];
				generator.fs.copy( generator.templatePath( srcFile ), generator.destinationPath( path.join( destFile ) ) );
			}
		}
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

		const context = { generator: this, inputPackage };
		return this.prompt([{
			name: 'features',
			type: 'checkbox',
			message: 'Diga quais módulos você quer',
			pageSize: 21,
			choices: FeatureHelper.getPromptChoices( context ),
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