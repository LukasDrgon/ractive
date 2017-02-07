import { escapeKey } from '../../../shared/keypaths';
import { isObjectType } from '../../../utils/is';
import { objectDefineProperty, objectKeys } from '../../../utils/object';

let magicAdaptor;

try {
	objectDefineProperty({}, 'test', { get() {}, set() {} });

	magicAdaptor = {
		filter ( value ) {
			return value && isObjectType( value );
		},
		wrap ( ractive, value, keypath ) {
			return new MagicWrapper( ractive, value, keypath );
		}
	};
} catch ( err ) {
	magicAdaptor = false;
}

export default magicAdaptor;

function createOrWrapDescriptor ( originalDescriptor, ractive, keypath, wrapper ) {
	if ( originalDescriptor.set && originalDescriptor.set.__magic ) {
		originalDescriptor.set.__magic.dependants.push({ ractive, keypath });
		return originalDescriptor;
	}

	let setting;

	const dependants = [{ ractive, keypath }];

	const descriptor = {
		get () {
			return 'value' in originalDescriptor ? originalDescriptor.value : originalDescriptor.get.call( this );
		},
		set (value) {
			if ( setting ) return;

			if ( 'value' in originalDescriptor ) {
				originalDescriptor.value = value;
			} else {
				originalDescriptor.set.call( this, value );
			}

			if ( wrapper.locked ) return;
			setting = true;
			dependants.forEach( ({ ractive, keypath }) => {
				ractive.set( keypath, value );
			});
			setting = false;
		},
		enumerable: true
	};

	descriptor.set.__magic = { dependants, originalDescriptor };

	return descriptor;
}

function revert ( descriptor, ractive, keypath ) {
	if ( !descriptor.set || !descriptor.set.__magic ) return true;

	const dependants = descriptor.set.__magic;
	let i = dependants.length;
	while ( i-- ) {
		const dependant = dependants[i];
		if ( dependant.ractive === ractive && dependant.keypath === keypath ) {
			dependants.splice( i, 1 );
			return false;
		}
	}
}

class MagicWrapper {
	constructor ( ractive, value, keypath ) {
		this.ractive = ractive;
		this.value = value;
		this.keypath = keypath;

		this.originalDescriptors = {};

		// wrap all properties with getters
		objectKeys( value ).forEach( key => {
			const originalDescriptor = Object.getOwnPropertyDescriptor( this.value, key );
			this.originalDescriptors[ key ] = originalDescriptor;

			const childKeypath = keypath ? `${keypath}.${escapeKey( key )}` : escapeKey( key );

			const descriptor = createOrWrapDescriptor( originalDescriptor, ractive, childKeypath, this );



			objectDefineProperty( this.value, key, descriptor );
		});
	}

	get () {
		return this.value;
	}

	reset ( value ) {
		return this.value === value;
	}

	set ( key, value ) {
		this.value[ key ] = value;
	}

	teardown () {
		objectKeys( this.value ).forEach( key => {
			const descriptor = Object.getOwnPropertyDescriptor( this.value, key );
			if ( !descriptor.set || !descriptor.set.__magic ) return;

			revert( descriptor );

			if ( descriptor.set.__magic.dependants.length === 1 ) {
				objectDefineProperty( this.value, key, descriptor.set.__magic.originalDescriptor );
			}
		});
	}
}
