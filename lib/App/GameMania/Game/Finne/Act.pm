use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne::Act {
    use Moose;
    use MooseX::AttributeShortcuts;
    use App::GameMania::Misc::Card;
    use Types::Standard -types;
    use experimental qw/postderef signatures/;

    has cards => (
        is => 'rw',
        isa => ArrayRef[InstanceOf['App::GameMania::Misc::Card']],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            all_cards => 'elements',
            count_cards => 'count',
            has_cards => 'count',
            get_card => 'get',
        },
    );
    has origin => (
        is => 'ro',
        isa => Enum[qw/hand pyramid stack pile discarded/],
        required => 1,
    );
    has destination => (
        is => 'ro',
        isa => Enum[qw/hand pyramid stack pile discarded/],
        required => 1,
    );
    has signature => (
        is => 'ro',
        isa => Str,
        required => 1,
    );
}

1;
