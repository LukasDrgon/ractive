import { CONDITIONAL } from 'config/types';
import readLogicalOr from './readLogicalOr';
import { expectedExpression } from './shared/errors';
import readExpression from '../readExpression';

// The conditional operator is the lowest precedence operator, so we start here
export default function getConditional ( parser ) {
	const expression = readLogicalOr( parser );
	if ( !expression ) {
		return null;
	}

	const start = parser.pos;

	parser.sp();

	if ( !parser.matchString( '?' ) ) {
		parser.pos = start;
		return expression;
	}

	parser.sp();

	const ifTrue = readExpression( parser );
	if ( !ifTrue ) {
		parser.error( expectedExpression );
	}

	parser.sp();

	if ( !parser.matchString( ':' ) ) {
		parser.error( 'Expected ":"' );
	}

	parser.sp();

	const ifFalse = readExpression( parser );
	if ( !ifFalse ) {
		parser.error( expectedExpression );
	}

	return {
		t: CONDITIONAL,
		o: [ expression, ifTrue, ifFalse ]
	};
}
