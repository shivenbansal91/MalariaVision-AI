import axios from 'axios'

// Base URL — uses Vite proxy in dev, env var in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

/**
 * Send an image file to the Flask /predict endpoint.
 * @param {File} file - The image file to analyze.
 * @returns {Promise<{ prediction: string, confidence: number }>}
 */
export async function predictMalaria(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export default api
