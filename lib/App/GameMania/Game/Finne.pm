use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne {
    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use App::GameMania::Game::Finne::Player;
    use App::GameMania::Misc::StackOfCards;
    use experimental qw/postderef signatures/;

    has game_code => (
        is => 'ro',
        isa => Str,
        required => 1,
    );
    
    has players => (
        is => 'ro',
        isa => ArrayRef[InstanceOf['App::GameMania::Game::Finne::Player']],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            find_player => 'first',
            count_players => 'count',
            filter_players => 'grep',
            push_player => 'push',
            get_player => 'get',
        }
    );
    has stack => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Misc::StackOfCards'],
        builder => 1,
    );
    has heap => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Misc::StackOfCards'],
        builder => 1,
    );

    sub _build_stack($self) {
        my $stack = App::GameMania::Misc::StackOfCards->new;
        $stack->fill;
        return $stack;
    }
    sub _build_heap($self) {
        return App::GameMania::Misc::StackOfCards->new;
    }

    sub add_player($self, %params) {
        $self->push_player(
            App::GameMania::Game::Finne::Player->new(
                name => $params{'name'},
                transaction => $params{'transaction'},
            )
        );
    }

    sub other_players($self, $transaction) {
          return $self->filter_players(sub { $_->transaction_string ne sprintf '%s', $transaction });
    }
    
}

1;
