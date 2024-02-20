
let currentTimeoutId = undefined;
let isEnabled = false;
let controller = undefined;
let messagePorts = new Set();

const { Client } = require("@xhayper/discord-rpc")

let client;

function initializeDiscord(clientId, clientSecret) {

  // const clientId = "1209211597017452594"; // <-- kkerti demo client id
  // const clientSecret = "dD9P92Hcj_9TgrPdChi700fXRIrvho15" // <-- kkerti demo secret
  const redirect_uri = ""

  const scopes = ["rpc", "rpc.voice.read", "rpc.voice.write"];

  client = new Client({
    clientId,
    clientSecret,
    redirect_uri
  });

  client.login({ scopes })
    .then(async () => {
      const settings = await client.user.getVoiceSettings()
      messagePorts.forEach((port) => {
        port.postMessage({
          type: "init",
          message: { mic: settings.input.volume, out: settings.output.volume },
        })
        port.postMessage({
          type: "echo",
          message: "Discord connected",
        })
      }

      );
    })
    .catch((error) => {
      messagePorts.forEach((port) => {
        port.postMessage({
          type: "echo",
          message: "Discord connection failed" + error,
        })
      }
      );
    });

}

exports.loadPackage = async function (
  gridController,
  persistedData
) {
  controller = gridController;
  isEnabled = true;
  runLoop();
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
  if (data.type === "auth_discord") {
    initializeDiscord(data.clientId, data.clientSecret);
  }
  if (data.type === "mic_volume") {
    let vol = Number(data.volume)
    // vol must be between 0 and 100
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    client.user.setVoiceSettings({ input: { volume: vol } }).catch(console.info);
  }
  if (data.type === "out_volume") {
    let vol = Number(data.volume)
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    // vol must be between 0 and 100
    client.user.setVoiceSettings({ output: { volume: vol } }).catch(console.info);
  }
}

async function runLoop() {
  if (!isEnabled) return;

  messagePorts.forEach((port) =>
  // port.postMessage({
  //   type: "echo",
  //   message: "Loop message",
  // })
  { }
  );
  currentTimeoutId = setTimeout(runLoop, 2000);
}

function cancelLoop() {
  isEnabled = false;
  clearTimeout(currentTimeoutId);
}