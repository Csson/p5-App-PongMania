use 5.20.0;
use strict;
use warnings;

package App::GameMania::Jsonifier {
    use Moose::Role;
    use Safe::Isa;
    use experimental qw/postderef signatures/;

    requires 'json_attributes';

    sub to_json($self) {
        my $hash = {};
        for my $attr ($self->json_attributes) {
            my $this_value;

            if(ref $self->$attr eq 'ARRAY') {
                my $all = "all_$attr";
                $this_value = [];

                for my $thing ($self->$all) {
                    if($thing->$_can('to_json')) {
                        push @$this_value => $thing->to_json;
                    }
                    else {
                        push @$this_value => $thing;
                    }
                }
            }
            elsif($self->$attr->$_can('to_json')) {
                $this_value = $self->$attr->to_json;
            }
            else {
                $this_value = $self->$attr;
            }
            $hash->{ $attr } = $this_value;
        }
        return $hash;
    }

}

1;
