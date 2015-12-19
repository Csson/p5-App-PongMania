use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne {
    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use syntax 'junction' => { any => { -as => 'jany' }, none => { -as => 'jnone' } };
    use App::GameMania::Game::Finne::Player;
    use App::GameMania::Misc::StackOfCards;
    use App::GameMania::Censor;
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
        lazy => 1,
        isa => InstanceOf['App::GameMania::Misc::StackOfCards'],
        builder => 1,
    );
    has pile => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Misc::StackOfCards'],
        lazy => 1,
        builder => 1,
    );
    has discarded => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Misc::StackOfCards'],
        lazy => 1,
        builder => 1,
    );
    has censor => (
        is => 'ro',
        isa => InstanceOf['App::GameMania::Censor'],
        builder => 1,
    );
    has plays => (
        is => 'ro',
        isa => ArrayRef[HashRef],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            add_play => 'push',
            get_play => 'get',
            count_plays => 'count',
        },
    );

    sub json_attributes { qw/name cards_on_table cards_on_hand/ }

    with qw/App::GameMania::Jsonifier/;

    sub _build_censor($self) {
        return App::GameMania::Censor->new(back_color => (qw/blue red/)[int rand 2]);
    }
    sub _build_stack($self) {
        my $stack = App::GameMania::Misc::StackOfCards->new(censor => $self->censor, numeric_value_exceptions => { 2 => 15, 10 => 16});
        $stack->fill;
        return $stack;
    }
    sub _build_pile($self) {
        return App::GameMania::Misc::StackOfCards->new(censor => $self->censor, numeric_value_exceptions => { 2 => 15, 10 => 16});
    }
    sub _build_discarded($self) {
        return App::GameMania::Misc::StackOfCards->new(censor => $self->censor, numeric_value_exceptions => { 2 => 15, 10 => 16});
    }

    sub add_player($self, %params) {
        $self->push_player(App::GameMania::Game::Finne::Player->new(%params, censor => $self->censor));
    }

    # deal cards when both players have joined
    after add_player => sub ($self, @args) {
        if($self->count_players == 2) {
            DIRECTLYONDISCARDED:
            for my $discarded (1..20) {
                my $card = $self->stack->remove_card;
                $card->status('hidden');
                $self->discarded->add_card($card);
            }

            ROW:            
            for my $row (0..4) {
                my $status = $row % 2 == 0 ? 'hidden' : 'public';

                CARD:
                for my $place (0..(4 - $row)) {

                    PLAYER:
                    for my $player ($self->all_players) {
                        my $card = $self->stack->remove_card;
                        $card->status($status);
                        $player->cards_on_table->add_card_on($row, $place, $card);
                    }
                }
            }
            CARDS_ON_HAND:
            for (1..1) {

                PLAYER:
                for my $player ($self->all_players) {
                    my $card = $self->stack->remove_card;
                    $card->status('private');
                    $player->cards_on_hand->add_card($card);
                }
            }

            my $card_comparison = $self->get_player(0)->cards_on_hand->compare_cards($self->get_player(1)->cards_on_hand);
            my $starting_player_index = $card_comparison < 0 ? 0
                                      : $card_comparison > 0 ? 1
                                      :                        int rand 2
                                      ;

            $self->get_player($starting_player_index)->is_starting_player(1);

        }
    };

    sub other_players($self, $transaction) {
          return $self->filter_players(sub { $_->transaction_string ne sprintf '%s', $transaction });
    }

    sub possible_plays($self, $player, $pile_about_to_go_to_discard = 0) {
        my $plays = {
            hand => [],
            stack => 0,
            pile => 0,
            pyramid => [],
        };
        return $plays if $pile_about_to_go_to_discard;
        use Mojo::Util 'dumper';

        my $opponent = $self->find_player(sub { $_->signature ne $player->signature });
        my $own_pyramid_playable_cards = $self->playable_pyramid_cards_for($player);
        my $opponents_pyramid_playable_cards = $self->playable_pyramid_cards_for($opponent);

        # first play
        if(!$self->count_plays) {
            if($player->is_starting_player) {
                my @from_hand =  map {
                                    my $play = $_->to_json;
                                    $play->{'to'} = ['pile'];
                                    $play;
                                } $player->cards_on_hand->all_cards;

                $plays->{'hand'} = \@from_hand,
                $plays->{'stack'} = 1,
            }
            else {
                # no plays allowed
            }
        }
        # if the player picked up the pile: nothing is allowed
        #elsif($self->get_play(-1)->{'signature'} eq $player->signature
        #   && $self->get_play(-1)->{'from'} eq 'pile'
        #   && $self->get_play(-1)->{'to'} eq 'hand') {
        #}
        # If someone must pick up the pile, then the other player can't do nothing - that's why there are two ifs
        elsif($self->get_play(-1)->{'to'} eq 'pile'
           && $self->pile->count_cards >= 2
           && jnone(2, 10) eq $self->pile->get_card(0)->value
           && $self->pile->get_card(0)->numeric_value < $self->pile->get_card(1)->numeric_value
           && $self->pile->get_card(0)->numeric_value != $self->pile->get_card(-1)->numeric_value) {

            if($self->get_play(-1)->{'signature'} eq $player->signature) {
                $plays->{'pile'} = 1;
            }
        }
        # Haven't yet reach the pyramid, has cards on hand, and no card to play -> pick it up.
        elsif($self->get_play(-1)->{'to'} eq 'pile'
           && $self->pile->count_cards >= 2
           && jnone(2, 10) eq $self->pile->get_card(0)->value
           && $self->get_play(-1)->{'signature'} ne $player->signature
           && $player->cards_on_table->get_stack_at(4, 0)->count_cards
           && $player->cards_on_hand->count_cards
           && scalar $player->cards_on_hand->filter_cards(sub { $_->numeric_value >= $self->pile->get_card(0)->numeric_value }) == 0) {

            $plays->{'pile'} = 1;
        }


        # we are in hand-playing mode
        elsif($player->cards_on_hand->count_cards) {
            my $last_play = $self->get_play(-1);
            warn 'last play';
            warn dumper $last_play;
            my $last_play_value = scalar $last_play->{'cards'}->@* ? $last_play->{'cards'}[0]{'value'} : 0;
            my $last_play_numeric_value = scalar $last_play->{'cards'}->@* ? $last_play->{'cards'}[0]{'numeric_value'} : 0;

            if($last_play->{'signature'} eq $player->signature) {
                my @playable_cards_from_hand = ();
                if(jany(2, 10) eq $last_play_value || $last_play->{'to'} eq 'discarded') {
                    @playable_cards_from_hand = $player->cards_on_hand->all_cards;
                }
                else {
                    @playable_cards_from_hand = $player->cards_on_hand->filter_cards(sub { $_->value eq $last_play_value });
                }
                $plays->{'hand'} =  [map {
                            my $play = $_->to_json;
                            $play->{'to'} = ['pile'];
                            $play;
                        } @playable_cards_from_hand
                ];
            }
            else {
                # if opponent has played a 2 or 10, or four-of-a-kind
                if($last_play->{'to'} eq 'discarded' || (scalar $last_play->{'cards'}->@* && jany(2, 10) eq $last_play->{'cards'}[0]{'value'})) { }
                elsif($last_play->{'to'} eq 'stack') {
                    $plays->{'hand'} =  [map {
                                            my $play = $_->to_json;
                                            $play->{'to'} = ['pile'];
                                            $play;
                                        } $player->cards_on_hand->filter_cards(sub {
                                              $_->numeric_value >= $last_play_numeric_value
                                              ||
                                              jany(2, 10) eq $_->value
                                              ||
                                              $_->numeric_value == $self->pile->get_card(-1)->numeric_value
                                        })];
                    $plays->{'stack'} = 1 if $self->stack->count_cards;
                }
                # opponent picked up pile
                #elsif(!scalar $last_play->{'cards'}) {
                else {
                    $plays->{'hand'} = [map {
                                            my $play = $_->to_json;
                                            $play->{'to'} = ['pile'];
                                            $play;
                                        } $player->cards_on_hand->all_cards];
                    $plays->{'stack'} = 1 if $self->stack->count_cards;
                }
            }

        }
        # pyramids!
        else {
            my $last_play = $self->get_play(-1);
            warn 'last play ' . $player->signature;
            warn dumper $last_play;
            my $last_play_value = scalar $last_play->{'cards'}->@* ? $last_play->{'cards'}[0]{'value'} : 0;
            my $last_play_numeric_value = scalar $last_play->{'cards'}->@* ? $last_play->{'cards'}[0]{'numeric_value'} : 0;

            if($last_play->{'signature'} eq $player->signature) {
                if($last_play->{'to'} eq 'discarded' || (scalar $last_play->{'cards'}->@* && jany(2, 10) eq $last_play->{'cards'}[0]{'value'})) {
                    map {
                        my $play = {};
                        if($_->{'status'} eq 'hidden') {
                            $play->{'to'} = ['hand'];
                        }
                        else {
                            $play->{'to'} = ['pile']; # and possibly the other player's pyramid..
                        }
                        $plays->{'pyramid'}[ $_->{'row_index'} ][ $_->{'card_index'} ] = $play;
                    } @$own_pyramid_playable_cards;
                }
            }
            else {
                # if opponent has played a 2 or 10
                if($last_play->{'to'} eq 'discarded' || (scalar $last_play->{'cards'}->@* && jany(2, 10) eq $last_play->{'cards'}[0]{'value'})) {
                    warn '-> pyramid. opponent played 2 or 10 or four-of-a-kind';
                }
                # opponent picked up pile
                elsif(!scalar $last_play->{'cards'}) {
                    warn '-> pyramid. opponent did not play cards';
                    $plays->{'pyramid'} = [map {
                                            my $play = $_->to_json; # this is bad!
                                            $play->{'to'} = ['pile'];
                                            $play;
                                        } @$own_pyramid_playable_cards];
                }
                else {
                    warn '-> pyramid. play on.';
                    warn dumper $own_pyramid_playable_cards;

                    # If we have any good playable card, then we can't play a worse card
                    my $has_any_better_than_played_card = scalar (grep { $_->{'numeric_value'} >= $last_play_numeric_value } @$own_pyramid_playable_cards) ? 1 : 0;

                    map {
                        warn '--->';
                        warn dumper $_;
                        my $play = {};
                      #  my $it = $_;
                      #  my @own_pyramid_cards_same_value = grep { $it->{'value'} eq $_->{'value'} } @$own_pyramid_playable_cards;
                      #  my @opponent_pyramid_cards_same_value = grep { $it->{'value'} eq $_->{'value'} } @$opponents_pyramid_playable_cards;

                        if($_->{'status'} eq 'hidden') {
                            $play->{'to'} = ['hand'];
                        }
                        # can't play a known worse card than possible
                        elsif($_->{'status'} ne 'hidden'
                           && $has_any_better_than_played_card
                           && $_->{'numeric_value'} <= $last_play_numeric_value) {

                            $play->{'to'} = [];
                        }
                        else {
                            $play->{'to'} = ['pile'];
                        }
                        $plays->{'pyramid'}[ $_->{'row_index'} ][ $_->{'card_index'} ] = $play;
                    } @$own_pyramid_playable_cards
                    #grep {
                    #    $_->{'numeric_value'} >= $last_play_numeric_value
                    #    ||
                    #    jany(2, 10) eq $_->{'value'}
                    #    ||
                    #    $_->{'numeric_value'} == $self->pile->get_card(-1)->numeric_value
                    #    ||
                    #    $_->{'status'} eq 'hidden'
                    #} @$own_pyramid_playable_cards;
#                    $plays->{'pyramid'} = [     map {
#                                                    my $play = $_;
#                                                    if($_->{'status'} eq 'hidden') {
#                                                        $play->{'to'} = ['hand'];
#                                                    }
#                                                    else {
#                                                        $play->{'to'} = ['pile']; # and possibly the other player's pyramid..
#                                                    }
#                                                    $play;
#                                                }
#                                                grep {
#                                                    $_->{'numeric_value'} >= $last_play_numeric_value
#                                                    ||
#                                                    jany(2, 10) eq $_->{'value'}
#                                                    ||
#                                                    $_->{'numeric_value'} == $self->pile->get_card(-1)->numeric_value
#                                                    ||
#                                                    $_->{'status'} eq 'hidden'
#                                                } @$opponents_pyramid_playable_cards
#                    ];
                }

#                for my $row (0..4) {
#                    CARD:
#                    for my $card (0..(4 - $row)) {
#                        if($row == 4) {
#                            $plays->{'pyramid'}[$row][$card]{'to'} = ['hand'];
#                            next CARD;
#                        }
#                        warn ">> pyramid >> row: $row  card: $card";
#                        my $next_row = $row + 1;
#                        my $next_row_card_left = $card - 1;
#                        my $next_row_card_right = $card;
#
#                        #warn join ', ' => ($next_row_card_left < 0,
#                        #                   $player->cards_on_table->get_stack_at($next_row, $next_row_card_left)->count_cards,
#                        #                   $next_row_card_right + $next_row > 4,
#
#                        my $has_card_on_left = $next_row_card_left < 0                                                            ? 0
#                                             : $player->cards_on_table->get_stack_at($next_row, $next_row_card_left)->count_cards ? 1
#                                             :                                                                                      0
#                                             ;
#                        my $has_card_on_right = $next_row_card_right + $next_row > 4                                                ? 0
#                                              : $player->cards_on_table->get_stack_at($next_row, $next_row_card_right)->count_cards ? 1
#                                              :                                                                                       0
#                                              ;
#                        $plays->{'pyramid'}[$row][$card] = $has_card_on_left || $has_card_on_right ? 0 : 1;
#                    }
#                }
            }

        }
        warn 'allowed for: ' . $player->signature;
        warn dumper $plays;
        return $plays;
    }

    sub playable_pyramid_cards_for($self, $player) {

        my $playable_pyramid_cards = [];
        for my $row_index (0..4) {
            CARD:
            for my $card_index (0..(4 - $row_index)) {
                my $card_stack = $player->cards_on_table->get_stack_at($row_index, $card_index);
                #next CARD if $card_stack->count_cards && $card_stack->get_card(0)->status eq 'hidden';
                next CARD if !$card_stack->count_cards;

                my $next_row = $row_index + 1;
                my $next_row_card_left = $card_index - 1;
                my $next_row_card_right = $card_index;

                my $has_card_on_left = $next_row_card_left < 0                                                            ? 0
                                     : $player->cards_on_table->get_stack_at($next_row, $next_row_card_left)->count_cards ? 1
                                     :                                                                                      0
                                     ;
                my $has_card_on_right = $next_row_card_right + $next_row > 4                                                ? 0
                                      : $player->cards_on_table->get_stack_at($next_row, $next_row_card_right)->count_cards ? 1
                                      :                                                                                       0
                                      ;

                my $is_playable = $has_card_on_right || $has_card_on_left ? 0 : 1;
                if($is_playable) {
                    push @$playable_pyramid_cards => {
                        suit => $card_stack->get_card(0)->suit,
                        value => $card_stack->get_card(0)->value,
                        numeric_value => $card_stack->get_card(0)->numeric_value,
                        row_index => $row_index,
                        card_index => $card_index,
                        status => $card_stack->get_card(0)->status,
                    };
                }
            }
        }
        return $playable_pyramid_cards;
    }

    sub send($self, @args) {
        for my $player ($self->all_players) {
            $player->send(@args);
        }
    }
    
}

1;
