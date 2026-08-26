import { expect, test } from "@playwright/test";
import { deletePlayer, registerNewPlayer } from "../helpers/player.js";


async function loginAndGoToProfile(page, player) {
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Profile" }).click();
}

test("has components", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await loginAndGoToProfile(page, player);

    await expect(page).toHaveTitle("chess-client");

    await expect(page.getByRole("heading", { name: "Game History" })).toBeVisible();

    await expect(page.locator("#game_history")).toBeVisible();

    await expect(page.getByRole("columnheader", { name: "White" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Black" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Date" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Result" })).toBeVisible();

    await expect(page.locator("#game_history tr")).toHaveCount(1);

    await expect(page.getByText(/^Copyright © 202\d Mihai Gătejescu$/ )).toBeVisible();

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})
