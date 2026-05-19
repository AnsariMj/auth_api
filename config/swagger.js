const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-tenant Auth API",
      version: "1.0.0",
      description: "API documentation for Multi-tenant Authentication System",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            userName: {
              type: "string",
              description: "User name",
            },
            userEmail: {
              type: "string",
              format: "email",
              description: "User email",
            },
            userPassword: {
              type: "string",
              format: "password",
              description: "User password (hashed in database)",
            },
            tenant: {
              type: "string",
              description: "Tenant ID",
            },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              description: "User role",
            },
            isActive: {
              type: "boolean",
              description: "User active status",
            },
            emailVerified: {
              type: "boolean",
              description: "Email verification status",
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "Last login timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Tenant: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Tenant ID",
            },
            tenantName: {
              type: "string",
              description: "Tenant name",
            },
            tenantSlug: {
              type: "string",
              description: "Tenant URL slug",
            },
            description: {
              type: "string",
              description: "Tenant description",
            },
            owner: {
              type: "string",
              description: "Tenant owner user ID",
            },
            logo: {
              type: "string",
              description: "Tenant logo URL",
            },
            website: {
              type: "string",
              description: "Tenant website URL",
            },
            isActive: {
              type: "boolean",
              description: "Tenant active status",
            },
            maxUsers: {
              type: "number",
              description: "Maximum users allowed",
            },
            plan: {
              type: "string",
              enum: ["free", "pro", "enterprise"],
              description: "Subscription plan",
            },
            subscriptionStatus: {
              type: "string",
              enum: ["active", "expired", "cancelled"],
              description: "Subscription status",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
