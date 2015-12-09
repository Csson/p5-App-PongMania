use 5.20.0;
use strict;
use warnings;

package App::GameMania::Misc::StackOfCards {

    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use List::Util qw/shuffle/;
    use App::GameMania::Misc::Card;
    use experimental qw/postderef signatures/;

    has cards => (
        is => 'rw',
        isa => ArrayRef,
        traits => ['Array'],
        default => sub { [ ] },
        clearer => 1,
        handles => {
            remove_card => 'shift',
            add_card => 'unshift',
            count_cards => 'count',
        },
    );

    sub fill($self) {
        my @cards = ();
        for my $suit (qw/clubs hearts diamonds spades/) {
            for my $value (qw/2 3 4 5 6 7 8 9 10 jack queen king ace/) {
                push @cards => App::GameMania::Misc::Card->new(suit => $suit, value => $value);
            }
        }
        $self->cards([shuffle @cards]);
        return $self;
    }
}

1;
