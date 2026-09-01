import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";

describe("API", () => {
  it("reports service health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "hello" });
  });

  it("validates registration input before it reaches the database", async () => {
    const response = await request(app).post("/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "body.name" }),
        expect.objectContaining({ field: "body.email" }),
        expect.objectContaining({ field: "body.password" }),
      ])
    );
  });

  it("rejects an upload without a bearer token", async () => {
    const response = await request(app)
      .post("/files/upload")
      .attach("files", Buffer.from("test"), "test.txt");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Not Authorized",
    });
  });

  it("rejects unauthenticated admin statistics requests", async () => {
    const response = await request(app).get("/stats/admin");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Not Authorized",
    });
  });
});
