let localStream;
let pc;
const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const localSDP = document.getElementById('localSDP');
const remoteSDP = document.getElementById('remoteSDP');

const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function initLocalStream() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudio.srcObject = localStream;
}

function createPeerConnection() {
    pc = new RTCPeerConnection(servers);

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.ontrack = event => {
        remoteAudio.srcObject = event.streams[0];
    };

    pc.onicecandidate = event => {
        if (event.candidate) {
            // ICE candidates automatically included in SDP for simplicity
            console.log('New ICE candidate:', event.candidate);
        }
    };
}

// Start Call (Create Offer)
document.getElementById('startCall').onclick = async () => {
    await initLocalStream();
    createPeerConnection();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    localSDP.value = JSON.stringify(pc.localDescription);
};

// Answer Call
document.getElementById('answerCall').onclick = async () => {
    await initLocalStream();
    createPeerConnection();
};

// Set Remote SDP (Paste Offer/Answer)
document.getElementById('setRemoteSDP').onclick = async () => {
    const sdp = JSON.parse(remoteSDP.value);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    if (sdp.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        localSDP.value = JSON.stringify(pc.localDescription);
    }
};
