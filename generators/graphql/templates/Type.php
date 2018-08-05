<?php
namespace <%= phpNamespace %>\graphql;

class Type extends \GraphQL\Type\Definition\Type {

	/**
	 * Register every type used by your graphql here
	 */
	public static function register( \Pimple\Container $container ) {
		$typeList = [
			// Put your types here
			// "example" => "\\<%= phpNamespace %>\\graphql\\types\\ExampleType",
		];

		// Register the types on the container
		foreach ( $typeList as $name => $typeClass ) {
			$container[$name] = function() use ( $typeClass ) { return new $typeClass; };
		}
	}

	/**
	 * Get a type by name
	 */
	public static function get( $name ) {
		static $container = null;
		if ( $container == null ) {
			$container = new \Pimple\Container;
			static::register( $container );
		}
		return $container[$name];
	}

	/**
	 * Get a type by using the static call directly
	 */
	public static function __callStatic( $name ) {
		return static::get( $name );
	}
};