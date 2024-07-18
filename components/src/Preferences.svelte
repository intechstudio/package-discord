<svelte:options customElement={{tag: 'discord-preference', shadow: 'none'}} />
<script>
    import { Block, BlockBody, BlockRow, BlockTitle, MoltenButton, MoltenInput } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";


  let clientId = "";
  let clientSecret = "";
  let messageConsole = "";

  // @ts-ignore
  const messagePort = createPackageMessagePort("package-discord");

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
      }
      if (data.type === "echo") {
        messageConsole += data.message + "\r\n";
      }
    };
    messagePort.start();
    return () => {
      messagePort.close();
    }
  })
</script>

<main-app>
  <div class="px-4">
    <Block>
      <BlockTitle> Discord Control Demo </BlockTitle>
      <a
        target="_blank"
        class="pb-2 text-blue-500 hover:text-white"
        href="https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications%3Fnew_application%3Dtrue"
        >Create app</a
      >
      <BlockBody>Client ID</BlockBody>
      <MoltenInput bind:target="{clientId}" />
      <BlockBody>Client Secret</BlockBody>
      <MoltenInput bind:target="{clientSecret}" />
      <div class="pt-2" />
      <MoltenButton title={"Authorize"} click={authorizeUser} />
      <textarea
        placeholder="logs..."
        class="my-2 text-white outline-none p-1 bg-primary w-full"
        id="package_console"
        bind:value={messageConsole} />
    </Block>
  </div>
</main-app>
<style>
  textarea {
    overflow-y: scroll;
    height: 100px;
    resize: none;
  }
</style>