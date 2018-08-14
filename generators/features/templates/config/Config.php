<?php
namespace <%= phpNamespace %>;

/** 
 * Configuration class
 * 
 * Usage:
 *   Config::get( "option.config" )
 *   Config::get( "test.what.data" )
 */
abstract class Config {

	private static $config;

	public static function _setup() {
		if ( self::$config == null ) {
			$config = new \Consolidation\Config\Config;
			$config->import( require ( @$_ENV["APP_BUILD_DIR"] ?: dirname( __DIR__ ).'/dist' ).'/config.php' );
			self::$config = $config;
		}
	}

	public static function get( $key ) {
		return self::$config->get( $key );
	}
};
Config::_setup();