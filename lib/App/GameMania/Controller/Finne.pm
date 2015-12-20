use 5.20.0;
use strict;
use warnings;

package App::GameMania::Controller::Finne {

    use Mojo::Base 'Mojolicious::Controller';
    use Mojo::JSON qw/from_json/;
    use syntax 'junction' => { any => { -as => 'jany' } };

    use Mojo::Util 'dumper';
    use Types::Standard -types;
    use App::GameMania::Game::Finne;
    use experimental qw/postderef signatures/;

    has manager => sub { shift->game_manager };

    sub ws($self) {
        $self->inactivity_timeout(300);
        my $log = $self->app->log;

        $self->on(message => sub ($c, $message) {
            
            $log->debug('connected:' . sprintf '%s', $c->tx);
            my($command, $params) = $self->parse_message($message);
            $log->debug(dumper $params);
            my $game = $self->manager->find_finne(sub { $_->game_code eq $params->{'game_code'} });

            $c->app->log->debug($message);
            if($command eq 'chat') {
                $c->command_chat($game, $params);
            }
            elsif($command eq 'join_game') {
                $c->command_join_game($game, $params);
            }
            elsif($command eq 'make_play') {
                $c->command_make_play($game, $params);
            }
            elsif($command eq 'check_pyramid_play') {
                $c->command_check_pyramid_play($game, $params);
            }
            elsif($command eq 'reset_games') {
                $self->manager->finnes([]);
                $self->send('chat', message => 'All games cleared', status => 'warning', from => 'server');
            }
        });
        $self->on(finish => sub {
            my $c = shift;
            my $code = shift;
            my $reason = shift;

        });
    }

    sub command_chat($self, $game, $params) {
        my $message = $params->{'message'};
        return if !defined $game;

        for my $player ($game->other_players($self->tx)) {
            $player->send('chat', message => $params->{'message'});
        }
    }

    sub command_join_game($self, $game, $params) {
        my $player_name = $params->{'player_name'};

        if(!defined $game) {
            $game = App::GameMania::Game::Finne->new(game_code => $params->{'game_code'});
            $self->manager->add_finne($game);
            $game->add_player(name => $player_name, transaction => $self->tx, signature => 'a');
            my $player = $game->get_player(0);
            $player->send('chat', message => 'Waiting for other player', from => 'server');
        }
        elsif($game && $game->count_players == 1 && $game->find_player(sub { $_->name ne $player_name })) {
            $game->add_player(name => $player_name, transaction => $self->tx, signature => 'b');

        }
        # lets play!
        if($game->count_players == 2) {
            my $first_player = $game->get_player(0);
            my $second_player = $game->get_player(1);

            my $stack_json = $game->stack->to_censored_json;

            my $player1_json = $first_player->to_censored_json(['hidden']);
            my $player1_censored_json = $first_player->to_censored_json([qw/private hidden/]);

            my $player2_json = $second_player->to_censored_json(['hidden']);
            my $player2_censored_json = $second_player->to_censored_json([qw/private hidden/]);

            $first_player->send('chat', message => 'You have been challenged by ' . $second_player->name, from => 'server');
            $second_player->send('chat', message => 'You have challenged ' . $first_player->name, from => 'server');

            $first_player->send('init_game', player => $player1_json,
                                             opponent => $player2_censored_json,
                                             stack => $stack_json,
                                             is_starting_player => $first_player->is_starting_player ? 1 : 0,
                                             allowed_plays => $game->possible_plays($first_player),
            );
            $second_player->send('init_game', player => $player2_json,
                                              opponent => $player1_censored_json,
                                              stack => $stack_json,
                                              is_starting_player => $second_player->is_starting_player ? 1 : 0,
                                              allowed_plays => $game->possible_plays($second_player),
            );
        }
    }
    sub command_make_play($self, $game, $params) {
        my $player = $game->find_player(sub { $_->signature eq $params->{'signature'} });
        my $other_player = $game->find_player(sub { $_->signature ne $params->{'signature'} });

        my $origin = $params->{'origin'};
        my $destination = $params->{'destination'};

        # we glance at the card on stack so we can check for four-in-a-row
        my $cards = $origin eq 'stack'        ? [$game->stack->get_card(0)]
                  : exists $params->{'cards'} ? $params->{'cards'}
                  :                             []
                  ;
        my $value = scalar @$cards ? $cards->[0]{'value'} : 1;

use Mojo::Util 'dumper';
warn "\n======== command_make_play ===========\n";
warn 'command_make_play';
warn dumper $params;
warn '--';
warn dumper $cards;
warn "value: <$value>";
warn "played by:" . $player->signature;

        # TODO: last four same value also to discard!
        my $pile_to_discard = $value eq '10' ? 1 : 0;
        if($game->pile->count_cards && !$pile_to_discard) {

            my $card_value_to_want = $value;
            my $card_with_same_value_count = scalar @$cards;
            my $card_index_to_get = 0;
            warn "cards on the stack (below), wants $card_value_to_want";
            warn dumper $game->pile->cards;
            while(1) {
                my $next_card = $game->pile->get_card($card_index_to_get);
                warn sprintf ' checks %s of %s', $next_card->value, $next_card->suit;
                last if !defined $next_card;
                warn '  -> is defined';
                last unless $game->pile->get_card($card_index_to_get)->value eq $card_value_to_want;
                ++$card_index_to_get;
                ++$card_with_same_value_count;
                warn "  -> has same value ($card_index_to_get|$card_with_same_value_count)";
            }
            $pile_to_discard = 1 if $card_with_same_value_count == 4;
        }
warn "pile_to_discard: <$pile_to_discard>";

        if($origin eq 'hand') {
            my $played_cards = [];
            warn 'no cards on hand (.):' . $player->cards_on_hand->count_cards;
            $player->cards_on_hand->map_cards(sub { warn dumper $_ });
            warn '----';
            for my $i (0 .. scalar @$cards - 1) {
                my $suit = $cards->[$i]{'suit'};
                warn "suit <$suit> value <$value>";
                my $played_card = $player->cards_on_hand->find_card(sub { $_->suit eq $suit && $_->value eq $value });
                warn 'played card (below):';
                warn dumper $played_card;
                warn 'num cards on hand (a):' . $player->cards_on_hand->count_cards;
                $player->cards_on_hand->remove($played_card);
                warn 'num cards on hand (b):' . $player->cards_on_hand->count_cards;
                push @$played_cards => $played_card;
            }
            return if !scalar @$played_cards;

            $game->add_act(
                signature => $player->signature,
                origin => 'hand',
                destination => $destination,
                cards => $played_cards,
            );

            for my $card (@$played_cards) {
                if($destination eq 'pile') {
                    $game->pile->add_card($card);
                }
            }


            $player->send('move_card',
                cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @$played_cards],
                from => 'hand',
                to => $destination,
                hand => $player->cards_on_hand->to_json,
                allowed_plays => $game->possible_plays($player, $pile_to_discard),
            );
            $other_player->send('move_card',
                 cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @$played_cards],
                 from => 'opponents_hand',
                 to => $destination,
                 allowed_plays => $game->possible_plays($other_player, $pile_to_discard),
            );
            $game->send('chat',
                message => $player->name . ' played ' . $played_cards->[0]{'value'} . ' of ' . join (', ' => map { $_->suit } @$played_cards),
                status => 'play',
                from => 'server'
            );

            while($game->stack->count_cards && $player->cards_on_hand->count_cards < 3) {
                my $card = $game->stack->remove_card;
                $card->status('private');
                $player->cards_on_hand->add_card($card);

                $player->send('move_card', 
                    cards => [ { suit => $card->suit, value => $card->value, numeric_value => $card->numeric_value } ],
                    from => 'stack',
                    to => 'hand',
                    hand => $player->cards_on_hand->to_json,
                    allowed_plays => $game->possible_plays($player, $pile_to_discard),
                );
                $other_player->send('move_card', 
                    cards => [ { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } ],
                    from => 'stack',
                    to => 'opponents_hand',
                    allowed_plays => $game->possible_plays($other_player, $pile_to_discard),
                );
            }
        }
        elsif($origin eq 'stack') {
            my $card = $game->stack->remove_card;
            $card->status('public');
            $game->pile->add_card($card);

            $game->add_act(
                signature => $player->signature,
                origin => 'stack',
                destination => 'pile',
                cards => [$card],
            );
            $game->send('chat',
                message => $player->name . ' played ' . $card->value . ' of ' . $card->suit,
                status => 'play',
                from => 'server'
            );

            $player->send('move_card',
                cards => [{ suit => $card->suit, value => $card->value, numeric_value => $card->numeric_value }],
                from => 'stack',
                to => 'pile',
                allowed_plays => $game->possible_plays($player, $pile_to_discard),
            );
            $other_player->send('move_card',
                 cards => [{ suit => $card->suit, value => $card->value, numeric_value => $card->numeric_value }],
                 from => 'stack',
                 to => 'pile',
                 allowed_plays => $game->possible_plays($other_player, $pile_to_discard),
            );

#            # all these pass if the player *doesn't* need to pick up the pile
#            return if $game->count_plays < 2;
#
#            my $last_play = $game->get_play(-2);
#            return if jany(2, 10) eq $last_play->{'cards'}[0]{'value'};
#            return if jany(2, 10) eq $card->value;
#            return if !scalar $last_play->{'cards'}->@*;
#            return if $last_play->{'cards'}[0]{'numeric_value'} <= $card->numeric_value;
#
#
#            $game->add_play({
#                signature => $player->signature,
#                from => 'pile',
#                to => 'hand',
#                cards => [],
#            });
#            $game->send('chat',
#                message => $player->name . ' picks up the pile',
#                status => 'play',
#                from => 'server'
#            );
#            my @all_cards_on_pile = $game->pile->all_cards;
#            $player->cards_on_hand->add_card(@all_cards_on_pile);
#            $game->pile->cards([]);
#
#            $player->send('move_card',
#                cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @all_cards_on_pile],
#                from => 'pile',
#                to => 'hand',
#                allowed_plays => $game->possible_plays($player),
#            );
#            $other_player->send('move_card',
#                 cards => [map { { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } } @all_cards_on_pile],
#                 from => 'pile',
#                 to => 'opponents_hand',
#                 allowed_plays => $game->possible_plays($other_player),
#            );
        }
        elsif($origin eq 'pyramid') {
            my $row_index = $params->{'pyramidLocation'}{'rowIndex'};
            my $card_index = $params->{'pyramidLocation'}{'cardIndex'};

            my @cards = $player->cards_on_table->get_stack_at($row_index, $card_index)->all_cards;
            warn 'pyramid stack ' . $row_index . '/' . $card_index;
            warn dumper \@cards;
            $player->cards_on_table->get_stack_at($row_index, $card_index)->cards([]);

            if($destination eq 'hand') {
                map { $_->status('private') } @cards;
                $player->cards_on_hand->add_card(@cards);
                $game->send('chat',
                    message => sprintf ('%s picks up %s of %s', $player->name, $cards[0]->value, $cards[0]->suit),
                    status => 'play',
                    from => 'server'
                );
            }
            elsif($destination eq 'pile') {
                $game->pile->add_card(@cards);
                $game->send('chat',
                    message => $player->name . ' played ' . $cards[0]{'value'} . ' of ' . join (', ' => map { $_->suit } @cards),
                    status => 'play',
                    from => 'server'
                );
            }

            $game->add_act(
                signature => $player->signature,
                origin => 'pyramid',
                destination => $destination,
                cards => \@cards,
            );

            $player->send('move_card',
                cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @cards],
                from => 'pyramid',
                pyramid_location => { row_index => $row_index, card_index => $card_index },
                to => $destination,
                allowed_plays => $game->possible_plays($player),
            );
            # secret cards if opponents picks it up
            if($destination eq 'hand') {
                $other_player->send('move_card',
                    cards => [map { { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } } @cards],
                    from => 'opponents_pyramid',
                    pyramid_location => { row_index => $row_index, card_index => $card_index },
                    to => 'opponents_hand',
                    allowed_plays => $game->possible_plays($other_player),
                );
            }
            else {
                $other_player->send('move_card',
                    cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @cards],
                    from => 'opponents_pyramid',
                    pyramid_location => { row_index => $row_index, card_index => $card_index },
                    to => $destination,
                    allowed_plays => $game->possible_plays($other_player),
                );
            }
        }
        elsif($origin eq 'pile' && $destination eq 'hand') {
            my @cards = map { $_->status('private'); $_ } $game->pile->all_cards;
            $player->cards_on_hand->add_card(@cards);
            $game->pile->cards([]);

            $game->add_act(
                signature => $player->signature,
                origin => 'pile',
                destination => 'hand',
                cards => \@cards,
            );
            $game->send('chat',
                message => $player->name . ' picked up the pile',
                status => 'play',
                from => 'server'
            );

            $player->send('move_card',
                cards => [map { { suit => $_->suit, value => $_->value, numeric_value => $_->numeric_value } } @cards],
                from => 'pile',
                to => 'hand',
                allowed_plays => $game->possible_plays($player, $pile_to_discard),
            );
            $other_player->send('move_card',
                 cards => [map { { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } } @cards],
                 from => 'pile',
                 to => 'opponents_hand',
                 allowed_plays => $game->possible_plays($other_player, $pile_to_discard),
            );
        }

        if($pile_to_discard) {
            my @cards = $game->pile->all_cards;
            $game->discarded->add_card(@cards);
            $game->pile->cards([]);

            $game->add_act(
                signature => $player->signature,
                origin => 'pile',
                destination => 'discarded',
                cards => \@cards,
            );

            $player->send('move_card',
                cards => [map { { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } } @cards],
                from => 'pile',
                to => 'discarded',
                allowed_plays => $game->possible_plays($player),
            );
            $other_player->send('move_card',
                 cards => [map { { suit => 'back', value => $game->censor->back_color, numeric_value => 1 } } @cards],
                 from => 'pile',
                 to => 'discarded',
                 allowed_plays => $game->possible_plays($other_player),
            );
            $game->send('chat',
                message => $player->name . ' cleans the pile',
                status => 'play',
                from => 'server'
            );
        }
        # check for pick up pile
       # else {
       #     my $next_player = 
       # }
    }

    sub command_check_pyramid_play($self, $game, $params) {
        my $player = $game->find_player(sub { $_->signature eq $params->{'signature'} });
        my $other_player = $game->find_player(sub { $_->signature ne $params->{'signature'} });

        my $pyramid_row_index = $params->{'pyramidLocation'}{'rowIndex'};
        my $pyramid_card_index = $params->{'pyramidLocation'}{'cardIndex'};

    }


    sub parse_message($self, $message) {
        my $hash = from_json($message);

        return ($hash->{'command'}, $hash->{'params'});
    }

    sub send($self, $command, %message) {
        my $to_send = \%message;
        $to_send->{'command'} = $command;

        $self->tx->send({ json => $to_send });
    }

}

1;
