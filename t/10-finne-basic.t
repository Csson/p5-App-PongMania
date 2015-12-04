use strict;
use warnings;
use Test::More;

use if $ENV{'AUTHOR_TESTING'}, 'Test::Warnings';

use App::GameMania::Game::Finne;

my $game = App::GameMania::Game::Finne->new(game_code => 'asdfe');
$game->add_player(name => 'tester', bless {});

is $game->count_players, 1, 'Correct number of players';

done_testing;
