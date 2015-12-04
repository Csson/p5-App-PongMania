use 5.20.0;
use strict;
use warnings;

package App::GameMania::Sender {
    use Moose::Role;
    use experimental qw/postderef signatures/;

    requires 'transaction';

    sub send($self, $command, %message) {
        my $to_send = \%message;
        $to_send->{'command'} = $command;
        $self->transaction->send({ json => $to_send });
    }
}

1;
