
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
 *         body: 'Invited.',
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
Meetup.notify = (function() {
    var notifies = [];

    // Notification.permission for chrome
    if (window.Notification && !Notification.permission) {
        if (window.webkitNotifications) {
            var permit = window.webkitNotifications.checkPermission();
            var status;
            if (permit === 0) {
                status = 'granted';
            } else if (permit === 2) {
                status = 'denied';
            } else {
                // permit === 1 or not specified
                status = 'default';
            }
            Notification.permission = status;
        }
    }

    function show(self) {
        var nt = new Notification(self.title, self.info);
        nt.ondisplay = function() {
            if (!self.onDisplay) {
                setTimeout(function() {
                    nt.close();
                }, 5000);
            } else {
                self.onDisplay.apply(this, arguments);
            }
        };

        return nt;
    }

    // NotificationWrapper
    var n = function(title, info) {
        this.title = title;
        this.info = info;
    };
    n.prototype.click = function(cb) {
        this.onClick = cb;
        return this;
    };
    n.prototype.display = function(cb) {
        this.onDisplay = cb;
        return this;
    };
    n.prototype.show = function() {
        if (Notification.permission === 'granted') {
            this.notify = show(this);
        } else {
            var self = this;
            request(function(status) {
                if (status === 'granted') {
                    self.notify = show(self);
                }
            });
        }
    };
    n.prototype.cancel = function() {
        if (this.notify) {
            this.notify.cancel();
        }
    };
    n.prototype.tag = function() {
        if (this.notify) {
            return this.notify.tag;
        } else {
            return this.info.tag;
        }
    };

    function isSupported() {
        if (Notification) {
            return true;
        }
        // not supported on your browser.
        return false;
    }

    function request(cb) {
        if (isSupported()) {
            Notification.requestPermission(function(status) {
                if (Notification.permission !== status) {
                    Notification.permission = status;
                }

                if (cb) cb.apply(this, arguments);
            });
        } else {
            throw 'not supported on your browser.';
        }
    }

    var master = function(info) {
        if (typeof info === 'string') {
            info = {
                title: info
            };
        } else {
            info = info || {};
        }

        var title = (info.title) ? info.title : 'TVConf';
        info.tag = info.tag || 'Meetup';
        //info.icon = info.icon || '';
        var notify = notifies[info.tag]  = new n(title, info);

        return notify;
    };

    // pseudo statics

    master.permission = function() {
        return Notification.permission;
    };
    master.request = function(cb) {
        request(cb);
        return Notification.permission;
    };
    master.isSupported = function() {
        return isSupported();
    };
    master.get = function(tag) {
        return notified[tag];
    };

    return master;
})();

