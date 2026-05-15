import cors from '@elysia/cors'
import openapi from '@elysia/openapi'
import { Elysia } from 'elysia'

export default new Elysia({ prefix: '/api/v1' })
    .use(cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
    }))
    .use(openapi())


