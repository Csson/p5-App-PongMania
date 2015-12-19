use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne::Player {
    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use App::GameMania::Misc::BagOfCards;
    use App::GameMania::Misc::PyramidOfCards;
    use experimental qw/postderef signatures/;

    has name => (
        is => 'ro',
        isa => Str,
        required => 1,
    );
    has signature => (
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
        lazy => 1,
        isa => InstanceOf['App::GameMania::Misc::PyramidOfCards'],
        default => sub { App::GameMania::Misc::PyramidOfCards->new(censor => shift->censor) },
    );
    has cards_on_hand => (
        is => 'rw',
        lazy => 1,
        builder => 1,
        isa => InstanceOf['App::GameMania::Misc::BagOfCards'],
    );
    has censor => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Censor'],
        required => 1,
    );
    has is_starting_player => (
        is => 'rw',
        isa => Bool,
        default => 0,
    );

    sub json_attributes { qw/name signature cards_on_table cards_on_hand is_starting_player/ }

    with qw/App::GameMania::Sender App::GameMania::Jsonifier/;

    sub _build_cards_on_hand($self) {
        return App::GameMania::Misc::BagOfCards->new(censor => $self->censor);
    }
    around BUILDARGS => sub ($orig, $class, %args) {
        use Mojo::Util 'dumper';
        warn dumper \%args;
        $args{'transaction_string'} ||= sprintf '%s' => $args{'transaction'};
        $class->$orig(%args);
    };

    sub to_censored_json($self, $censor = [qw/private hidden/]) {
        my $json = $self->to_json;
        $json->{'cards_on_hand'}{'cards'} = $self->censor->card_array($json->{'cards_on_hand'}{'cards'}, $censor);
        $json->{'cards_on_table'}{'cards'} = $self->censor->array_of_card_arrays($json->{'cards_on_table'}{'cards'}, $censor);
        return $json;
    }
}

1;
