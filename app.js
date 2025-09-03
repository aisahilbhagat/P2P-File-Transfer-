let pc;
let localStream;

const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const localSDP = document.getElementById('localSDP');
const remoteSDP = document.getElementById('remoteSDP');
const localICE = document.getElementById('localICE');
const remoteICE = document.getElementById('remoteICE');

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
        if(event.candidate) {
            localICE.value += JSON.stringify(event.candidate) + '\n';
        }
    };
}

// Start Call (Offer)
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

// Set Remote SDP
document.getElementById('setRemoteSDP').onclick = async () => {
    const sdp = JSON.parse(remoteSDP.value);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    if(sdp.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        localSDP.value = JSON.stringify(pc.localDescription);
    }
};

// Add Remote ICE Candidates
document.getElementById('addRemoteICE').onclick = async () => {
    const candidates = remoteICE.value.trim().split('\n');
    for (let c of candidates) {
        if(c) await pc.addIceCandidate(JSON.parse(c));
    }
};
