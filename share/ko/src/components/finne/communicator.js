import ko from 'knockout';

export class Communicator {
    constructor(params) {
        var wsUrl = $('#finne-page').attr('data-ws-url');
        this.chat = params.chat;
        this.endpoint = new WebSocket('ws://games.erikcarlsson.com/finne/ws');
        this.connectionOpen = ko.observable(false);
        this.handleIncoming = params.handleIncoming,
        this.endpoint.onopen = () => {
            this.chat.put({ from: 'server', text: 'Connection opened' });
            this.connectionOpen(true);
        }
        this.endpoint.onclose = () => {
            this.chat.put({ from: 'server', text: 'Connection closed', status: 'warning' });
            this.connectionOpen(false);
        };
        this.endpoint.onmessage = (e) => {
            var parsed = JSON.parse(e.data);
            console.log('ws/incoming', parsed);
            this.handleIncoming(parsed);
        }
    }

    send(message) {
        if(this.connectionOpen()) {
            if(!message.params.hasOwnProperty('game_code')) {
                message.params.game_code = this.gameCode;
            }
            console.log('ws/sending message', message);
            this.endpoint.send(JSON.stringify(message));
            return true;
        }
        else {
            console.log('ws/failed to send', message);
            return false;
        }
    }
    sendCommand(command, params = {}) {
        return this.send({ command: command, params: params });
    }
    joinGame(params) {
        var success = this.send({ command: 'join_game', params : params });
        if(success) {
            this.gameCode = params.game_code;
        }
        return success;
    }
    makePlay(params) {
        console.log('make play', params);
        this.sendCommand('make_play', params);
    }
    checkPyramidPlay(params) {
        console.log('check pyramid play', params);
        this.sendCommand('check_pyramid_play', params);
    }


    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Communicator };
