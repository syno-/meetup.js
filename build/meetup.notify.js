
/**
 *
 * Usage: 
 * First, request permission.
 *
 *     Meetup.notify.request();
 *
 * Next, callNotify.
 *
 *     var notify = Meetup.notify({
 *         title: '',
 *         body: '',
 *         tag: '',
 *         icon: ''
 *     }).click(function(evt) {
 *     }).display(function(evt) {
 *     }.show();
 *
 * Misc
 *     
 *     notify.cancel();
 *
 * TODO:
 *
 *     - onCacelled
 */
Meetup._notify = function() {
    var n = function(info) {
        this.notify = new Notification('TVConf', {
            tag: info.tag ? info.tag : 'Meetup',
            body: info.body ? info.body : 'Invited.',
            icon: info.icon ? info.icon : '', // TODO: require defualt icon.
        });
    };

    n.prototype.click = function(cb) {
        var self = this;
        this.notify.onclick = function() {
            notification.close();  window.open().close();  window.focus();
            if (cb) cb.apply(self, arguments);
        };
        return this;
    };
    n.prototype.display = function(cb) {
        var self = this;
        notification.ondisplay = function(){
            if (cb) cb.apply(self, arguments);
        };
        return this;
    };
    n.prototype.show = function() {
        this.notify.show();
    };
    n.prototype.cancel = function() {
        this.notify.cancel();
    };

    // pseudo static!
    n.request = function() {
        if (Notification && Notification.requestPermission) {
            Notification.requestPermission();

            return true;
        }
        // not supported on your browser.
        return false;
    };

    return n;
};


Meetup.notify = new Meetup._notify();
