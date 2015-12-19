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

    with qw/App::GameMania::Jsonifier/;

    has cards => (
        is => 'rw',
        isa => ArrayRef[InstanceOf['App::GameMania::Misc::Card']],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            all_cards => 'elements',
            sort_cards => 'sort',
            find_card => 'first',
            filter_cards => 'grep',
            remove_card => 'delete',
            add_card => 'push',
            count_cards => 'count',
            map_cards => 'map',
            get_card => 'get',
        },
    );
    has censor => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Censor'],
        required => 1,
    );

    sub compare_cards($self, $other_cards) {
        my $my_lowest_value = 15;
        for my $card ($self->all_cards) {
            warn '> ' . $card->value . ' -> ' . $card->numeric_value;
            warn $card->numeric_value < $my_lowest_value ? 'yes lower' : 'no';
            if($card->numeric_value < $my_lowest_value) {
                $my_lowest_value = $card->numeric_value;
            }
        }
        my $other_cards_lowest_value = 15;
        for my $card ($other_cards->all_cards) {

            if($card->numeric_value < $other_cards_lowest_value ) {
                $other_cards_lowest_value = $card->numeric_value;
            }
        }
        warn "lowest value, my: <$my_lowest_value>, opponent: <$other_cards_lowest_value>";
        return $my_lowest_value < $other_cards_lowest_value  ? -1
             : $my_lowest_value > $other_cards_lowest_value  ?  1
             :                                                  0
             ;
    }

    sub remove($self, $card) {
        $self->cards([ $self->filter_cards(sub { $_->suit_and_value ne $card->suit_and_value }) ]);
    }
    
}

1;
