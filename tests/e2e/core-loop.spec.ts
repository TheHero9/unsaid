import { expect, test } from "@playwright/test";

/**
 * Core-loop smoke (S6): organizer creates an event + pitch → two jurors join
 * and capture feedback → the founder page shows the merged, anonymous result.
 * Also asserts the access model: the public juror surface never exposes
 * feedback, founder pages 404 on wrong codes, and no juror identity reaches
 * the founder page.
 *
 * Uses the real UI end to end - no API shortcuts. Requires the dev server
 * and a migrated database (npm run dev is started by playwright.config.ts).
 */

const PITCH_NAME = "Loopwell";
const JUROR_1 = "Maria Karras";
const JUROR_2 = "Stefan Brandt";
const NOTE_1 = "The ask slide went by too fast for me to catch the amount.";
const NOTE_2 = "Best demo of the day, numbers felt solid.";

test("core loop: organizer → two jurors capture → founder sees merged anonymous feedback", async ({
  page,
  browser,
}) => {
  // ---- Organizer: create event ------------------------------------------
  await page.goto("/new");
  await page.locator("#name").fill("E2E Demo Day");
  await page.locator("#location").fill("Test Hall");
  await page.getByRole("button", { name: "Create event" }).click();
  await page.waitForURL(/\/o\/[A-Za-z0-9]+/);

  // ---- Organizer: add a pitch -------------------------------------------
  await page.locator("#pitch-name").fill(PITCH_NAME);
  await page
    .locator("#pitch-description")
    .fill("Subscription analytics that finds silent churn.");
  await page.getByRole("button", { name: "Add pitch" }).click();
  await expect(page.getByText(`1. ${PITCH_NAME}`)).toBeVisible();

  // ---- Organizer: grab the shareable links ------------------------------
  const publicLink = (
    await page.locator("code", { hasText: "/e/" }).first().textContent()
  )?.trim();
  const founderLink = (
    await page.locator("code", { hasText: "/f/" }).first().textContent()
  )?.trim();
  expect(publicLink).toBeTruthy();
  expect(founderLink).toBeTruthy();

  const publicPath = new URL(publicLink!).pathname;
  const founderPath = new URL(founderLink!).pathname;

  // ---- Juror 1: join, capture chips + note ------------------------------
  await page.goto(publicPath);
  await page.locator("#juror-name").fill(JUROR_1);
  await page.getByRole("button", { name: "Start giving feedback" }).click();
  await page
    .getByRole("link", { name: `Give feedback on ${PITCH_NAME}` })
    .click();
  await page.waitForURL(/\/e\/.+\/p\/.+/);

  await page.getByRole("button", { name: "unclear ask" }).click();
  await page.getByRole("button", { name: "strong traction" }).click();
  await page.locator("#capture-note").fill(NOTE_1);
  await page.getByRole("button", { name: "Submit feedback" }).click();
  await expect(page.getByText("Feedback sent")).toBeVisible();

  // ---- Juror 2: separate browser context = separate identity ------------
  const jurorTwoContext = await browser.newContext();
  const page2 = await jurorTwoContext.newPage();
  await page2.goto(publicPath);
  await page2.locator("#juror-name").fill(JUROR_2);
  await page2.getByRole("button", { name: "Start giving feedback" }).click();
  await page2
    .getByRole("link", { name: `Give feedback on ${PITCH_NAME}` })
    .click();
  await page2.waitForURL(/\/e\/.+\/p\/.+/);

  await page2.getByRole("button", { name: "unclear ask" }).click();
  await page2.getByRole("button", { name: "great team" }).click();
  await page2.locator("#capture-note").fill(NOTE_2);
  await page2.getByRole("button", { name: "Submit feedback" }).click();
  await expect(page2.getByText("Feedback sent")).toBeVisible();
  await jurorTwoContext.close();

  // ---- Access model: juror surface never exposes feedback ---------------
  await page.goto(publicPath);
  const jurorHtml = await page.content();
  expect(jurorHtml).not.toContain(NOTE_1);
  expect(jurorHtml).not.toContain(NOTE_2);
  expect(jurorHtml).not.toContain("unclear ask"); // no aggregate leak either

  // ---- Founder: merged, anonymous feedback ------------------------------
  await page.goto(founderPath);
  await expect(page.getByText("Feedback from 2 jurors")).toBeVisible();
  await expect(page.getByText("unclear ask").first()).toBeVisible();
  await expect(page.getByText("strong traction").first()).toBeVisible();
  await expect(page.getByText("great team").first()).toBeVisible();
  await expect(page.getByText(NOTE_1)).toBeVisible();
  await expect(page.getByText(NOTE_2)).toBeVisible();

  // Anonymity: nothing juror-identifying in the rendered page or RSC payload.
  const founderHtml = await page.content();
  expect(founderHtml).not.toContain(JUROR_1);
  expect(founderHtml).not.toContain(JUROR_2);
  expect(founderHtml).not.toContain("Maria");
  expect(founderHtml).not.toContain("Stefan");
});

test("access model: a wrong private code 404s and reveals nothing", async ({
  page,
}) => {
  const response = await page.goto("/f/AAAAAAAAAAAAAA");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Nothing here")).toBeVisible();
});
