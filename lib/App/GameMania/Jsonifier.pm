use 5.20.0;
use strict;
use warnings;

package App::GameMania::Jsonifier {
    use Moose::Role;
    use Safe::Isa;
    use JSON::MaybeXS qw/encode_json/;
    use experimental qw/postderef signatures/;

    requires 'json_attributes';

    sub to_json($self) {
    	my $hash = {};
    	foreach my $attribute ($self->json_attributes) {
    		my $value;
    		warn '>>>' . ref $self->$attribute;
    		warn '!>>' . $self->$attribute->$_does('App::GameMania::Jsonifier');
    		if($self->$attribute->$_does('Array')) {
    			my $all = "all_$attribute";
    			$value = [];
    			foreach my $thing ($self->$all) {
    				push @$value => $thing->to_json;
    			}
    		}
    		elsif($self->$attribute->$_does('App::GameMania::Jsonifier')) {
    			$value = $self->$attribute->to_json;
    		}
    		else {
    			$value = $self->$attribute;
    		}
    		$hash->{ $attribute } = $value;
    	}
    	return encode_json $hash;
    }
}

1;
