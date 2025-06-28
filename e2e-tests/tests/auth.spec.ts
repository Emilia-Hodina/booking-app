import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5173/";

test("should allow the user to sign in", async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByRole("link", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.locator("[name=email]").fill("1@1.com");
  await page.locator("[name=password]").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Login Successful")).toBeVisible();
  await expect(page.getByRole("link", { name: "My Bookings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
  await expect(page.getByText("EE")).toBeVisible();
  await page.getByText("EE").click();
  await page.waitForTimeout(200);
  await expect(page.getByText("Edit Profile")).toBeVisible();
  await expect(page.getByText("Sign Out")).toBeVisible();
});

test("should allow user to register", async ({ page }) => {
  const testEmail = `test_register_${
    Math.floor(Math.random() * 90000) + 10000
  }@test.com`;
  await page.goto(UI_URL);

  await page.getByRole("link", { name: "Sign In" }).click();
  await page.getByRole("link", { name: "Create an account " }).click();
  await expect(
    page.getByRole("heading", { name: "Create an Account" })
  ).toBeVisible();

  await page.locator("[name=firstName]").fill("test_firstName");
  await page.locator("[name=lastName]").fill("test_lastName");
  await page.locator("[name=email]").fill(testEmail);
  await page.locator("[name=phoneNumber]").fill("1234567890");
  await page.locator("[id^=react-select][id$=-input]").click();
  await page.locator("[id^=react-select][id$=-input]").fill("Estonia");
  await page.getByText("Estonia", { exact: true }).click();
  await page.locator("[name=password]").fill("password123");
  await page.locator("[name=confirmPassword]").fill("password123");

  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByText("Account created successfully")).toBeVisible();
  await expect(page.getByRole("link", { name: "My Bookings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();

  await expect(page.getByText("TT")).toBeVisible();

  await page.getByText("TT").click();
  await page.waitForTimeout(200);

  await expect(page.getByText("Edit Profile")).toBeVisible();
  await expect(page.getByText("Sign Out")).toBeVisible();
});
