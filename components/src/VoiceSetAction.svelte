<svelte:options customElement={{tag: 'voice-set-action', shadow: 'none'}} />
<script>
  import { MeltCombo } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let targetType = "";
  let inputValue = "";
  let currentCodeValue = "";
  let ref;
  
  let isConfigured = false;

  function handleConfigUpdate(config) {
    const regex = /^gps\("package-discord", "(mute-set|deafen-set|mute-toggle|deafen-toggle)",? ?(.*?)\)$/;

    const match = config.script.match(regex);

    if (currentCodeValue != config.script){
        currentCodeValue = config.script;
        targetType = match[1];
        inputValue = match[2];
        isConfigured = true;
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
  });

  $: targetType, inputValue, isConfigured && function() {
    let code = "";
    if (!targetType.includes("set")){
        code = `gps("package-discord", "${targetType}")`;
    } else {
        code = `gps("package-discord", "${targetType}", ${inputValue})`;
    } 
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
</script>

<voice-set
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
  <div class="w-full flex">
    <div style="width: 45%;">
      <MeltCombo
          bind:value={targetType}
          suggestions={[
              {info: "Set Mute", value : "mute-set"},
              {info: "Toggle Mute", value : "mute-toggle"},
              {info: "Set Deafen", value : "deafen-set"},
              {info: "Toggle Deafen", value : "deafen-toggle"},]}
          title="Target action" />
    </div>
    {#if targetType?.includes("set") ?? true}
      <div class="pl-2" style="width: 55%;">
        <MeltCombo
            bind:value={inputValue}
            title="Value" />
      </div>
    {/if}
  </div>
</voice-set>