use 5.20.0;
use strict;
use warnings;

package App::GameMania::Misc::Card {

    use Moose;
    with 'App::GameMania::Jsonifier';
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use syntax 'junction' => { any => { -as => 'jany' } };
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
    has numeric_value_exceptions => (
        is => 'ro',
        isa => HashRef,
        traits => ['Hash'],
        default => sub { { } },
        handles => {
            get_numeric_value_exception => 'get',
        },
    );
    

    sub numeric_value($self) {

        my $numeric_value_exception = $self->get_numeric_value_exception($self->value);
        return $numeric_value_exception if defined $numeric_value_exception;
        return $self->value !~ m/\D/          ? $self->value
             : $self->value eq 'jack'         ? 11
             : $self->value eq 'queen'        ? 12
             : $self->value eq 'king'         ? 13
             : $self->value eq 'ace'          ? 14
             :                                   0
             ;
    }

    sub suit_and_value($self) {
        return $self->suit.'_'.$self->value;
    }
}

1;
