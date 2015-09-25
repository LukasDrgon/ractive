import { missingPlugin } from '../../../../config/errors';
import { isClient } from '../../../../config/environment';
import { warnIfDebug, warnOnceIfDebug } from '../../../../utils/log';
import { createElement } from '../../../../utils/dom';
import camelCase from '../../../../utils/camelCase';
import interpolate from '../../../../shared/interpolate';
import Ticker from '../../../../shared/Ticker';
import prefix from './prefix';
import unprefix from './unprefix';
import hyphenate from './hyphenate';

let createTransitions;

if ( !isClient ) {
	createTransitions = null;
} else {
	const testStyle = createElement( 'div' ).style;
	const linear = x => x;

	let canUseCssTransitions = {};
	let cannotUseCssTransitions = {};

	// determine some facts about our environment
	let TRANSITION, TRANSITIONEND, CSS_TRANSITIONS_ENABLED, TRANSITION_DURATION, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION;

	if ( testStyle.transition !== undefined ) {
		TRANSITION = 'transition';
		TRANSITIONEND = 'transitionend';
		CSS_TRANSITIONS_ENABLED = true;
	} else if ( testStyle.webkitTransition !== undefined ) {
		TRANSITION = 'webkitTransition';
		TRANSITIONEND = 'webkitTransitionEnd';
		CSS_TRANSITIONS_ENABLED = true;
	} else {
		CSS_TRANSITIONS_ENABLED = false;
	}

	if ( TRANSITION ) {
		TRANSITION_DURATION = TRANSITION + 'Duration';
		TRANSITION_PROPERTY = TRANSITION + 'Property';
		TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
	}

	createTransitions = function ( t, to, options, changedProperties, resolve ) {

		// Wait a beat (otherwise the target styles will be applied immediately)
		// TODO use a fastdom-style mechanism?
		setTimeout( function () {

			let jsTransitionsComplete, cssTransitionsComplete;

			const checkComplete = function () {
				if ( jsTransitionsComplete && cssTransitionsComplete ) {
					// will changes to events and fire have an unexpected consequence here?
					t.ractive.fire( t.name + ':end', t.node, t.isIntro );
					resolve();
				}
			};

			// this is used to keep track of which elements can use CSS to animate
			// which properties
			const hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;

			// need to reset transition properties
			const style = t.node.style;
			const previous = {
				property: style[ TRANSITION_PROPERTY ],
				timing: style[ TRANSITION_TIMING_FUNCTION ],
				duration: style[ TRANSITION_DURATION ]
			};

			style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix ).map( hyphenate ).join( ',' );
			style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
			style[ TRANSITION_DURATION ] = ( options.duration / 1000 ) + 's';

			const transitionEndHandler = function ( event ) {
				var index;

				index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );
				if ( index !== -1 ) {
					changedProperties.splice( index, 1 );
				}

				if ( changedProperties.length ) {
					// still transitioning...
					return;
				}

				style[ TRANSITION_PROPERTY ] = previous.property;
				style[ TRANSITION_TIMING_FUNCTION ] = previous.duration;
				style[ TRANSITION_DURATION ] = previous.timing;

				t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

				cssTransitionsComplete = true;
				checkComplete();
			};

			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

			setTimeout( function () {
				var i = changedProperties.length, hash, originalValue, index, propertiesToTransitionInJs = [], prop, suffix, interpolator;

				while ( i-- ) {
					prop = changedProperties[i];
					hash = hashPrefix + prop;

					if ( CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
						style[ prefix( prop ) ] = to[ prop ];

						// If we're not sure if CSS transitions are supported for
						// this tag/property combo, find out now
						if ( !canUseCssTransitions[ hash ] ) {
							originalValue = t.getStyle( prop );

							// if this property is transitionable in this browser,
							// the current style will be different from the target style
							canUseCssTransitions[ hash ] = ( t.getStyle( prop ) != to[ prop ] );
							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];

							// Reset, if we're going to use timers after all
							if ( cannotUseCssTransitions[ hash ] ) {
								style[ prefix( prop ) ] = originalValue;
							}
						}
					}

					if ( !CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[ hash ] ) {
						// we need to fall back to timer-based stuff
						if ( originalValue === undefined ) {
							originalValue = t.getStyle( prop );
						}

						// need to remove this from changedProperties, otherwise transitionEndHandler
						// will get confused
						index = changedProperties.indexOf( prop );
						if ( index === -1 ) {
							warnIfDebug( 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!', { node: t.node });
						} else {
							changedProperties.splice( index, 1 );
						}

						// TODO Determine whether this property is animatable at all

						suffix = /[^\d]*$/.exec( to[ prop ] )[0];
						interpolator = interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) ) || ( () => to[ prop ] );

						// ...then kick off a timer-based transition
						propertiesToTransitionInJs.push({
							name: prefix( prop ),
							interpolator,
							suffix
						});
					}
				}


				// javascript transitions
				if ( propertiesToTransitionInJs.length ) {
					let easing;

					if ( typeof options.easing === 'string' ) {
						easing = t.ractive.easing[ options.easing ];

						if ( !easing ) {
							warnOnceIfDebug( missingPlugin( options.easing, 'easing' ) );
							easing = linear;
						}
					} else if ( typeof options.easing === 'function' ) {
						easing = options.easing;
					} else {
						easing = linear;
					}

					new Ticker({
						duration: options.duration,
						easing,
						step ( pos ) {
							var prop, i;

							i = propertiesToTransitionInJs.length;
							while ( i-- ) {
								prop = propertiesToTransitionInJs[i];
								style[ prop.name ] = prop.interpolator( pos ) + prop.suffix;
							}
						},
						complete () {
							jsTransitionsComplete = true;
							checkComplete();
						}
					});
				} else {
					jsTransitionsComplete = true;
				}


				if ( !changedProperties.length ) {
					// We need to cancel the transitionEndHandler, and deal with
					// the fact that it will never fire
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
					cssTransitionsComplete = true;
					checkComplete();
				}
			}, 0 );
		}, options.delay || 0 );
	};
}

export default createTransitions;
