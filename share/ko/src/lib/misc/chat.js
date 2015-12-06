import ko from 'knockout';

// https://coderwall.com/p/weiq1q/auto-scrolling-extender-for-knockout-js
ko.extenders.scrollFollow = function (target, selector) {
    target.subscribe(function (newval) {
        var el = document.querySelector(selector);

        if (el.scrollTop == el.scrollHeight - el.clientHeight) {
            setTimeout(function () { el.scrollTop = el.scrollHeight - el.clientHeight; }, 0);
        }
    });

    return target;
};

export class Chat {
    constructor(params) {

        if(params.scrollFollow) {
            this.chatMessages = ko.observableArray([]).extend({ scrollFollow: params.scrollFollow });
        }
        else {
            this.chatMessages = ko.observableArray([]);
        }
    }

    put(params) {
        var from = params.from || 'self';
        var status = from === 'server' ? params.status ? params.status : 'info' : 'normal';
        var message = params.text;
        this.chatMessages.push({
            className: 'chat-status-' + from + '-' + status,
            message: '· ' + message,
        });
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Chat };
