use 5.20.0;
use strict;
use warnings;

package App::GameMania {
    
    use Mojo::Base 'Mojolicious';
    use Mojo::Util 'steady_time';
    use Mojo::Base 'Mojolicious::Plugin';
    use File::ShareDir::Tarball 'dist_dir';
    use Path::Tiny;
    use Data::Dump::Streamer;
    use Safe::Isa;
    use App::GameMania::GameManager;
    use experimental qw/signatures postderef/;

    # VERSION
    # ABSTRACT: ..

    sub startup($self) {
        $self->setup_directories;
        $self->setup_helpers;
        $self->setup_hooks;
        $self->setup_routes;
    }

    sub setup_routes($self) {
        my $r = $self->routes;

        my $ws = $r->websocket('/finne/ws')->to('finne#ws')->name('finne_wss');
        $r->get('/')->to(cb => sub ($c) { $c->reply->static('index.html'); });


    }

    sub setup_helpers($self) {
        $self->secrets(['asgsdgdrgrstfasdfasf']);
        $self->defaults(layout => 'default');
        $self->plugin('UnicodeNormalize');
        $self->plugin('Config');
        $self->plugin(BootstrapHelpers => {
            icons => {
                class => 'glyphicon',
                formatter => 'glyphicon-%s',
            },
        });
        $self->helper(game_manager => sub {
            state $manager = App::GameMania::GameManager->new;
            return $manager;
        });
    }

    sub setup_hooks($self) {
        $self->hook(around_action => sub {
            my($next, $c, $action, $last) = @_;

            my $starttime = steady_time;
            $next->();
            $self->log->debug(sprintf 'Time to render <%s>: %f for %s using %s', $c->req->url, steady_time - $starttime, $c->tx->remote_address, $c->req->headers->user_agent);
        });
    }

    sub setup_directories($self) {

#        # add our template directory
#        if(path(qw/share templates/)->exists) {
#            $self->renderer->paths([path(qw/share templates/)->realpath]);
#        }
#        else {
#            my $template_dir = path(dist_dir('App-PongMania'))->child(qw/templates/);
#
#            if($template_dir->is_dir) {
#                $self->renderer->paths([$template_dir->realpath]);
#            }
#        }

        # add static directory
        if(path(qw/share public/)->exists) {
            $self->static->paths([path(qw/share public/)->realpath]);
        }
        else {
            my $public_dir = path(dist_dir('App-PongMania'))->child('public');

            if($public_dir->is_dir) {
                $self->static->paths([$public_dir->realpath]);
            }
        }

    }
}

1;



1;

__END__

=pod

=head1 SYNOPSIS

    use App::PongMania;

=head1 DESCRIPTION

App::PongMania is ...

=head1 SEE ALSO

=cut
