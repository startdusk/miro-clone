import { yjsDocStore } from "../../../store/yjsDoc";
import { drawingLineWith, type IReplayDrawing } from "../../../types";

function useDrawOnCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const trackMousePosition = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  let drawOnCanvasInit = false;

  const drawOnCanvas = () => {
    if (!drawOnCanvasInit) {
      drawOnCanvasInit = true
      let drawing = false;
      let drawingPath = [] as Array<IReplayDrawing>;

      canvas.addEventListener("mousedown", (event: MouseEvent) => {
        drawing = true;
        const mousePos = trackMousePosition(event);
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        drawingPath.push({
          x: mousePos.x,
          y: mousePos.y,
          type: "start",
          strokeStyle: ctx.strokeStyle,
        });
      });

      canvas.addEventListener("mousemove", (event: MouseEvent) => {
        if (!drawing) return;
        const mousePos = trackMousePosition(event);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = drawingLineWith;
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        drawingPath.push({
          x: mousePos.x,
          y: mousePos.y,
          type: "drawing",
          strokeStyle: ctx.strokeStyle,
        });
      });

      canvas.addEventListener("mouseup", (_event: MouseEvent) => {
        drawing = false;
        yjsDocStore.arrayDrawing.push(drawingPath);
        yjsDocStore.yArrayDrawing.insert(0, [drawingPath]);
        drawingPath = [];
        ctx.closePath();
      });

      canvas.addEventListener("mouseleave", (_event: MouseEvent) => {
        drawing = false;
      });
    }

    loadCachedGrid();
    replayDrawing();
  };

  const adjustCanvasSize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
  };

  const drawGrid = () => {
    const gridSize = 40;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Set the grid line style
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Cache the grid as an image in localStorage
    const gridImageData = canvas.toDataURL();
    localStorage.setItem("cacheGrid", gridImageData);
  };

  const loadCachedGrid = () => {
    adjustCanvasSize();
    drawGrid();
  };

  const undo = () => {
    const index = 0;
    const drawingPath = yjsDocStore.yArrayDrawing.get(0);
    if (drawingPath) yjsDocStore.redoDrawingArray.push(drawingPath);
    yjsDocStore.yArrayDrawing.delete(index, 1);
    replayDrawing();
    loadCachedGrid();
  };

  const redo = () => {
    const redo = yjsDocStore.redoDrawingArray.pop();
    if (!redo) return;
    yjsDocStore.yArrayDrawing.insert(0, [redo]);
    replayDrawing();
    loadCachedGrid();
  };

  const initCanvas = () => {
    const arrayLength = yjsDocStore.arrayDrawing.length;
    yjsDocStore.yArrayDrawing.delete(0, arrayLength);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  };

  const replayDrawing = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loadCachedGrid();
    yjsDocStore.arrayDrawing.forEach((path) => {
      if (path.length > 0) {
        ctx.strokeStyle = path[0].strokeStyle;
        ctx.beginPath();
        path.forEach((point) => {
          if (point.type === "start") {
            ctx.moveTo(point.x, point.y);
          } else if (point.type === "drawing") {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.lineWidth = drawingLineWith;
        ctx.stroke();
        ctx.closePath();
      }
    });
  };
  return { drawOnCanvas, initCanvas, replayDrawing, redo, undo };
}

export function useCanvas() {
  function selectCanvas() {
    return new Promise<{
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
    }>((resolve, _reject) => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      resolve({ canvas, ctx });
    });
  }

  async function initCanvas() {
    const { canvas, ctx } = await selectCanvas();
    const { drawOnCanvas, undo, redo, initCanvas, replayDrawing } =
      useDrawOnCanvas(canvas, ctx);

    return { drawOnCanvas, undo, redo, initCanvas, replayDrawing };
  }

  return { initCanvas };
}
