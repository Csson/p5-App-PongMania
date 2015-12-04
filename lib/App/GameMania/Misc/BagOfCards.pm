use 5.20.0;
use strict;
use warnings;

package App::GameMania::Misc::BagOfCards {

    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use List::Util qw/shuffle/;
    use App::GameMania::Misc::Card;
    use experimental qw/postderef signatures/;

    sub json_attributes { qw/cards/ };

    with 'App::GameMania::Jsonifier';

    has cards => (
        is => 'rw',
        isa => ArrayRef[InstanceOf['App::GameMania::Misc::Card']],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            all_cards => 'elements',
            sort_cards => 'sort',
            find_card => 'first',
            remove_card => 'delete',
            add_card => 'push',
        },
    );

    
}

1;
