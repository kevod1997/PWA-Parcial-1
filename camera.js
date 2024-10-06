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

// URL de la API
const API_URL = "https://67029e2fbd7c8c1ccd3f5e49.mockapi.io/api/create-post";

let stream;
let facingMode = "environment"; // Inicialmente usamos la cámara trasera

// Función para iniciar la cámara
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
    });
    cameraPreview.srcObject = stream;
    await cameraPreview.play();
  } catch (error) {
    console.error("Error accessing the camera", error);
    alert(
      "No se pudo acceder a la cámara. Por favor, asegúrate de que tienes permisos de cámara habilitados."
    );
  }
}

// Función para cambiar entre cámaras
async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  stopCamera();
  await startCamera();
}

// Función para capturar la foto
function capturePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  canvas.getContext("2d").drawImage(cameraPreview, 0, 0);
  photoPreview.src = canvas.toDataURL("image/jpeg");
  stopCamera();
  showPublishView();
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
      throw new Error("Error al publicar la foto");
    }

    alert("Foto publicada con éxito!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error:", error);
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
  startCamera();
});
