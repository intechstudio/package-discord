<svelte:options customElement={{tag: 'select-voice-channel-action', shadow: 'none'}} />
<script>
  import { AtomicInput, AtomicSuggestions } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let channelId = "";
  let forceSelect = false;
  let currentCodeValue = "";
  let ref;
  let suggestionElement;

  function handleConfigUpdate(config) {
    const regex =
        /^gps\("package-discord", "select-channel", "*(.*?)"*, (.*?)\)$/;
    if (currentCodeValue != config.script){
        currentCodeValue = config.script;
        const match = config.script.match(regex);
        if (match) {
            channelId = match[1] ?? "null";
            forceSelect = match[2];
        }
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
  });

  $: channelId, forceSelect, function() {
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
</script>

<select-voice-channel 
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
    <div class="w-full flex">
        <div class="atomicInput" style="width: 80%;">
            <div class="text-gray-500 text-sm pb-1">Channel ID</div>
            <AtomicInput
                inputValue={channelId}
                suggestions={[{info: "Leave channel", value : "null"}]}
                suggestionTarget={suggestionElement}
                on:change={(e) => {
                    channelId = e.detail;
                }}/>
        </div>
        <div style="width: 20%;">
            <div class="text-gray-500 text-sm pb-1">Force</div>
            <input type="checkbox" bind:checked={forceSelect}/>
        </div>
    </div>

    <AtomicSuggestions bind:component={suggestionElement} />
</select-voice-channel>