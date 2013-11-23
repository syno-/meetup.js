
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
    var debug = false;
    var callbacks = [];

    function log() {
        if (debug) {
            var args = [];
            args.push('meetup.js : ');
            for (var i=0; i<arguments.length; i++) {
                args.push(arguments[i]);
            }
            console.log.apply(console, args);
        }
    }

    function createError(message) {
        var err = {
            message: message
        };

        return err;
    }

	function fire(name, thisObj, args) {
        callbacks.forEach(function(o) {
            if (o.name === name) {
                o.func.apply(thisObj, args);
            }
        });
    }

    var meetup = function(config) {
        // Init
        var isLocal = (function() {
            if (window.location.host.indexOf('192.168.') === 0 ||
               window.location.host.indexOf('localhost') === 0) {
                return true;
            }
            return false;
        })();
        var STUN_URL = isLocal ?
            'stun:stun.l.google.com:19302' :
            'stun:stun.synou.com';
        var SERVER_URL = 'http://stun2.synou.com:8888';
        SERVER_URL = isLocal ?
            // 'http://192.168.31.6:8888' :
            (config.url || SERVER_URL) :
            SERVER_URL;
        this.readyCallback = null;
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


        // Configuration
        debug = this.debug = !!config.debug;
        config.peerConnectionConfig = {
            iceServers: [{
                "url": STUN_URL,
            }]
        };
        config.url = SERVER_URL;
        if (typeof config.detectSpeakingEvents === 'undefined') {
            config.detectSpeakingEvents = true;
        }
        config.debug = !!config.coreDebug || false;

        this.webrtc = new SimpleWebRTC(config);

        var self = this;

        //this.webrtc.on('videoAdded', function(videoEl, peer) {
        //    console.log('videoAdded', videoEl, peer, 'id=', peer.id);
        //    var member = getMember(peer.id);
        //    member.videoEl = videoEl;
        //    member.peer = peer;
        //});
        this.webrtc.on('peerStreamAdded', function(peer) {
            log('peerStreamAdded', peer);
            self.members.push({
                peer: peer
            });

            fire('peerStreamAdded', self, arguments);
            if (self.addedPeerCallback) self.addedPeerCallback.apply(self, arguments);
        });
        this.webrtc.on('peerStreamRemoved', function(peer) {
            log('peerStreamRemoved', peer);

            self.members = self.members.filter(function(v) {
                return v.peer.id != peer.id;
            });

            fire('peerStreamRemoved', self, arguments);
            if (self.removedPeerCallback) self.removedPeerCallback.apply(self, arguments);
        });
        this.webrtc.on('speaking', function (idObj) {
            log('speaking', idObj);
            fire('speaking', self, arguments);
        });
        this.webrtc.on('stoppedSpeaking', function (idObj) {
            log('stoppedSpeaking', idObj);
            fire('stoppedSpeaking', self, arguments);
        });
        
        this.webrtc.on('localStream', function(evt) {
            log('localStream', evt);
        });

        this.webrtc.on('*', function (event) {
            if (event.name === 'PermissionDeniedError' || // for Chrome >=33
                event.name === 'PERMISSION_DENIED' // for Chrome <=30
               ) {
                log('ready', event.name);
                if (self.readyCallback) self.readyCallback.call(this, createError('Permission Denied.'), event);
            } else if (
                event.name === 'NavigatorUserMediaError' ||
                event.name === 'NOT_SUPPORTED_ERROR'
               ) {
                log('TODO: ', event.name);
                   // TODO: Not supported on this browser.
            }
        });

        var con = this.getConnection();
        con.socket.addListener('error', function(evt) {
            log('socketError', evt, this);
            fire('socketError', this, arguments);
        });
    };

    // ----------------------------
    // Get objects
    // ----------------------------

    meetup.prototype.get = function() {
        return this.webrtc;
    };

    /**
     * get Socket.IO Object.
     */
    meetup.prototype.getConnection = function() {
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
        // TODO: ここでconnectionReadyすると、遅延でloginした時危険？
        this.webrtc.on('connectionReady', function (sessionId) {
            log('connectionReady', sessionId);
            self.myself.sessionId = sessionId;

            // TODO: ここでサービスへRIDを送ってログインする。
            setTimeout(function() {
                // TODO: RIDが無いとか不正なRIDでしたみたいな場合はエラーオブジェクトを返します
                var err = null;
                if (!oid) {
                    // RIDないぜ
                    err = createError('OrganizationId is empty.');
                }
                log('login, err=', err);
                if (cb) cb(err);
            }, 500);
        });

        return this;
    };

    // we have to wait until it's ready
    meetup.prototype.ready = function(cb) {
        this.readyCallback = cb;
        this.startLocalVideo();
        var self = this;
        this.webrtc.on('readyToCall', function (event) {
            log('ready, noerror');
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
            log('joinRoom', err, roomDescription);
            if (cb) cb.call(self, err, roomDescription);
        });
        return this;
    };

    meetup.prototype.leaveRoom = function(cb) {
        var self = this;
        this.webrtc.on('leftRoom', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.leaveRoom();
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
            if (cb) cb.call(self, event);
        });
        this.webrtc.unmute();
        return this;
    };

    meetup.prototype.pause = function(cb) {
        var self = this;
        this.webrtc.on('videoOff', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.pause();
        return this;
    };

    meetup.prototype.resume = function(cb) {
        var self = this;
        this.webrtc.on('videoOn', function (event) {
            if (cb) cb.call(self, event);
        });
        this.webrtc.resume();
        return this;
    };

    meetup.prototype.stopLocalVideo = function(cb) {
        var self = this;
        this.webrtc.on('localStreamStopped', function (event) {
            if (cb) cb.call(self, event);
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

    meetup.prototype.shareScreen = function(cb) {
        var self = this;
        this.webrtc.shareScreen(function() {
            if (cb) cb.apply(self, arguments);
        });
        return this;
    };

    meetup.prototype.stopScreenShare = function(cb) {
        this.webrtc.stopScreenShare();
        return this;
    };

    // ----------------------------
    // Events
    // ----------------------------

    /**
     * regist event
     * 
     * - socketError
     * - speaking
     * - stoppedSpeaking
     * - peerStreamAdded
     * - peerStreamRemoved
     */
    meetup.prototype.on = function(name, func) {
        if (name && func) {
            callbacks.push({
                name: name,
                func: func,
            });
        } else {
            log('event name or func is empty.', name, func);
        }
        return this;
    };

    /**
     * delete event
     */
    meetup.prototype.off = function(funcOrName) {
        log('off', funcOrName);
		if (typeof funcOrName === 'string') {
			var name = funcOrName;
			callbacks = callbacks.filter(function(a, b) {
				return a.name !== name;
			});
		} else {
			var func = funcOrName;
			callbacks = callbacks.filter(function(a, b) {
				return a.func !== func;
			});
		}
        return this;
    };

    /**
     * @deprecated Use #on instead.
     */
    meetup.prototype.speaking = function(cb) {
        var self = this;
        this.webrtc.on('speaking', function (event) {
            if (cb) cb.call(self, event);
        });
        return this;
    };

    /**
     * @deprecated Use #on instead.
     */
    meetup.prototype.stoppedSpeaking = function(cb) {
        var self = this;
        this.webrtc.on('stoppedSpeaking', function (event) {
            if (cb) cb.call(self, event);
        });
        return this;
    };

    /**
     * @deprecated Use #on instead.
     */
    meetup.prototype.addedPeer = function(cb) {
        this.addedPeerCallback = cb;
        return this;
    };

    /**
     * @deprecated Use #on instead.
     */
    meetup.prototype.removedPeer = function(cb) {
        this.removedPeerCallback = cb;
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
