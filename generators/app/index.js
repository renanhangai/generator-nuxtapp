const Generator = require('yeoman-generator');

module.exports = class extends Generator {

	prompting() {
		return this.prompt([{
			name: 'name',
			type: 'input',
			message: 'Digite o nome do projeto',
		}]).then( ( answers ) => {
			this.anwsers = answers;
		});
	}

	writing() {
		const files = {
			"gitignore": ".gitignore",
			"package.json": true,
			"README.md": true,
			"docker-compose.yml": true,
			"etc/docker/server/Dockerfile": true,
			"etc/server/entry.d/app": true,
			"etc/server/http/default": true,
		};
		for ( const srcFile in files ) {
			const dstFile = files[srcFile] === true ? srcFile : files[srcFile];
			this.fs.copyTpl(  this.templatePath( srcFile ), this.destinationPath( dstFile ), {
				anwsers: this.anwsers,
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