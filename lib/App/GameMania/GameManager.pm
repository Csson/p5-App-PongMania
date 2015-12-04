use 5.20.0;
use strict;
use warnings;

package App::GameMania::GameManager {

    use Moose;
    use Types::Standard -types;

    has finnes => (
        is => 'rw',
        isa => ArrayRef[InstanceOf['App::GameMania::Game::Finne']],
        default => sub { [] },
        traits => ['Array'],
        handles => {
            find_finne => 'first',
            add_finne => 'push',
            count_finnes => 'count',
        },
    );
}

1;
