<svelte:options customElement={{tag: 'volume-control-action', shadow: 'none'}} />
<script>
  import { AtomicInput, AtomicSuggestions } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let targetType = "";
  let inputValue = "";
  let currentCodeValue = "";
  let ref;
  let suggestionElement;

  function handleConfigUpdate(config) {
    const regex = /^gps\("package-discord", "(input|output)", (.*?)\)$/;

    const match = config.script.match(regex);

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
        <div class="atomicInput" style="width: 40%;">
            <div class="text-gray-500 text-sm pb-1">Input type</div>
            <AtomicInput
                inputValue={targetType}
                suggestions={[{info: "Input", value : "input"},{info: "Output", value : "output"}]}
                suggestionTarget={suggestionElement}
                on:change={(e) => {
                    targetType = e.detail;
                }}/>
        </div>
        <div style="width: 60%;">
            <div class="text-gray-500 text-sm pb-1">Value</div>
            <AtomicInput
                inputValue={inputValue}
                suggestions={[]}
                suggestionTarget={suggestionElement}
                on:change={(e) => {
                    inputValue = e.detail;
                }}/>
        </div>
    </div>

    <AtomicSuggestions bind:component={suggestionElement} />
</volume-control>