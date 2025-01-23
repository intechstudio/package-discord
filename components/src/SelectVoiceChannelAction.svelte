<svelte:options customElement={{tag: 'select-voice-channel-action', shadow: 'none'}} />
<script>
  import { MeltCombo, MeltCheckbox } from "@intechstudio/grid-uikit";
  import { onMount } from "svelte";
  let channelId = "";
  let forceSelect = false;
  let currentCodeValue = "";
  let ref;
  
  let isConfigured = false;
  let channelSuggestion = [];
  
  // @ts-ignore
  const messagePort = createPackageMessagePort("package-discord", "voice-channel-action");

  function handleConfigUpdate(config) {
    const regex =
        /^gps\("package-discord", "select-channel", "*(.*?)"*, (.*?)\)$/;
    if (currentCodeValue != config.script){
      currentCodeValue = config.script;
      const match = config.script.match(regex);
      if (match) {
        channelId = match[1] ?? "null";
        forceSelect = match[2];
        isConfigured = true;
      }
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
    messagePort.onmessage = (e) => {
      const data = e.data;
      if (data.type === "channel-id") {
        channelId = data.channelId ?? "null";
      }
      if (data.type === "channel-name") {
        if (data.channelName && data.channelId == channelId){
          channelSuggestion = [
            {info: data.channelName, value: data.channelId},
          ]
        }
      }
    };
    messagePort.start();
  });

  $: forceSelect, channelId !== "-1" && isConfigured && function() {
    var code = `gps("package-discord", "select-channel", ${channelId == "null" ? null : `"${channelId}"`}, ${forceSelect})`;
    if (currentCodeValue != code){
      currentCodeValue = code;    
      const event = new CustomEvent("updateCode", {
        bubbles: true,
        detail: { script: String(code) },
      });
      if (ref){
        ref.dispatchEvent(event);
      }
    }
  }()

  $: channelId === "-1" && function(){
    messagePort.postMessage({
      type: "request-voice-channel-id"
    });
  }()

  $: (channelId ?? "").length > 5 && function(){
    channelSuggestion = [];
    messagePort.postMessage({
      type: "request-voice-channel-name",
      channelId,
    });
  }()
</script>

<select-voice-channel 
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
  <div class="w-full flex">
    <div class="grow">
      <MeltCombo
        bind:value={channelId}
        title="Channel ID"
        suggestions={[
          {info: "Leave channel", value : "null"},
          {info: "Get current channel", value : "-1"},
          ...channelSuggestion,
        ]} />
    </div>
    <div class="pl-2">
      <MeltCheckbox
        bind:target={forceSelect}
        title="Force"
        />
    </div>
  </div>
</select-voice-channel>