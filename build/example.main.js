





// ----------------------------
// Libs
// ----------------------------
var roomName = 'esperia'; // TODO
var webrtc = new SimpleWebRTC({
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
    //    url: 'http://signaling.simplewebrtc.com:8888',
    //    enableDataChannels: true,
    //    autoRemoveVideos: true,
    //    adjustPeerVolume: true,
    //    peerVolumeWhenSpeaking: 0.25
});

webrtc.on('connectionReady', function (event) {
    console.log('connectionReady', event);
});

// we have to wait until it's ready
webrtc.on('readyToCall', function (event) {
    console.log('event', event);
    $('#alert-permit').remove();
    webrtc.joinRoom(roomName, function(err, roomDescription) {
        console.log('joinRoom', err);
    });
});

// ----------------------------
// DOM
// ----------------------------

$(function() {
    webrtc.on('*', function (event) {
        if (event.name === 'PermissionDeniedError') {
            var msg = 'カメラとマイクへのアクセスが許可されていません。<br/>許可した後、リロードしてください。';
            $('#alert-permit').empty().append($('<p/>').html(msg));
        }
    });
    $('#room-name').text(roomName);

    var userApi = {
        users: [{
            id: 0,
            name: 'むおおおお',
            presence: {
                type: 0,
                message: '',
            },
        }, {
            id: 0,
            name: 'えすぺりあ',
            presence: {
                type: 0,
                message: '',
            },
        }]
    };
    $('#list-presence').click(function(e) {
        var ulEl = $(this).empty();

        $.each(userApi.users, function(i, o) {
            $('<li/>').text(o.name).appendTo(ulEl);
        });
    });

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
        webrtc.mute();
    });
    $('#unmute').click(function() {
        webrtc.unmute();
    });
    $('#pause').click(function() {
        webrtc.pause();
    });
    $('#resume').click(function() {
        webrtc.resume();
    });
    $('#stopVideo').click(function() {
        webrtc.stopLocalVideo();
    });
    $('#startVideo').click(function() {
        webrtc.startLocalVideo();
    });
    $('#volume').change(function(evt) {
        console.log('volume', evt);
        var volume = $(this).val();
        webrtc.setVolumeForAll(volume);
    }).mouseup(function(evt) {
        console.log('mouseup', evt);
    });
    webrtc.on('videoAdded', function(evt) {
        console.log('videoAdded');
    });
    webrtc.on('localStream', function(evt) {
        console.log('localStream');
    });


/*

Events :

webrtc.leaveRoom();

webrtc.createRoom('RoomName', function() {
});


webrtc.stopScreenShare();
webrtc.getLocalScreen();
webrtc.shareScreen(function(err, stream) {
});
webrtc.getRemoteVideoContainer();
webrtc.setVolumeForAll(volume);
webrtc.setVolumeForAll(volume);

webrtc.removePeers(function(roomId, roomType) {
});

*/
});

