use 5.20.0;
use strict;
use warnings;

package App::GameMania::Controller::Finne {

    use Mojo::Base 'Mojolicious::Controller';
    use Mojo::JSON qw/from_json/;

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
            $game->add_player(name => $player_name, transaction => $self->tx);
            my $player = $game->get_player(0);
            $player->send('chat', message => 'Waiting for other player', from => 'server');
        }
        elsif($game && $game->count_players == 1 && $game->find_player(sub { $_->name ne $player_name })) {
            $game->add_player(name => $player_name, transaction => $self->tx);

        }
        # lets play!
        if($game->count_players == 2) {
            my $first_player = $game->get_player(0);
            my $second_player = $game->get_player(1);
            $first_player->send('chat', message => 'You have been challenged by ' . $second_player->name, from => 'server');
            $second_player->send('chat', message => 'You have challenged ' . $first_player->name, from => 'server');

            for my $player ($game->all_players) {
                $player->send('init_game', player => $player->to_json);
            }
        }
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
