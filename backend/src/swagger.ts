export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "CyberShield AI API",
    version: "1.0.0",
    description: "API documentation for the CyberShield AI backend"
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local server"
    }
  ],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["USER", "ADMIN"] }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "User created" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login to account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Successful login" }
        }
      }
    },
    "/auth/me": {
      get: {
        summary: "Get current user profile",
        responses: {
          "200": { description: "User profile" }
        }
      }
    },
    "/threats": {
      get: {
        summary: "Get all threats",
        responses: {
          "200": { description: "List of threats" }
        }
      },
      post: {
        summary: "Submit a new threat report",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  link: { type: "string" },
                  imageUrl: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Threat reported" }
        }
      }
    }
  }
};
