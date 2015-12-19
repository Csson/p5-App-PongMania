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
            all_cards => 'elements',
            remove_card => 'shift',
            add_card => 'unshift',
            count_cards => 'count',
            get_card => 'get',
        },
    );
    has censor => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Censor'],
        required => 1,
    );
    has numeric_value_exceptions => (
        is => 'ro',
        isa => HashRef,
        traits => ['Hash'],
        default => sub { { } },
        handles => {
            get_numeric_value_exception => 'get',
        },
    );
    
    with qw/App::GameMania::Jsonifier/;

    sub json_attributes { qw/cards/ }

    sub fill($self) {
        my @cards = ();
        use Mojo::Util 'dumper';
        warn 'numeric_value_exceptions:';
        warn dumper $self->numeric_value_exceptions;
        for my $suit (qw/clubs hearts diamonds spades/) {
            for my $value (qw/2 3 4 5 6 7 8 9 10 jack queen king ace/) {
                push @cards => App::GameMania::Misc::Card->new(suit => $suit, value => $value, numeric_value_exceptions => $self->numeric_value_exceptions);
            }
        }
        $self->cards([shuffle @cards]);
        return $self;
    }

    sub to_censored_json($self) {
        my $json = $self->to_json;
        $json->{'cards'} = $self->censor->card_array($json->{'cards'});
        return $json;
    }
}

1;
__END__

addglobal {
    enter => 'log',
};
addstate happy => (
    enter => 'wag_tail',
    on => {
        touch_head => 'wag_tail',
    },
    transition => {
        knock_down => 'injured',
    },
);
addstate unhappy => (
    enter => 'bark',
    on => {
        touch_head => 'bark',
    },
    transition => {
        sleep => 'happy',
    },
);
addstate 'unhappy/injured' => (
    enter => 'whimper',
);
addstate 'unhappy/angry' => (
    on => {
        touch_head => 'bite',
    },
);
start_machine('happy');



----
my $dog = The::Dog::StateMachine->new;
$dog->head_touch;
$dog->knock_down;
$dog->head_touch;