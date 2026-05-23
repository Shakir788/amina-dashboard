import axios from "axios";

const API = axios.create({

    baseURL:
        "https://amina-whatsapp-ai.vercel.app"
});

export default API;