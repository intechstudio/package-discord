let isEnabled = false;
let controller = undefined;
let messagePorts = new Set();

const { Client } = require("@xhayper/discord-rpc")

let client;
let clientId;
let clientSecret;

function initializeDiscord(newClientId, newClientSecret, refreshToken = undefined) {
  const redirect_uri = ""

  const scopes = ["rpc", "rpc.voice.read", "rpc.voice.write"];

	clientId = newClientId;
	clientSecret = newClientSecret

  client = new Client({
    clientId,
    clientSecret,
    redirect_uri
  });
  
  client.login({ scopes, refreshToken })
    .then(async () => {
      controller?.sendMessageToRuntime({
        id: "persist-data",
        data: {
          "client-id" : clientId,
          "client-secret" : clientSecret,
          "refresh-token" : client.user.client.refreshToken,
        }
      })
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
      });
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
  clientId = persistedData?.["client-id"];
  clientSecret = persistedData?.["client-secret"];
  let token = persistedData?.["refresh-token"];
  if (token){
    initializeDiscord(clientId, clientSecret, token)
  }
  isEnabled = true;
};

exports.unloadPackage = async function () {
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
};

exports.addMessagePort = async function (port) {
  port.on("message", (e) => {
    onMessage(port, e.data);
  });

  messagePorts.add(port);
  if (clientId && clientSecret){
	  port.postMessage({
		  type: "clientInit",
		  message: {
			  clientId, clientSecret,
		  }
	  });
  }
  port.on("close", () => {
    messagePorts.delete(port);
  });
  port.start();
};

exports.sendMessage = async function (args) {
	let type = args[0];
	if (type === "input"){
		let vol = Number(args[1])
		// vol must be between 0 and 100
		if (vol > 100) vol = 100;
		if (vol < 0) vol = 0;
		client.user.setVoiceSettings({ input: { volume: vol } }).catch(console.info);
	}
	if (type === "output"){
		let vol = Number(args[1])
		// vol must be between 0 and 100
		if (vol > 100) vol = 100;
		if (vol < 0) vol = 0;
		client.user.setVoiceSettings({ output: { volume: vol } }).catch(console.info);
	}
}

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