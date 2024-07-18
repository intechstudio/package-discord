<svelte:options customElement={{tag: 'voice-set-action', shadow: 'none'}} />
<script>
  import { AtomicInput, AtomicSuggestions } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let targetType = "";
  let inputValue = "";
  let currentCodeValue = "";
  let ref;
  let suggestionElement;

  function handleConfigUpdate(config) {
    const regex = /^gps\("package-discord", "(mute-set|deafen-set|mute-toggle|deafen-toggle)",? ?(.*?)\)$/;

    const match = config.script.match(regex);

    console.log(JSON.stringify(match));
    if (currentCodeValue != config.script){
        currentCodeValue = config.script;
        targetType = match[1];
        inputValue = match[2];
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
  });

  $: targetType, inputValue, function() {
    let code = "";
    if (!targetType.includes("set")){
        code = `gps("package-discord", "${targetType}")`;
    } else {
        code = `gps("package-discord", "${targetType}", ${inputValue})`;
    }
    console.log({currentCodeValue, code});    
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
        <div class="atomicInput" style="width: 50%;">
            <div class="text-gray-500 text-sm pb-1">Target action</div>
            <AtomicInput
                inputValue={targetType}
                suggestions={[
                    {info: "Set Mute", value : "mute-set"},
                    {info: "Toggle Mute", value : "mute-toggle"},
                    {info: "Set Deafen", value : "deafen-set"},
                    {info: "Toggle Deafen", value : "deafen-toggle"},]}
                suggestionTarget={suggestionElement}
                on:change={(e) => {
                    targetType = e.detail;
                }}/>
        </div>
        {#if targetType.includes("set")}
            <div style="width: 50%;">
                <div class="text-gray-500 text-sm pb-1">Value</div>
                <AtomicInput
                    inputValue={inputValue}
                    suggestions={[]}
                    suggestionTarget={suggestionElement}
                    on:change={(e) => {
                        inputValue = e.detail;
                    }}/>
            </div>
        {/if}
    </div>

    <AtomicSuggestions bind:component={suggestionElement} />
</voice-set>