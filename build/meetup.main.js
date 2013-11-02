

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
Meetup = (function() {
    var meetup = function(info) {
        this.notify = new Notification('TVConf', {
            tag: info.tag ? info.tag : 'Meetup',
            body: info.body ? info.body : 'Invited.',
            icon: info.icon ? info.icon : '', // TODO: require defualt icon.
        });
    };

    meetup.prototype.click = function(cb) {
        var self = this;
        this.notify.onclick = function() {
            notification.close();  window.open().close();  window.focus();
            if (cb) cb.apply(self, arguments);
        };
        return this;
    };
    meetup.prototype.display = function(cb) {
        var self = this;
        notification.ondisplay = function(){
            if (cb) cb.apply(self, arguments);
        };
        return this;
    };
    meetup.prototype.show = function() {
        this.notify.show();
    };
    meetup.prototype.cancel = function() {
        this.notify.cancel();
    };

    // pseudo static!
    meetup.request = function() {
        if (Notification && Notification.requestPermission) {
            Notification.requestPermission();

            return true;
        }
        // not supported on your browser.
        return false;
    };

    return meetup;
};
