// ----------------------------
// Consts
// ----------------------------

var Queries = (function() {
    var queryStr = window.location.search;
    var result = {};
    if (queryStr.length <= 1) {
        return result; 
    }
    var queries = queryStr.substring(1, queryStr.length).split('&');
    for (var i=0; i<queries.length; i++) {
        var query = queries[i].split('=');
        var key = decodeURIComponent(query[0]);
        var value = (query.length === 1) ? null : decodeURIComponent(query[1]);
        result[key] = value;
    }
    return result;
})();
console.log(Queries);
var Settings = {
    isLocal: (function() {
        if (window.location.host.indexOf('192.168.') === 0) {
            return true;
        }
        return false;
    })(),
    OID: Queries.OID || null,
    RID: Queries.RID || null,
};
Settings.STUN_URL = Settings.isLocal ?
    'stun:stun.l.google.com:19302' :
    'stun:stun.synou.com';
Settings.SERVER_URL = Settings.isLocal ?
//    'http://192.168.31.6:8888' :
    'http://192.168.24.74:8888' :
    'http://stun2.synou.com:8888';
console.log('Settings', Settings);

$(function() {
    var startTime = Date.now(); // TEST
    
    // ----------------------------
    // Libs
    // ----------------------------

    var stateEl = $('#state').empty().text('通話サービスへ接続しています…。');

    var meetup = Meetup.create({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remoteVideos',
        // immediately ask for camera access. default false
        //autoRequestMedia: true,
        debug: true,
        //coreDebug: true,
        url: '192.168.31.8:8888' // debug server
        //peerConnectionContraints: {
        //    optional: [{
        //        DtlsSrtpKeyAgreement: true
        //    }, {
        //        RtpDataChannels: true
        //    }]
        //},
        //autoAdjustMic: false,
        //enableDataChannels: true,
    
        // adjustPeerVolume: true,
        // peerVolumeWhenSpeaking: 0.25
    }).login(Settings.OID, function(err) {
        if (err) {
            // ログイン失敗
            stateEl.text('ログインに失敗しました。企業IDが見つかりません。');
            return;
        }
        // ログイン成功

        // ルームIDがなければ、招待待ちを行う。
        if (!Settings.RID) {
            stateEl.text('ユーザを待っています…。');
            return;
        }

        stateEl.text('カメラとマイクの許可をしてください。');
        meetup.ready(function(err, sessionId) {
            if (err) {
                var msg = 'カメラとマイクへのアクセスが許可されていません。\n許可した後、リロードしてください。';
                stateEl.text(msg);
        
                console.log('deniedTime=', Date.now() - startTime);
                return;
            }
            console.log('ready, sessionId=', sessionId);
            //$('#alert-permit').remove();
            $('#waiting').remove();
            $('#meetup').show();
        
            // ready
            this.joinRoom(Settings.RID, function(err, roomDescription) {
                if (err) {
                    alert(err.message);
                    this.stopLocalVideo();
                    return;
                }
            }).on('speaking', function(event) {
                $('#localVideo').addClass('speaking');
            }).on('stoppedSpeaking', function(event) {
                $('#localVideo').removeClass('speaking');
            }).on('peerStreamAdded', function(peer) {
                Meetup.notify({
                    title: peer.id + 'が会議に参加しました。'
                }).show();
                refreshList(this.members);
            }).on('peerStreamRemoved', function(peer) {
                refreshList(this.members);
            });
        });
    });
    
    function refreshList(members) {
        var el = $('#list-presence').empty();
        for (var id in members) {
            var member = members[id];
    
            $('<li/>').text(member.peer.id).appendTo(el);
        }
    }

    // ----------------------------
    // DOM
    // ----------------------------
    // TODO: windowにエイリアス追加
    var webrtc = window.webrtc = meetup.get();

    $('#room-name').text('会議室 - (' + Settings.RID + ')');
    $('#permission-error').text();
    var notifyEl = $('#btn-notify');
    if (Meetup.notify.permission() === 'granted') {
        notifyEl.hide();
    } else if (Meetup.notify.permission() === 'denied') {
        notifyEl.attr('disabled', 'disabled');
    } else {
        notifyEl.click(function(evt) {
            console.log('request notify');
            Notification.requestPermission(function (status) {
                console.log('status', status);

                if (status === 'granted') {
                    // 通知が有効になりました。
                    notifyEl.hide();
                } else if (status === 'denied') {
                    notifyEl.attr('disabled', 'disabled');
                } else {
                    // default
                }
            });
        });
    }

    var isStopping = false;
    $('#localVideo').click(function(e) {
        start();
    });

    function start() {
        if (isStopping) {
            webrtc.startLocalMedia({
                video: true,
                audio: true,
            }, function (err, stream) {
                if (err) {
                    console.log('error!!', err);
                    webrtc.emit(err);
                } else {
                    webrtc.attachMediaStream(stream, webrtc.getLocalVideoContainer(), {
                        muted: true, mirror: true
                    });
                }
            });
        } else {
            webrtc.stopLocalVideo();
        }
    }

    $('#mute').click(function() {
        meetup.mute();
    });
    $('#unmute').click(function() {
        meetup.unmute();
    });
    $('#pause').click(function() {
        meetup.pause();
    });
    $('#resume').click(function() {
        meetup.resume();
    });
    $('#stopVideo').click(function() {
        meetup.stopLocalVideo();
    });
    $('#startVideo').click(function() {
        meetup.startLocalVideo();
    });
    $('#shareScreen').click(function() {
        meetup.shareScreen(function(event) {
            console.log('shareScreen', event);
        });
    });
    $('#stopScreenShare').click(function() {
        meetup.stopScreenShare();
    });
    
    $('#volume').change(function(evt) {
        console.log('volume', evt);
        var volume = $(this).val();
        webrtc.setVolumeForAll(volume);
    }).mouseup(function(evt) {
        console.log('mouseup', evt);
    });

});

