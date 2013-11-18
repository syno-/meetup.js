
/*
 *
 * TODO:
 *
 *   招待待ち
 */

/**
 *
 */
Meetup = (function() {
    var meetup = function(config) {
        this.deniedCallback = null;
        this.addedPeerCallback = null;
        this.removedPeerCallback = null;
        this.myself = {};
        /**
         * [{
         *  peer: <Peer>,
         *  dataChannel: <RTCDataChannel>,
         * }, ...]
         *
         */
        this.members = [];
        this.debug = !!config.debug;
        this.webrtc = new SimpleWebRTC(config);

        var self = this;

        //this.webrtc.on('videoAdded', function(videoEl, peer) {
        //    console.log('videoAdded', videoEl, peer, 'id=', peer.id);
        //    var member = getMember(peer.id);
        //    member.videoEl = videoEl;
        //    member.peer = peer;
        //});
        this.webrtc.on('peerStreamAdded', function(peer) {
            console.log('peerStreamAdded', peer);
            self.members.push({
                peer: peer
            });

            if (self.addedPeerCallback) self.addedPeerCallback.apply(self, arguments);
        });
        this.webrtc.on('peerStreamRemoved', function(peer) {
            console.log('peerStreamRemoved', peer);

            self.members = self.members.filter(function(v) {
                return v.peer.id != peer.id;
            });

            if (self.removedPeerCallback) self.removedPeerCallback.apply(self, arguments);
        });
        
        this.webrtc.on('localStream', function(evt) {
            console.log('localStream');
        });

        this.webrtc.on('*', function (event) {
            if (event.name === 'PermissionDeniedError' || // for Chrome >=33
                event.name === 'PERMISSION_DENIED' // for Chrome <=30
               ) {
                if (self.deniedCallback) self.deniedCallback(event);
            } else if (
                event.name === 'NavigatorUserMediaError' ||
                event.name === 'NOT_SUPPORTED_ERROR'
               ) {
                   // TODO: Not supported on this browser.
            }
        });
    };

    // ----------------------------
    // Get objects
    // ----------------------------

    meetup.prototype.get = function() {
        return this.webrtc;
    };

    meetup.prototype.getSocketIO = function() {
        return this.webrtc.connection;
    };

    meetup.prototype.my = function() {
        return this.myself;
    };

    // ----------------------------
    // Operation
    // ----------------------------

    meetup.prototype.login = function(oid, cb) {
        this.organizationId = oid;
        var self = this;
        this.webrtc.on('connectionReady', function (sessionId) {
            console.log('connectionReady', sessionId);
            self.myself.sessionId = sessionId;

            // TODO: ここでサービスへRIDを送ってログインする。
            setTimeout(function() {
                // TODO: RIDが無いとか不正なRIDでしたみたいな場合はエラーオブジェクトを返します
                var err = null;
                if (!oid) {
                    // RIDないぜ
                    err = {
                        message: 'OrganizationId is empty.'
                    };
                }
                if (self.debug) {
                    console.log('error', err);
                }
                if (cb) cb(err);
            }, 500);
        });

        return this;
    };

    function createError(message) {
        var err = {
            message: message
        };

        return err;
    }

    // we have to wait until it's ready
    meetup.prototype.ready = function(cb) {
        this.startLocalVideo();
        var self = this;
        this.webrtc.on('readyToCall', function (event) {
            // TODO: err is always null. (Not Implemented)
            if (cb) cb.call(self, null, event);
        });
        return this;
    };

    meetup.prototype.joinRoom = function(roomId, cb) {
        if (!roomId || typeof roomId !== 'string') {
            if (cb) cb.call(self, createError('roomId is MUST be not empty.'), null);
            return this;
        }
        var self = this;
        this.webrtc.joinRoom(roomId, function(err, roomDescription) {
            if (cb) cb.call(self, err, roomDescription);
        });
        return this;
    };

    meetup.prototype.mute = function(cb) {
        var self = this;
        this.webrtc.on('audioOff', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.mute();
        return this;
    };

    meetup.prototype.unmute = function(cb) {
        var self = this;
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
        // TODO: 接続完了(readyToCall)にフックする？
        if (cb) cb.call(this);
        return this;
    };

    // ----------------------------
    // Events
    // ----------------------------

    meetup.prototype.speaking = function(cb) {
        var self = this;
        this.webrtc.on('speaking', function (event) {
            if (cb) cb.call(self, event);
        });
        return this;
    };

    meetup.prototype.stoppedSpeaking = function(cb) {
        var self = this;
        this.webrtc.on('stoppedSpeaking', function (event) {
            if (cb) cb.call(self, event);
        });
        return this;
    };

    meetup.prototype.addedPeer = function(cb) {
        this.addedPeerCallback = cb;
        return this;
    };

    meetup.prototype.removedPeer = function(cb) {
        this.removedPeerCallback = cb;
        return this;
    };

    meetup.prototype.denied = function(cb) {
        this.deniedCallback = cb;
        return this;
    };

    // ----------------------------
    // master
    // ----------------------------

    var master = function() {
    };

    master.prototype.create = function(config) {
        return new meetup(config);
    };
    
    return new master();
})();
