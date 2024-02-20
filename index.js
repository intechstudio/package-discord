let currentTimeoutId = undefined;
let isEnabled = false;
let controller = undefined;
let messagePorts = new Set();

const DiscordRPC = require("discord-rpc");

const client = new DiscordRPC.Client({ transport: 'ipc' });

function initializeDiscord() {
  const clientId = "1209211597017452594";
  const clientSecret = "dD9P92Hcj_9TgrPdChi700fXRIrvho15"
  const redirectUri = "http://localhost:4000/discord-demo";

  DiscordRPC.register(clientId);

  const scopes = ["rpc", "rpc.voice.read", "rpc.voice.write"];

  client.login({ clientId, clientSecret, redirectUri, scopes }).catch(console.error);

}

exports.loadPackage = async function (
  gridController,
  persistedData
) {
  controller = gridController;
  isEnabled = true;
  runLoop();
  initializeDiscord();
};

exports.unloadPackage = async function () {
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
  cancelLoop();
};

exports.addMessagePort = async function (port) {
  port.on("message", (e) => {
    onMessage(port, e.data);
  });

  messagePorts.add(port);
  port.on("close", () => {
    messagePorts.delete(port);
  });
  port.start();
};

async function onMessage(port, data) {
  if (data.type === "request-echo") {
    port.postMessage({
      type: "echo",
      message: "Echo message",
    });
  }
  if (data.type === "mic_volume") {
    const vol = Number(data.volume) || 100;
    // vol must be between 0 and 100
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    client.setVoiceSettings({ input: { volume: vol } }).catch(console.info);
  }
  if (data.type === "out_volume") {
    const vol = Number(data.volume) || 100;
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    // vol must be between 0 and 100
    client.setVoiceSettings({ output: { volume: vol } }).catch(console.info);
  }
}

async function runLoop() {
  if (!isEnabled) return;

  messagePorts.forEach((port) =>
    port.postMessage({
      type: "echo",
      message: "Loop message",
    })
  );
  currentTimeoutId = setTimeout(runLoop, 2000);
}

function cancelLoop() {
  isEnabled = false;
  clearTimeout(currentTimeoutId);
}
