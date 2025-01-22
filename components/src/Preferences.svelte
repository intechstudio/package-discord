<svelte:options customElement={{tag: 'discord-preference', shadow: 'none'}} />
<script>
    import { Block, BlockBody, BlockTitle, MoltenButton, MeltCombo, MoltenPushButton, MoltenInput } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";


  let clientId = "";
  let clientSecret = "";
  let clientStatus = "authorize";

  //Capitalize first letter
  $: clientStatusLabel = String(clientStatus).charAt(0).toUpperCase() + String(clientStatus).slice(1)
  $: clientStatusIconColor = {
    "authorize" : "#4f4f4f",
    "error" : "#fb2323",
    "connected" : "#00D248" 
  }[clientStatus]

  // @ts-ignore
  const messagePort = createPackageMessagePort("package-discord", "preference");

  function authorizeUser(){
    messagePort.postMessage({
      type: "auth_discord",
      clientId: clientId,
      clientSecret: clientSecret,
    });
  }

  onMount(() => {
    messagePort.onmessage = (e) => {
      const data = e.data;
      if (data.type === "clientInit") {
        clientId = data.message.clientId;
        clientSecret = data.message.clientSecret;
        clientStatus = data.message.clientStatus;
      }
    };
    messagePort.start();
    return () => {
      messagePort.close();
    }
  })
</script>

<main-app>
  <div class="px-4 bg-secondary rounded-lg">
    <Block>
      <BlockTitle>
        <div class="flex flex-row items-center">
          <div class="discord-container">
            <svg xmlns="http://www.w3.org/2000/svg" width=24 viewBox="0 0 127.14 96.36"><path fill="#ffffff" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
          </div>
          <p class="font-medium text-lg pl-2 grow">Discord</p>
          <div class="status-indicator" style="background-color: {clientStatusIconColor};" />
          <p class="text-gray-400">{clientStatusLabel}</p>
        </div>
      </BlockTitle>
      <BlockBody>
        <div class="flex flex-row w-full">
          <div class="flex flex-col w-1/2 p-4">
            <p>Create app</p>
            <ol class="text-white pt-2" style="list-style: decimal;">
              <li>
                <MoltenPushButton 
                  text={"Open Discord"}
                  click={() => window.open("https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications%3Fnew_application%3Dtrue")}
                />
              </li>
              <li class="pt-2">       
                <a
                target="_blank"
                class="pb-2 text-blue-500 hover:text-white"
                href="https://google.com"
                >Follow the guide to create an app</a>
              </li>
            </ol>
          </div>
          <div class="bg-primary" style="width: 2px" />
          <div class="flex flex-col w-1/2 p-4">
            <MeltCombo 
              bind:value={clientId}
              title="Client ID"
              placeholder="121422..."
              />
            <MeltCombo 
              bind:value={clientSecret}
              title="Client Secret"
              placeholder="Rvfon_H92..."
              />
            <MoltenPushButton 
              text={"Authorize"} 
              click={authorizeUser} />
          </div>
        </div>
      </BlockBody>
    </Block>
  </div>
</main-app>
<style>
  textarea {
    overflow-y: scroll;
    height: 100px;
    resize: none;
  }

  .discord-container {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #5865F2;
    border-radius: 4px;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 8px;
    margin: 8px;
  }
</style>