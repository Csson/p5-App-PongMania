use 5.20.0;
use strict;
use warnings;

package App::GameMania::Misc::PyramidOfCards {

    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use List::Util qw/shuffle/;
    use App::GameMania::Misc::BagOfCards;
    use experimental qw/postderef signatures/;

    sub json_attributes { qw/cards/ };

    with 'App::GameMania::Jsonifier';

    has cards => (
        is => 'rw',
        isa => ArrayRef[ArrayRef[InstanceOf['App::GameMania::Misc::BagOfCards']]],
        traits => ['Array'],
        builder => 1,
        lazy => 1,
        handles => {
            all_cards => 'elements',
            sort_cards => 'sort',
            find_card => 'first',
            remove_card => 'delete',
            add_card => 'push',
        },
    );
    has censor => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Censor'],
        required => 1,
    );
    

    sub _build_cards($self) {
        return [
            [
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
            ],[
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
            ],[
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
            ],[
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
            ],[
                App::GameMania::Misc::BagOfCards->new(censor => $self->censor),
            ],
        ];
    }
    sub add_card_on($self, $row, $place, $card) {
        $self->cards->[$row][$place]->add_card($card);
    }
    sub get_stack_at($self, $row, $place) {
        return $self->cards->[$row][$place];
    }
    
}

1;
