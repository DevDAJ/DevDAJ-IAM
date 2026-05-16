import cors from '@elysia/cors'
import openapi from '@elysia/openapi'
import { Elysia } from 'elysia'
import { OpenAPI } from './auth'

export default new Elysia({ prefix: '/api/v1' })
    .use(cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
    }))
    .use(openapi({
        documentation: {
            components: await OpenAPI.components,
            paths: await OpenAPI.getPaths(),
            info: {
                title: 'DevDAJ IAM API',
                version: '1.0.0',
                description: 'API documentation for the DevDAJ IAM system'
            },

            tags: [
                { name: 'app', description: 'Application endpoints' },
                { name: 'user', description: 'User management endpoints' },
                { name: 'role', description: 'Role management endpoints' },
                { name: 'permission', description: 'Permission management endpoints' },
                { name: 'audit', description: 'Audit logging endpoints' },
                { name: 'admin', description: 'Admin-specific endpoints' }
            ]
        }
    }))


