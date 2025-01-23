<svelte:options customElement={{tag: 'volume-control-action', shadow: 'none'}} />
<script>
  import { MeltCombo } from "@intechstudio/grid-uikit";
  import { onMount } from "svelte";
  let targetType = "";
  let inputValue = "";
  let currentCodeValue = "";
  let isConfigured = false;
  let ref;

  function handleConfigUpdate(config) {
    const regex = /^gps\("package-discord", "(input|output)", (.*?)\)$/;

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
    var code = `gps("package-discord", "${targetType}", ${inputValue})`;
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

<volume-control 
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
  <div class="w-full flex">
    <div style="width: 40%;">
      <MeltCombo
        bind:value={targetType}
        title="Input type"
        suggestions={[{info: "Input", value : "input"},{info: "Output", value : "output"}]} />
    </div>
    <div class="pl-4" style="width: 60%;">
      <MeltCombo
        bind:value={inputValue}
        title="Value" />
    </div>
  </div>
</volume-control>