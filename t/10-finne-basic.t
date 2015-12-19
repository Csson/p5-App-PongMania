use strict;
use warnings;
use Test::More;
use Mojo::Util 'dumper';

#use if $ENV{'AUTHOR_TESTING'}, 'Test::Warnings';

use App::GameMania::Game::Finne;
use JSON::MaybeXS 'decode_json';

my $game = App::GameMania::Game::Finne->new(game_code => 'asdfe');
$game->add_player(name => 'tester', transaction => bless({}));

is $game->count_players, 1, 'Correct number of players';
is decode_json($game->get_player(0)->to_json)->{'name'}, 'tester', 'Correct player name from json';

$game->add_player(name => 'another', transaction => bless {});
diag dumper decode_json($game->get_player(0)->to_json);

done_testing;
