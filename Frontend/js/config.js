const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_URL = isLocal
  ? "http://localhost:3000"
  : "https://projeto-integrador-roles.onrender.com";

  window.API_URL = API_URL;