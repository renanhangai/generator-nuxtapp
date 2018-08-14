const Generator = require('yeoman-generator');
const FeatureManager = require( "./FeatureManager" );
const cloneDeep = require( "lodash.clonedeep" );
const inquirer = require( "inquirer" );
const path = require( "path" );

const FEATURES = [
	new inquirer.Separator( '***** Basic Support *****' ),
	[ "config", {
		checked: true,
		test( featureManager ) {
			return !!featureManager.packageJson.config;	
		},
		output( featureManager, { generator } ) {
			generator.fs.writeJSON( generator.destinationPath( "config.default.json" ), {} );
			featureManager.packageJson.scripts = Object.assign( {
				"config": "cross-env config-builder config.default.json \"$APP_CONFIG\" +config.json --output-dir \"dist:$APP_BUILD_DIR\" -o config.json -o config.php",
			}, featureManager.packageJson.scripts );
		},
		"package-dev": {
			"@renanhangai/config-builder": "^0.1.1",
		},
		"files": {
			"src/Config.php": "config/Config.php",
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
			"@mdi/font": "^2.5.94",
		},
	} ],
	[ "sass-resource-loader", {
		"featureFile": "sass-resource-loader.js",
		"package": {
			"nuxt-sass-resources-loader": "^2.0.3",
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


	static findFeature( name ) {
		const feature = FEATURES.find( ( feature ) => {
			if ( !Array.isArray( feature ) )
				return false;
			return feature[0] === name;
		} );
		if ( !feature )
			throw new Error( `Invalid feature ${name}` );
		return feature[1];
	}

	static getPromptChoices( featureManager, force ) {
		const choices = [];
		FEATURES.forEach( function( featureDescription ) {
			if ( featureDescription instanceof inquirer.Separator ) {
				choices.push( featureDescription );
				return;
			} 
			
			const featureName = featureDescription[0];
			const feature     = featureDescription[1];
			const isInstalled = featureManager.check( feature );
			const c = { 
				name: featureName, 
				checked:  force ? false : featureDescription.checked,
				disabled: force ? false : (isInstalled ? "Instalado" : false),
			};
			choices.push( c );
		});
		return choices;
	}
}

/**
 * Generator class
 */
module.exports = class extends Generator {

	constructor( args, opts ) {
		super( args, opts );
		this.option( 'force', {
			desc:  "Força a instalação de módulos mesmo já instalados",
			alias: "f",
			type:  Boolean,
		} );
	}

	prompting() {
		this.featureManager = new FeatureManager( this );

		const choices = FeatureHelper.getPromptChoices( this.featureManager, this.options.force );
		if ( !choices.some( ( item ) => !item.disabled ) )
			this.log( `Todos os módulos já foram instalados` );

		return this.prompt([{
			name: 'features',
			type: 'checkbox',
			message: 'Diga quais módulos você quer',
			pageSize: 21,
			choices,
		}]).then( ( answers ) => {
			this.answers = answers;	
		});
	}

	writing() {
		if ( !this.answers )
			return;
		this.answers.features.forEach( ( name ) => {
			const feature = FeatureHelper.findFeature( name );
			this.featureManager.install( feature, name );
		});
		this.featureManager.write();
	}

};