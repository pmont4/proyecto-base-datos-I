import axios from "axios";

const URL = "/api/proyectoumg/";

export const APIBackend = axios.create({
    baseURL: URL,
});