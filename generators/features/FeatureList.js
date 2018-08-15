const inquirer = require( "inquirer" );

module.exports = [
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
		"composer": {
			"consolidation/config": "^1.1",
		},
		"package-dev": {
			"@renanhangai/config-builder": "^0.2.0",
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
	[ "phinx", {
		"composer-dev": {
			"robmorgan/phinx": "^0.10.6",
		},
		"files": {
			"database/phinx.yml.tpl": "phinx/phinx.yml.tpl",
			"database/templates/Migration.php.tpl": "phinx/Migration.php.tpl",
		},
		output( featureManager, { generator } ) {
			const config = featureManager.packageJson.scripts.config;
			const append = `-t ./database/phinx.yml.tpl:./database/phinx.yml`;
			if ( config.indexOf( append ) < 0 )
				featureManager.packageJson.scripts.config = `${config} ${append}`;
			
			let configDefault = generator.fs.readJSON( generator.destinationPath( "config.default.json" ) );
			configDefault = Object.assign( { database: { 
				host: "",
				database: "",
				username: "",
				password: "",
				port: 3306,
				charset: "utf8mb4",
			} }, configDefault );
			generator.fs.writeJSON( generator.destinationPath( "config.default.json" ), configDefault );
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