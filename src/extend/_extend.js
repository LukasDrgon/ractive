import { objectDefineProperties, toPairs } from '../utils/object';
import { isArray } from '../utils/is';
import config from '../Ractive/config/config';
import dataConfigurator from '../Ractive/config/custom/data';
import construct from '../Ractive/construct';
import initialise from '../Ractive/initialise';
import Ractive from '../Ractive';
import unwrapExtended from './unwrapExtended';

export default extend;

function extend ( ...options ) {
	if( !options.length ) {
		return extendOne( this );
	} else {
		return options.reduce( extendOne, this );
	}
}

function extendOne ( Parent, options = {} ) {
	// if we're extending with another Ractive instance...
	//
	//   var Human = Ractive.extend(...), Spider = Ractive.extend(...);
	//   var Spiderman = Human.extend( Spider );
	//
	// ...inherit prototype methods and default options as well
	if ( options.prototype instanceof Ractive ) {
		options = unwrapExtended( options );
	}

	const Child = function ( options ) {
		if ( !( this instanceof Child ) ) return new Child( options );

		construct( this, options || {} );
		initialise( this, options || {}, {} );
	};

	const proto = Object.create( Parent.prototype );
	proto.constructor = Child;

	// Static properties
	objectDefineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },

		// Parent - for IE8, can't use Object.getPrototypeOf
		_Parent: { value: Parent }
	});

	// extend configuration
	config.extend( Parent, proto, options );

	// store event and observer registries on the constructor when extending
	Child._on = ( Parent._on || [] ).concat( toPairs( options.on ) );
	Child._observe = ( Parent._observe || [] ).concat( toPairs( options.observe ) );

	// attribute defs are not inherited, but they need to be stored
	if ( options.attributes ) {
		let attrs;

		// allow an array of optional props or an object with arrays for optional and required props
		if ( isArray( options.attributes ) ) {
			attrs = { optional: options.attributes, required: [] };
		} else {
			attrs = options.attributes;
		}

		// make sure the requisite keys actually store arrays
		if ( !isArray( attrs.required ) ) attrs.required = [];
		if ( !isArray( attrs.optional ) ) attrs.optional = [];

		Child.attributes = attrs;
	}

	dataConfigurator.extend( Parent, proto, options );

	if ( options.computed ) {
		proto.computed = Object.assign( Object.create( Parent.prototype.computed ), options.computed );
	}

	Child.prototype = proto;

	return Child;
}
