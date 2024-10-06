// Elementos del DOM
const photoReel = document.getElementById("photoReel");
const newPhotoBtn = document.getElementById("newPhotoBtn");

// URL de la API
const API_URL = "https://67029e2fbd7c8c1ccd3f5e49.mockapi.io/api/create-post";

// Función para verificar el estado de la red y actualizar la UI
function updateNetworkStatus() {
  if (navigator.onLine) {
    newPhotoBtn.disabled = false;
    newPhotoBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    newPhotoBtn.disabled = true;
    newPhotoBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Función para obtener las publicaciones desde MockAPI
async function fetchPosts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const posts = await response.json();
    return posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Función para crear el HTML de una publicación
function createPostHTML(post) {
  return `
        <div class="bg-white shadow overflow-hidden rounded-lg" id="post-${
          post.id
        }">
            <div class="px-4 py-5 sm:p-6">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        ${post.titulo}
                    </h3>
                    <button onclick="deletePost('${
                      post.id
                    }')" class="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                    <img src="${post.imagen}" alt="${
    post.titulo
  }" class="w-full h-full object-center object-cover">
                </div>
                <p class="mt-2 text-sm text-gray-500">
                    ${new Date(post.fecha).toLocaleString()} 
                </p>
            </div>
        </div>
    `;
}

// Función para renderizar las publicaciones en el reel de fotos
async function renderPosts() {
  const posts = await fetchPosts();
  if (posts.length > 0) {
    photoReel.innerHTML = posts.map(createPostHTML).join("");
  } else {
    photoReel.innerHTML =
      '<p class="text-center text-gray-500">No hay publicaciones para mostrar.</p>';
  }
}

// Función para borrar una publicación
async function deletePost(id) {
  if (confirm("¿Estás seguro de que quieres borrar esta publicación?")) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al borrar la publicación");
      }
      alert("Publicación borrada con éxito!");
      renderPosts();
      document.getElementById(`post-${id}`).remove();
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Hubo un problema al borrar la publicación. Por favor, intenta de nuevo."
      );
    }
  }
}

// Manejador de eventos para el botón de nueva foto
newPhotoBtn.addEventListener("click", () => {
  window.location.href = "camera.html";
});

// Eventos para actualizar el estado de la red
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  updateNetworkStatus();
  renderPosts();
});
