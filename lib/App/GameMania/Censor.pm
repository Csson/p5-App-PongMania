use 5.20.0;
use strict;
use warnings;

package App::GameMania::Censor {
    
    # VERSION
    # ABSTRACT: ..

    use Moose;
    use syntax 'junction' => { any => { -as => 'jany' } };
    use Types::Standard -types;
    use experimental qw/postderef signatures/;

    has back_color => (
        is => 'ro',
        isa => Str,
    );

    sub card_array($self, $card_array, $censor = [qw/private hidden/]) {
        return [map {
            if(jany(@$censor) eq $_->{'status'}) {
                $_->{'suit'} = 'back';
                $_->{'value'} = $self->back_color;
            }
            $_;
        } @$card_array];
    }
    sub array_of_card_arrays($self, $array_of_card_arrays, $censor = [qw/private hidden/]) {
        for my $outer_array (@$array_of_card_arrays) {
            for my $array (@$outer_array) {
                $array->{'cards'} = $self->card_array($array->{'cards'}, $censor);
            }
        }
        return $array_of_card_arrays;
    }
}

1;