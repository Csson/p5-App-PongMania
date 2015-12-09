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
            all_players => 'elements',
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

    # deal cards when both players have joined
    after add_player => sub ($self, @args) {
        if($self->count_players == 2) {
            ROW:            
            for my $row (0..4) {
                my $status = $row % 2 == 0 ? 'hidden' : 'public';

                CARD:
                for my $hidden (1..$row + 1) {

                    PLAYER:
                    for my $player ($self->all_players) {
                        my $card = $self->stack->remove_card;
                        $card->status($status);
                        push $player->get_row_on_table($row)->@* => $card;
                    }
                }
            }
            CARDS_ON_HAND:
            for my $i (1..3) {

                PLAYER:
                for my $player ($self->all_players) {
                    my $card = $self->stack->remove_card;
                    $card->status('private');
                    $player->cards_on_hand->add_card($card);
                }
            }
        }
    };

    sub other_players($self, $transaction) {
          return $self->filter_players(sub { $_->transaction_string ne sprintf '%s', $transaction });
    }
    
}

1;
