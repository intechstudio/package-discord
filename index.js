let isEnabled = false;
let controller = undefined;
let messagePorts = new Set();
let fs = require("fs");
let path = require("path");

const { Client } = require("@xhayper/discord-rpc");

let client;
let clientId;
let clientSecret;

function initializeDiscord(
  newClientId,
  newClientSecret,
  refreshToken = undefined,
) {
  const redirect_uri = "";

  const scopes = ["rpc", "rpc.voice.read", "rpc.voice.write"];

  clientId = newClientId;
  clientSecret = newClientSecret;

  client = new Client({
    clientId,
    clientSecret,
    redirect_uri,
  });

  client
    .login({ scopes, refreshToken })
    .then(async () => {
      controller?.sendMessageToEditor({
        type: "persist-data",
        data: {
          "client-id": clientId,
          "client-secret": clientSecret,
          "refresh-token": client.user.client.refreshToken,
        },
      });
      client.on("VOICE_SETTINGS_UPDATE", handleVoiceSettingsChange);
      client.subscribe("VOICE_SETTINGS_UPDATE");
      const settings = await client.user.getVoiceSettings();
      handleVoiceSettingsChange(settings);
      messagePorts.forEach((port) => {
        port.postMessage({
          type: "echo",
          message: "Discord connected",
        });
      });
    })
    .catch((error) => {
      messagePorts.forEach((port) => {
        port.postMessage({
          type: "echo",
          message: "Discord connection failed" + error,
        });
      });
    });
}

function handleVoiceSettingsChange(args) {
  controller.sendMessageToEditor({
    type: "execute-lua-script",
    script: `<?lua --[[@g]] discord_mute,discord_deaf=${args.mute ? "1" : "0"},${args.deaf ? "1" : "0"} ?>`,
  });
}

exports.loadPackage = async function (gridController, persistedData) {
  controller = gridController;
  clientId = persistedData?.["client-id"];
  clientSecret = persistedData?.["client-secret"];
  let token = persistedData?.["refresh-token"];
  if (token) {
    initializeDiscord(clientId, clientSecret, token);
  }

  let discordIconSvg = fs.readFileSync(
    path.resolve(__dirname, "discord-mark-white.svg"),
    { encoding: "utf-8" },
  );

  controller.sendMessageToEditor({
    type: "add-action",
    info: {
      actionId: 0,
      short: "xdiscvc",
      displayName: "Volume Control",
      rendering: "standard",
      category: "discord",
      blockTitle: "Volume Control",
      defaultLua: 'gps("package-discord", "input", val)',
      color: "#5865F2",
      icon: discordIconSvg,
      blockIcon: discordIconSvg,
      selectable: true,
      movable: true,
      hideIcon: false,
      type: "single",
      toggleable: true,
      actionComponent: "volume-control-action",
    },
  });

  controller.sendMessageToEditor({
    type: "add-action",
    info: {
      actionId: 1,
      short: "xdiscvs",
      displayName: "Voice Set",
      rendering: "standard",
      category: "discord",
      blockTitle: "Voice Set",
      defaultLua: 'gps("package-discord", "mute-set", val)',
      color: "#5865F2",
      icon: discordIconSvg,
      blockIcon: discordIconSvg,
      selectable: true,
      movable: true,
      hideIcon: false,
      type: "single",
      toggleable: true,
      actionComponent: "voice-set-action",
    },
  });

  controller.sendMessageToEditor({
    type: "add-action",
    info: {
      actionId: 2,
      short: "xdiscsc",
      displayName: "Channel Select",
      rendering: "standard",
      category: "discord",
      blockTitle: "Channel Select",
      defaultLua: 'gps("package-discord", "select-channel", null, false)',
      color: "#5865F2",
      icon: discordIconSvg,
      blockIcon: discordIconSvg,
      selectable: true,
      movable: true,
      hideIcon: false,
      type: "single",
      toggleable: true,
      actionComponent: "select-voice-channel-action",
    },
  });

  isEnabled = true;
};

exports.unloadPackage = async function () {
  controller.sendMessageToEditor({
    type: "remove-action",
    actionId: 0,
  });
  controller.sendMessageToEditor({
    type: "remove-action",
    actionId: 1,
  });
  controller.sendMessageToEditor({
    type: "remove-action",
    actionId: 2,
  });
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
};

exports.addMessagePort = async function (port) {
  port.on("message", (e) => {
    onMessage(port, e.data);
  });

  messagePorts.add(port);
  if (clientId && clientSecret) {
    port.postMessage({
      type: "clientInit",
      message: {
        clientId,
        clientSecret,
      },
    });
  }
  port.on("close", () => {
    messagePorts.delete(port);
  });
  port.start();
};

exports.sendMessage = async function (args) {
  let type = args[0];
  if (type === "input") {
    let vol = Number(args[1]);
    let transformedVol = 0;
    if (vol < 0) {
      transformedVol = 0;
    } else if (vol >= 100) {
      transformedVol = 100;
    } else {
      transformedVol = Math.exp((vol - 19.966) / 17.369);
    }
    client.user
      .setVoiceSettings({ input: { volume: Math.min(transformedVol, 100) } })
      .catch(console.info);
  }
  if (type === "output") {
    let vol = Number(args[1]);
    let transformedVol = 0;
    if (vol < 0) {
      transformedVol = 0;
    } else if (vol >= 200) {
      transformedVol = 200;
    } else if (vol <= 100) {
      //Two different curves, switches at apprx. 100
      transformedVol = Math.exp((vol - 19.966) / 17.369);
    } else {
      transformedVol = Math.exp((vol + 565.99) / 144.63);
    }
    client.user
      .setVoiceSettings({ output: { volume: Math.min(transformedVol, 200) } })
      .catch(console.info);
  }
  if (type.includes("mute") || type.includes("deafen")) {
    let newValue = false;
    if (type.includes("toggle")) {
      let voiceSetting = await client.user
        .getVoiceSettings()
        .catch(console.info);
      if (type.includes("mute")) {
        newValue = !voiceSetting.mute;
      } else {
        newValue = !voiceSetting.deaf;
      }
    } else {
      newValue = Boolean(args[1]);
    }

    if (type.includes("mute")) {
      client.user.setVoiceSettings({ mute: newValue }).catch(console.info);
    } else {
      client.user.setVoiceSettings({ deaf: newValue }).catch(console.info);
    }
  }
  if (type === "select-channel") {
    let channelId = args[1];
    let force = Boolean(args[2]);
    client.user
      .selectVoiceChannel(channelId, undefined, force)
      .catch(console.info);
  }
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
    let vol = Number(data.volume);
    // vol must be between 0 and 100
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    client.user
      .setVoiceSettings({ input: { volume: vol } })
      .catch(console.info);
  }
  if (data.type === "out_volume") {
    let vol = Number(data.volume);
    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    // vol must be between 0 and 100
    client.user
      .setVoiceSettings({ output: { volume: vol } })
      .catch(console.info);
  }
}
