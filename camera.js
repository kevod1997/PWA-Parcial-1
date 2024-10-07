// Elementos del DOM
const captureView = document.getElementById("captureView");
const publishView = document.getElementById("publishView");
const cameraPreview = document.getElementById("cameraPreview");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const photoPreview = document.getElementById("photoPreview");
const photoTitle = document.getElementById("photoTitle");
const cancelBtn = document.getElementById("cancelBtn");
const publishBtn = document.getElementById("publishBtn");
const fileInput = document.getElementById("fileInput");

// URL de la API
const API_URL = "https://67029e2fbd7c8c1ccd3f5e49.mockapi.io/api/create-post";

let stream;
let facingMode = "environment"; // Inicialmente usamos la cámara trasera
let hasMultipleCameras = false;

// Función para detectar si el dispositivo tiene múltiples cámaras
async function checkForMultipleCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(
      (device) => device.kind === "videoinput"
    );
    hasMultipleCameras = videoInputs.length > 1;

    updateSwitchCameraButtonVisibility();
  } catch (error) {
    console.error("Error al verificar múltiples cámaras:", error);
    updateSwitchCameraButtonVisibility();
  }
}

// Función para actualizar la visibilidad del botón de cambio de cámara
function updateSwitchCameraButtonVisibility() {
  if (hasMultipleCameras) {
    switchCameraBtn.classList.remove("hidden");
  } else {
    switchCameraBtn.classList.add("hidden");
  }
}

// Función para iniciar la cámara
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
    });
    cameraPreview.srcObject = stream;
    await cameraPreview.play();

    // Verificar nuevamente las cámaras después de que el stream se ha iniciado
    await checkForMultipleCameras();
  } catch (error) {
    window.location.href = "index.html";
    alert(
      "No se pudo acceder a la cámara. Por favor, asegúrate de que tienes permisos de cámara habilitados."
    );
  }
}

// Función para cambiar entre cámaras
async function switchCamera() {
  if (!hasMultipleCameras) return;

  facingMode = facingMode === "environment" ? "user" : "environment";
  stopCamera();
  await startCamera();
}

// Función para capturar la foto o procesar la imagen seleccionada
function capturePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  canvas.getContext("2d").drawImage(cameraPreview, 0, 0);
  convertToWebP(canvas);
}

// Función para convertir la imagen a WebP
function convertToWebP(canvas) {
  canvas.toBlob(
    (blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        photoPreview.src = reader.result;
        stopCamera();
        showPublishView();
      };
      reader.readAsDataURL(blob);
    },
    "image/webp",
    0.8
  );
}

// Función para manejar la selección de archivos
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        convertToWebP(canvas);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Función para detener la cámara
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

// Función para mostrar la vista de publicación
function showPublishView() {
  captureView.classList.add("hidden");
  publishView.classList.remove("hidden");
}

// Función para volver a la vista de captura
function showCaptureView() {
  publishView.classList.add("hidden");
  captureView.classList.remove("hidden");
  startCamera();
}

// Función para publicar la imagen en MockAPI
async function publishPhoto() {
  const title = photoTitle.value.trim();
  if (!title) {
    alert("Por favor, añade un título a tu foto.");
    return;
  }

  const post = {
    imagen: photoPreview.src,
    fecha: new Date().toISOString(),
    titulo: title,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      alert("Error al publicar la foto");
    }
    alert("Foto publicada con éxito!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Hubo un problema al publicar la foto. Por favor, intenta de nuevo.");
  }
}

// Función para actualizar el estado del botón basado en la conectividad y el título
function updateButtonState() {
  const isOnline = navigator.onLine;
  const hasTitle = photoTitle.value.trim().length > 0;

  if (isOnline && hasTitle) {
    publishBtn.disabled = false;
    publishBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    publishBtn.disabled = true;
    publishBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Event Listeners
cameraPreview.addEventListener("dblclick", capturePhoto);
captureBtn.addEventListener("click", capturePhoto);
switchCameraBtn.addEventListener("click", switchCamera);
fileInput.addEventListener("change", handleFileSelect);
cancelBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
publishBtn.addEventListener("click", publishPhoto);
photoTitle.addEventListener("input", updateButtonState);

window.addEventListener("online", updateButtonState);
window.addEventListener("offline", updateButtonState);

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  updateButtonState();
  startCamera().then(() => {
    // Verificar nuevamente las cámaras después de un breve retraso
    setTimeout(checkForMultipleCameras, 1000);
  });
});
