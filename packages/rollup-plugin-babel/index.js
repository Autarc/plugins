var babel = require( 'babel-core' );

var assign = Object.assign || function ( target, source ) {
	Object.keys( source ).forEach( function ( key ) {
		target[ key ] = source[ key ];
	});

	return target;
};

module.exports = function ( options ) {
	options = options || {};
	var usedHelpers = [];
	var index;

	// ensure es6.modules are blacklisted
	if ( options.whitelist ) {
		index = options.whitelist.indexOf( 'es6.modules' );
		if ( ~index ) options.whitelist.splice( index, 1 );
	}

	if ( !options.blacklist ) options.blacklist = [];
	index = options.blacklist.indexOf( 'es6.modules' );
	if ( !~index ) options.blacklist.push( 'es6.modules' );

	options.externalHelpers = true;

	return {
		transform: function ( code, id ) {
			var transformed = babel.transform( code, assign({ filename: id }, options ) );

			transformed.metadata.usedHelpers.forEach( function ( helper ) {
				if ( !~usedHelpers.indexOf( helper ) ) usedHelpers.push( helper );
			});

			return {
				code: transformed.code,
				map: transformed.map
			};
		},
		intro: function () {
			// TODO replace babelHelpers.foo with babelHelpers_foo – though first
			// we need the ability to find and replace within the generated bundle
			return babel.buildExternalHelpers( usedHelpers, 'var' ).trim();
		}
	};
};
