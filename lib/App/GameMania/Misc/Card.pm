use 5.20.0;
use strict;
use warnings;

package App::GameMania::Misc::Card {

    use Moose;
    with 'App::GameMania::Jsonifier';
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use experimental qw/postderef signatures/;

    sub json_attributes { qw/suit value status/ };


    has suit => (
        is => 'ro',
        isa => Enum[qw/spades hearts clubs diamonds/],
        required => 1,
    );
    has value => (
        is => 'ro',
        isa => Enum[qw/2 3 4 5 6 7 8 9 10 jack queen king ace/],
        required => 1,
    );
    has status => (
        is => 'rw',
        isa => Enum[qw/hidden private public/],
        default => 'hidden',
    );
    
}

1;
