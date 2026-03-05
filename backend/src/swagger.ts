import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Memo App API",
    version: "1.0.0",
    description: "メモアプリケーションのREST API",
  },
  servers: [
    { url: "/api", description: "API server" },
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
      Memo: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "買い物リスト" },
          content: { type: "string", example: "牛乳、卵、パン" },
          userId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", example: "user@example.com" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "ヘルスチェック",
        responses: {
          "200": {
            description: "サーバー稼働中",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "ユーザ登録",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 6, example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "登録成功",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "400": { description: "バリデーションエラー", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "メールアドレス重複", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "ログイン",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "ログイン成功",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "401": { description: "認証失敗", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/memos": {
      get: {
        tags: ["Memos"],
        summary: "メモ一覧取得",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "メモ一覧",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Memo" } },
              },
            },
          },
          "401": { description: "未認証", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Memos"],
        summary: "メモ作成",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "買い物リスト" },
                  content: { type: "string", example: "牛乳、卵、パン" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "作成成功", content: { "application/json": { schema: { $ref: "#/components/schemas/Memo" } } } },
          "400": { description: "バリデーションエラー", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "未認証", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/memos/{id}": {
      get: {
        tags: ["Memos"],
        summary: "メモ取得",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "メモ", content: { "application/json": { schema: { $ref: "#/components/schemas/Memo" } } } },
          "401": { description: "未認証", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "メモが見つからない", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Memos"],
        summary: "メモ更新",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "買い物リスト（更新）" },
                  content: { type: "string", example: "牛乳、卵、パン、バター" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "更新成功", content: { "application/json": { schema: { $ref: "#/components/schemas/Memo" } } } },
          "401": { description: "未認証", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "メモが見つからない", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Memos"],
        summary: "メモ削除",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "削除成功" },
          "401": { description: "未認証", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "メモが見つからない", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
