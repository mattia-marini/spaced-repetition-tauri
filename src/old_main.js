const { invoke } = window.__TAURI__.core;
const { getCurrentWebviewWindow } = window.__TAURI__.webviewWindow;
const { getCurrentWebview } = window.__TAURI__.webview;
const { getCurrentWindow } = window.__TAURI__.window;

console.log(window.__TAURI__)
let greetInputEl;
let greetMsgEl;
let dropzone;
let inDropzone = false;

let webviewWindow = getCurrentWebviewWindow();
let webview = getCurrentWebview();
let tauriWindow = getCurrentWindow();

const appWindow = getCurrentWindow();
let factor;
// console.log(factor)

function isCoordinateInBoundsOfElement(x, y, element) {
  // Get the bounding rectangle of the element
  const rect = element.getBoundingClientRect();

  // Check if the coordinates are within the bounds
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

async function setupDragDrop() {
  const unlisten = await webviewWindow.onDragDropEvent(async (event) => {

    // console.log(`Phisical: ${event.payload.position.y} Logical: ${event.payload.position.toLogical(factor).y} `);


    let tabBarHeight = innerTopLeft.y - outerTopLeft.y

    // console.log(`${event.payload.position.y} ${boundingClient.y + tabBarHeight}`)



    // if (event.payload.type === 'over' && inDropzone) {
    //   dropzone.classList.add("dragover");
    // }
    // else {
    //   dropzone.classList.remove("dragover");
    // }
    // console.log(event.payload);
    // console.log(dropzone)
    // console.log(dropzone.getBoundingClientRect())
    // console.log(event)
    // let boundingClientRect = dropzone.getBoundingClientRect()
    // console.log(event.payload.position.toLogical(factor));
    // console.log(`${event.payload.position.x}, ${boundingClientRect.x}`);

    // if (event.payload.type === 'over' &&
    //   isCoordinateInBounds(event.payload.position.x, event.payload.position.y, dropzone)) {
    //   // dropzone.style.border = "5px dashed gray";
    //   dropzone.classList.add("dragover");
    //   console.log("in")
    // }
    // else {
    //
    //   // dropzone.style.border = "1px dashed gray";
    //   console.log("out")
    //   dropzone.classList.remove("dragover");
    // }

    // if (event.payload.position)
    // if (event.payload.type === 'over') {
    //
    //   console.log('User hovering', event.payload.position);
    // } else if (event.payload.type === 'drop') {
    //   console.log('User dropped', event.payload.paths);
    // } else {
    //   console.log('File drop cancelled');
    // }
  });
}

// you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
// unlisten();


async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}


async function pickFolder() {
  const selected = await open({
    directory: true,
    multiple: false,
  });

  if (selected) {
    console.log("Folder path:", selected);
  } else {
    console.log("No folder selected");
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  dropzone = document.querySelector("#dropzone");

  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  document.querySelector("#print-bounding-client").addEventListener("click", async (e) => {
    e.preventDefault();
    // console.log(dropzone.getBoundingClientRect())
    // console.log(await webviewWindow.innerPosition())

    let boundingClient = dropzone.getBoundingClientRect()

    // let innerWebWindowPosition = await webviewWindow.innerPosition()
    // let outerWebWindowPosition = await webviewWindow.outerPosition()
    // let innerWindowPosition = await tauriWindow.innerPosition()
    // let outerWindowPosition = await tauriWindow.outerPosition()
    //
    // let windowPosition = await webviewWindow.position()

    //     console.log(`innerTopLeftWebWindow: ${outerTopLeftWebWindow.y}\n 
    // outerTopLeftWebWindow: ${innerTopLeftWebWindow.y}\n
    // innerTopLeft: ${innerTopLeft.y}\n
    // outerTopLeft: ${outerTopLeft.y}\n
    // `)
    //
    let outerSize = await webviewWindow.outerSize()
    let innerSize = await webviewWindow.size()
    console.log(
      await webviewWindow.innerSize(),
      await webviewWindow.outerSize(),

      // await webview.size(),
      // await webview.outerSize(),

      await tauriWindow.innerSize(),
      await tauriWindow.outerSize(),
    )
    // console.log(`outerSize: ${outerSize}\n innerSize: ${innerSize}`)
    // console.log(outerSize, innerSize)
    //   console.log(innerWebWindowPosition,
    //     outerWebWindowPosition,
    //     innerWindowPosition,
    //     outerWindowPosition,
    //     windowPosition)
    //
  })

  dropzone.addEventListener('mouseover', () => {
    console.log('Mouse is over the element');
  });

  dropzone.addEventListener("mouseenter", () => {
    console.log('Mouse entered the element');
    inDropzone = true
  });

  dropzone.addEventListener("mouseleave", () => {
    console.log('Mouse left the element');
    inDropzone = false
  });


  await setupDragDrop()
  factor = await appWindow.scaleFactor();

});
