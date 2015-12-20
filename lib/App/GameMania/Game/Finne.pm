use 5.20.0;
use strict;
use warnings;

package App::GameMania::Game::Finne {
    use Moose;
    use MooseX::AttributeShortcuts;
    use Types::Standard -types;
    use syntax 'junction' => { any => { -as => 'jany' }, none => { -as => 'jnone' } };
    use App::GameMania::Game::Finne::Player;
    use App::GameMania::Game::Finne::Act;
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
    has acts => (
        is => 'ro',
        isa => ArrayRef[InstanceOf['App::GameMania::Game::Finne::Act']],
        traits => ['Array'],
        default => sub { [ ] },
        handles => {
            push_act => 'push',
            get_act => 'get',
            count_acts => 'count',
            all_acts => 'elements',
            filter_acts => 'grep',
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
    sub add_act($self, %params) {
        $self->push_act(App::GameMania::Game::Finne::Act->new(%params));
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
        if(!$self->count_acts) {
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
        # The player has played a too low card (after picking from stack or hidden card in pyramid) -> pick up the pile
        elsif($self->count_current_acts_on_pile >= 2
           && jnone(2, 10) eq $self->pile->get_card(0)->value
           && $self->last_pile_act->signature eq $player->signature
           && $self->pile->get_card(0)->numeric_value < $self->pile->get_card(1)->numeric_value
           && $self->pile->get_card(0)->numeric_value != $self->pile->get_card(-1)->numeric_value) {
                $plays->{'pile'} = 1;
        }
        # we are in hand-playing mode
        elsif($player->cards_on_hand->count_cards) {
            my $last_act = $self->last_significant_act;
            my $player_last_act = $self->player_last_act($player->signature);
            warn 'last act';
            warn dumper $last_act;
            warn 'last player act';
            warn dumper $player_last_act;
            my $last_act_value = $last_act->has_cards ? $last_act->get_card(0)->value : 0;
            my $last_act_numeric_value = $last_act->has_cards ? $last_act->get_card(0)->numeric_value : 0;

            if($last_act->signature eq $player->signature) {
                my @playable_cards_from_hand = ();
                if(jany(2, 10) eq $last_act_value || $last_act->destination eq 'discarded') {
                    @playable_cards_from_hand = $player->cards_on_hand->all_cards;
                }
                else {
                    @playable_cards_from_hand = $player->cards_on_hand->filter_cards(sub { $_->value eq $last_act_value });
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
                if($last_act->destination eq 'discarded' || ($last_act->has_cards && jany(2, 10) eq $last_act->get_card(0)->value)) { }
                # if player picked up a card from the pyramid, the player can only have one card on hand, and it needs to be played even if
                # it is not good enough.
                elsif($player_last_act && $player_last_act->origin eq 'pyramid' && $player_last_act->destination eq 'hand') {
                    my $play = $player->cards_on_hand->get_card(0)->to_json;
                    $play->{'to'} = ['pile'];
                    $plays->{'hand'} = [ $play ];
                }
                # No card to play -> pick it up.
                elsif($self->count_current_acts_on_pile
                   && jnone(2, 10) eq $self->pile->get_card(0)->value
                   && !$self->stack->count_cards
                   && !scalar ($player->cards_on_hand->filter_cards(sub { $_->numeric_value >= $self->pile->get_card(0)->numeric_value }))
                   && !scalar ($player->cards_on_hand->filter_cards(sub { $_->numeric_value == $self->pile->get_card(-1)->numeric_value }))) {

                    $plays->{'pile'} = 1;
                }
                elsif($last_act->destination eq 'pile') {
                    $plays->{'hand'} =  [map {
                                            my $play = $_->to_json;
                                            $play->{'to'} = ['pile'];
                                            $play;
                                        } $player->cards_on_hand->filter_cards(sub {
                                              $_->numeric_value >= $last_act_numeric_value
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
            my $last_act = $self->last_significant_act;
            warn 'last act by ' . $last_act->signature;
            warn dumper $last_act;
            my $last_act_value = $last_act->has_cards ? $last_act->get_card(0)->value : 0;
            my $last_act_numeric_value = $last_act->has_cards ? $last_act->get_card(0)->numeric_value : 0;

            if($last_act->signature eq $player->signature) {
                if($last_act->destination eq 'discarded' || ($last_act->has_cards && jany(2, 10) eq $last_act->get_card(0)->value)) {
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
                if($last_act->destination eq 'discarded' || ($last_act->has_cards && jany(2, 10) eq $last_act->get_card(0)->value)) {
                    warn '-> pyramid. opponent played 2 or 10 or four-of-a-kind';
                }
                # opponent picked up pile
                elsif($last_act->origin eq 'pile' && $last_act->destination eq 'hand') {
                    warn '-> pyramid. opponent picked up pile --';
                    map {
                        warn '--->';
                        warn dumper $_;
                        my $play = {};

                        if($_->{'status'} eq 'hidden') {
                            $play->{'to'} = ['hand'];
                        }
                        else {
                            $play->{'to'} = ['pile'];
                        }
                        $plays->{'pyramid'}[ $_->{'row_index'} ][ $_->{'card_index'} ] = $play;
                    } @$own_pyramid_playable_cards;
                }
                else {
                    warn '-> pyramid. play on. numeric value: ' . $last_act_numeric_value;
                    warn dumper $own_pyramid_playable_cards;

                    # If we have any good playable card, then we can't play a worse card
                    my $has_any_better_than_played_card = scalar (grep { $_->{'numeric_value'} >= $last_act_numeric_value } @$own_pyramid_playable_cards)                 ? 1
                                                        : scalar (grep { $_->{'numeric_value'} == $self->pile->get_card(-1)->numeric_value } @$own_pyramid_playable_cards) ? 1
                                                        :                                                                                                                   0
                                                        ;
                    my $has_any_hidden_card = scalar (grep { $_->{'status'} eq 'hidden' } @$own_pyramid_playable_cards) ? 1 : 0;
                    warn ' -> has any good?   ' . $has_any_better_than_played_card;
                    warn ' -> has any hidden? ' . $has_any_hidden_card;
                    map {
                        warn '--->';
                        warn dumper $_;
                        my $play = {};

                        if($_->{'status'} eq 'hidden') {
                            $play->{'to'} = ['hand'];
                        }
                        # can't play a known worse card than possible
                        elsif($_->{'status'} ne 'hidden'
                           && $has_any_better_than_played_card
                           && $_->{'numeric_value'} < $last_act_numeric_value) {

                            $play->{'to'} = [];
                        }
                        # can't play a known worse card than possible if we have any hidden cards
                        elsif($_->{'status'} ne 'hidden'
                           && !$has_any_better_than_played_card
                           && $has_any_hidden_card) {

                            $play->{'to'} = [];
                        }
                        else {
                            $play->{'to'} = ['pile'];
                        }
                        $plays->{'pyramid'}[ $_->{'row_index'} ][ $_->{'card_index'} ] = $play;
                    } @$own_pyramid_playable_cards;
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

    sub count_current_acts_on_pile($self) {
        my $counter = 0;

        ACT:
        for my $act (reverse $self->all_acts) {
            last ACT if $act->origin eq 'pile';
            next ACT if $act->destination ne 'pile';
            ++$counter;
        }
        return $counter;
    }

    sub last_pile_act($self) {
        ACT:
        for my $act (reverse $self->all_acts) {
            last ACT if $act->origin eq 'pile';
            return $act if $act->destination eq 'pile';
        }
        return;
    }
    sub last_significant_act($self) {
        ACT:
        for my $act (reverse $self->all_acts) {
            return $act if jany($act->origin, $act->destination) eq 'pile';
        }
        return;
    }
    sub player_last_act($self, $signature) {

        my @acts = $self->filter_acts(sub { $_->signature eq $signature });
        return if !scalar @acts;
        return $acts[-1];
    }

    sub send($self, @args) {
        for my $player ($self->all_players) {
            $player->send(@args);
        }
    }
    
}

1;
