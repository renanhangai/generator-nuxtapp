const inquirer = require( "inquirer" );
const YAML = require( "js-yaml" );

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
	[ "mysql", {
		"prompt": [{
			name: 'database',
			type: 'input',
			message: 'Nome do banco de dados',
		}, {
			name: 'username',
			type: 'input',
			message: 'Usuário do banco de dados',
		}, {
			name: 'password',
			type: 'input',
			message: 'Senha do banco de dados',
		}],
		test( featureManager, { generator } ) { 
			const dockerCompose = YAML.safeLoad( generator.fs.read( generator.destinationPath( "docker-compose.yml" ) ) );
			return !!dockerCompose.services.database; 
		},
		output( featureManager, { generator, answers } ) {
			const dockerCompose = YAML.safeLoad( generator.fs.read( generator.destinationPath( "docker-compose.yml" ) ) );

			const links = [].concat( dockerCompose.services.server.links ).concat( "database" ).filter( Boolean );
			dockerCompose.services.server.links = Array.from( new Set( links ) );
			dockerCompose.services.database = {
				image: 'mariadb:latest',
				environment: [
					`MYSQL_ROOT_PASSWORD=root`,
					`MYSQL_DATABASE=${answers.database}`,
					`MYSQL_USER=${answers.username}`,
					`MYSQL_PASSWORD=${answers.password}`,
				],
				volumes: [ 'database:/var/lib/mysql' ],
				ports: [ "9100:3306" ],
			};
			dockerCompose.volumes = Object.assign( { database: null }, dockerCompose.volumes );
			generator.fs.write( generator.destinationPath( "docker-compose.yml" ), YAML.safeDump( dockerCompose ) );

			let configDefault = generator.fs.readJSON( generator.destinationPath( "config.default.json" ) );
			configDefault = Object.assign( {}, configDefault );
			configDefault.database = { 
				host: "localhost",
				database: answers.database,
				username: answers.username,
				password: answers.password,
				port: 3306,
				charset: "utf8mb4",
			};
			generator.fs.writeJSON( generator.destinationPath( "config.default.json" ), configDefault );
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
			featureManager.packageJson.scripts["database:create"] = "./vendor/bin/phinx create -c database/phinx.yml";
			featureManager.packageJson.scripts["database:migrate"] = "./vendor/bin/phinx migrate -c database/phinx.yml";
			featureManager.packageJson.scripts["database:rollback"] = "./vendor/bin/phinx rollback -c database/phinx.yml";
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