const Generator = require('yeoman-generator');

module.exports = class extends Generator {

	prompting() {
		return this.prompt([{
			name: 'name',
			type: 'input',
			message: 'Nome do projeto',
		}, {
			name: 'phpNamespace',
			type: 'input',
			message: 'Namespace do PHP',
		}]).then( ( answers ) => {
			this.answers = answers;
		});
	}

	writing() {
		const files = {
			"gitignore": ".gitignore",
			"package.json": true,
			"composer.json": true,
			"README.md": true,
			"docker-compose.yml": true,
			"etc/docker/server/Dockerfile": true,
			"etc/server/entry.d/app": true,
			"etc/server/http/default": true,
			"www/common/nuxt/helper.js": true,
			"src/main.php": true,
		};
		for ( const srcFile in files ) {
			const dstFile = files[srcFile] === true ? srcFile : files[srcFile];
			this.fs.copyTpl(  this.templatePath( srcFile ), this.destinationPath( dstFile ), {
				answers: this.answers,
			});
		}
	}

	install() {
		return;
		this.installDependencies({
			npm:   false,
			bower: false,
			yarn:  true
		});
		this.yarnInstall( [ "nuxt", "cross-env" ], { dev: true } );
	}
};