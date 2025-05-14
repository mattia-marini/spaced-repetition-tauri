const { invoke } = window.__TAURI__.core;
const { getCurrentWebviewWindow } = window.__TAURI__.webviewWindow;
const { getCurrentWebview } = window.__TAURI__.webview;
const { getCurrentWindow, cursorPosition } = window.__TAURI__.window;
const { LogicalSize } = window.__TAURI__.dpi;

let dropzone;
let inDropzone = false;

let webviewWindow = getCurrentWebviewWindow();
let webview = getCurrentWebview();
let tauriWindow = getCurrentWindow();

let scaleFactor;


async function isInClient(logicalPosition) {
  let outerSizePhysical = await tauriWindow.outerSize()
  let x = logicalPosition.x
  let y = logicalPosition.y

  return (
    x >= rect.left &&
    x <= rect.right &&
    (y - tabBarHeight) >= rect.top &&
    (y - tabBarHeight) <= rect.bottom
  );
}

async function isCoordinateInBoundsOfElement(logicalPosition, element) {
  // Get the bounding rectangle of the element
  const rect = element.getBoundingClientRect();
  const tabBarHeight = await getTabBarHeightLogical()
  // console.log(rect)

  let x = logicalPosition.x
  let y = logicalPosition.y

  // Check if the coordinates are within the bounds
  return (
    x >= rect.left &&
    x <= rect.right &&
    (y - tabBarHeight) >= rect.top &&
    (y - tabBarHeight) <= rect.bottom
  );
}

async function getTabBarHeightPhysical() {
  // console.log(await cursorPosition())
  let innerSizeLogical = new LogicalSize(window.innerWidth, window.innerHeight)
  let innerSizePhysical = innerSizeLogical.toPhysical(scaleFactor)

  let outerSizePhysical = await tauriWindow.outerSize()

  return outerSizePhysical.height - innerSizePhysical.height
}

async function getTabBarHeightLogical() {
  // console.log(await cursorPosition())
  let innerSizeLogical = new LogicalSize(window.innerWidth, window.innerHeight)
  let outerSizeLogical = (await tauriWindow.outerSize()).toLogical(scaleFactor)

  return outerSizeLogical.height - innerSizeLogical.height
}

async function setupDragDrop() {
  const unlisten = await webview.onDragDropEvent(async (event) => {
    if (event.payload.type == "over") {
      if (await isCoordinateInBoundsOfElement(event.payload.position, dropzone))
        dropzone.classList.add("dragover");
      else
        dropzone.classList.remove("dragover");
    }
    else if (event.payload.type == "drop") {
      dropzone.classList.remove("dragover");
      console.log(event.payload.paths);
    }
    else {
      console.log('File drop cancelled');
    }
  })
}

window.addEventListener("DOMContentLoaded", async () => {

  dropzone = document.querySelector("#dropzone");
  scaleFactor = await tauriWindow.scaleFactor();

  // const printMousePosition = async () => {
  //   console.log((await cursorPosition()).toLogical(scaleFactor))
  //   setTimeout(() => {
  //     printMousePosition()
  //   }, 500);
  // }
  // printMousePosition()

  setupDragDrop()

});
