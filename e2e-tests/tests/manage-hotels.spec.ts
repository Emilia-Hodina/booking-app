import { test, expect } from "@playwright/test";
import path from "path";

const UI_URL = "http://localhost:5173/";

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);

  // get the sign in button
  await page.getByRole("link", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator("[name=email]").fill("1@1.com");
  await page.locator("[name=password]").fill("password123");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Login Successful")).toBeVisible();
});

test("should allow user to add a hotel", async ({ page }) => {
  await page.goto(`${UI_URL}add-hotel`);

  await page.locator('[name="name"]').fill("Test Hotel");
  await page.locator('[name="city"]').fill("Test City");
  await page.locator('[name="country"]').fill("Test Country");
  await page
    .locator('[name="description"]')
    .fill("This is a description for our resort");
  await page.selectOption('select[name="starRating"]', "3");

  await page.getByText("Budget").click();
  await page.getByLabel("Free Wifi").check();
  await page.getByLabel("Parking").check();

  await page
    .locator(".leaflet-container")
    .click({ position: { x: 200, y: 100 } });

  const latField = page.locator('[name="location.lat"]');
  const lngField = page.locator('[name="location.lng"]');
  await expect(latField).not.toHaveValue("");
  await expect(lngField).not.toHaveValue("");

  const latValue = await latField.inputValue();
  const lngValue = await lngField.inputValue();
  console.log("Selected lat/lng:", latValue, lngValue);

  await page
    .locator('input[placeholder="Ex: Double Room"]')
    .fill("Double Room");
  await page.locator('input[type="number"]').nth(0).fill("120");
  await page.locator('input[type="number"]').nth(1).fill("2");
  await page.locator('input[type="number"]').nth(2).fill("1");
  await page.locator('input[type="number"]').nth(3).fill("5");

  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, "files", "1.png"),
    path.join(__dirname, "files", "2.png"),
  ]);

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel added successfully")).toBeVisible();
});

test("should display hotels", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);

  await expect(page.getByText("Test Hotel")).toBeVisible();
  await expect(
    page.getByText("This is a description for our resort.")
  ).toBeVisible();
  await expect(page.getByText("Test City, Test Country")).toBeVisible();
  await expect(page.getByText("Budget")).toBeVisible();
  await expect(page.getByText("3 Star Rating")).toBeVisible();

  await expect(
    page.getByRole("link", { name: "View Details" }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Hotel" })).toBeVisible();
});

test("should edit hotel", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);
  await page.getByRole("link", { name: "View Details" }).first().click();
  await page.waitForSelector('[name="name"]', { state: "attached" });
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel");
  await page.locator('[name="name"]').fill("Test Hotel UPDATED");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel Saved!")).toBeVisible();
  await page.reload();
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel UPDATED");
  await page.locator('[name="name"]').fill("Test Hotel");
  await page.getByRole("button", { name: "Save" }).click();
});

test("should delete hotel", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Are you sure you want to delete this hotel?"
    );
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Delete" }).first().click();

  await expect(page.getByText("Test Hotel")).not.toBeVisible();
});
