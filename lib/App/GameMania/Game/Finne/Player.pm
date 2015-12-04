use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne::Player {
    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use App::GameMania::Misc::BagOfCards;
    use experimental qw/postderef signatures/;

    has name => (
        is => 'ro',
        isa => Str,
        required => 1,
    );
    has transaction => (
        is => 'ro',
        isa => Object,
        required => 1,
    );
    has transaction_string => (
        is => 'ro',
        isa => Str,
        required => 1,
    );
    has cards_on_table => (
        is => 'rw',
        isa => ArrayRef[ArrayRef[Maybe[InstanceOf['App::GameMania::Misc::Card']]]],
        traits => ['Array'],
        default => sub { [ [], [], [], [], [] ] },
        handles => {
            get_row_on_table => 'get',
        }
    );
    has cards_on_hand => (
        is => 'ro',
        builder => 1,
        isa => InstanceOf['App::GameMania::Misc::BagOfCards'],
    );

    sub _build_cards_on_hand($self) {
        return App::GameMania::Misc::BagOfCards->new;
    }

    sub json_attributes { qw/name cards_on_hand/ }

    with qw/App::GameMania::Sender App::GameMania::Jsonifier/;
    
    around BUILDARGS => sub ($orig, $class, %args) {
        $args{'transaction_string'} ||= sprintf '%s' => $args{'transaction'};
        $class->$orig(%args);
    }


    
}

1;
