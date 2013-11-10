

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
        this.deniedCallback = null;
        this.sessionIds = [];
        this.webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'localVideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remoteVideos',
            // immediately ask for camera access. default false
            autoRequestMedia: true,
            autoAdijustMic: true,
            debug: true,
            peerConnectionConfig: {
                iceServers: [{"url": "stun:stun.l.google.com:19302"}]
            },
            peerConnectionContraints: {
                optional: [
                    {DtlsSrtpKeyAgreement: true},
                    {RtpDataChannels: true}
                ]
            },
            autoAdjustMic: false,
            media: {
                audio: true,
                video: true
            },
            detectSpeakingEvents: true,
            enableDataChannels: true,

            url: 'http://192.168.31.6:8888'
            // url: 'http://signaling.simplewebrtc.com:8888',
            // enableDataChannels: true,
            // autoRemoveVideos: true,
            // adjustPeerVolume: true,
            // peerVolumeWhenSpeaking: 0.25
        });

        this.webrtc.on('connectionReady', function (event) {
            console.log('connectionReady', event);
        });

        var self = this;
        this.webrtc.on('*', function (event) {
            if (event.name === 'PermissionDeniedError') {
                if (self.deniedCallback) self.deniedCallback();
            }
        });

        this.webrtc.on('*', function (event) {
            if (event.name === 'PermissionDeniedError') {
                if (self.deniedCallback) self.deniedCallback();
            }
        });
    };

    meetup.prototype.get = function() {
        return this.webrtc;
    };

    // we have to wait until it's ready
    meetup.prototype.ready = function(cb) {
        this.webrtc.on('readyToCall', function (event) {
            if (cb) cb.call(this, event);
        });
        return this;
    };

    meetup.prototype.speaking = function(cb) {
        this.webrtc.on('speaking', function (event) {
            if (cb) cb.call(this, event);
        });
        return this;
    };

    meetup.prototype.stoppedSpeaking = function(cb) {
        this.webrtc.on('stoppedSpeaking', function (event) {
            if (cb) cb.call(this, event);
        });
        return this;
    };

    meetup.prototype.joinRoom = function(cb) {
        this.webrtc.joinRoom(roomName, function(err, roomDescription) {
            if (cb) cb.call(this, err, roomDescription);
        });
        return this;
    };

//    meetup.prototype.error = function(cb) {
//        return this;
//    };

    meetup.prototype.denied = function(cb) {
        this.deniedCallback = cb;
        return this;
    };

    // ----------------------------
    // basic events
    // ----------------------------

    meetup.prototype.mute = function(cb) {
        this.webrtc.on('audioOff', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.mute();
        return this;
    };

    meetup.prototype.unmute = function(cb) {
        this.webrtc.on('audioOn', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.unmute();
        return this;
    };

    meetup.prototype.pause = function(cb) {
        this.webrtc.on('videoOff', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.pause();
        return this;
    };

    meetup.prototype.resume = function(cb) {
        this.webrtc.on('videoOn', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.resume();
        return this;
    };

    meetup.prototype.stopLocalVideo = function(cb) {
        this.webrtc.on('localStreamStopped', function (event) {
            if (cb) cb.call(this, event);
        });
        this.webrtc.stopLocalVideo();
        return this;
    };

    meetup.prototype.startLocalVideo = function(cb) {
        this.webrtc.startLocalVideo();
        return this;
    };

//    meetup.prototype.click = function(cb) {
//        var self = this;
//        this.notify.onclick = function() {
//            notification.close();  window.open().close();  window.focus();
//            if (cb) cb.apply(self, arguments);
//        };
//        return this;
//    };
//
//    // pseudo static!
//    meetup.request = function() {
//        if (Notification && Notification.requestPermission) {
//            Notification.requestPermission();
//
//            return true;
//        }
//        // not supported on your browser.
//        return false;
//    };


    // ----------------------------
    // master
    // ----------------------------

    var master = function() {
    };

    master.prototype.create = function(info){
        return new meetup(info);
    };
    
    return new master();
})();
