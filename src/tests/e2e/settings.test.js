import {expect, test} from "@playwright/test";
import {
    deletePlayer,
    generateEmail,
    generatePassword,
    generateUsername,
    loginPlayer,
    registerNewPlayer
} from "../helpers/player.js";


test("has components", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await expect(page).toHaveTitle("chess-client");

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Username" })).toBeVisible();
    await expect(page.locator("#username")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Enter the new password" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "(again)" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Full name" })).toBeVisible();
    await expect(page.locator("#full_name")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Email" })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();

    await expect(page.getByRole("button", { name: /^Save changes$/ })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Delete account" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Delete your account$/ })).toBeVisible();

    await expect(page.getByText(/^Copyright © 202\d Mihai Gătejescu$/ )).toBeVisible();

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})

test("cannot update player info if the passwords do not match", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await page.getByRole("textbox", { name: "Enter the new password" }).fill(generatePassword());
    await page.getByRole("textbox", { name: "(again)" }).fill(generatePassword());
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();

    const login = await loginPlayer(player.username, player.password);
    expect(login.status()).toBe(200);

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})

test("can login with new password", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    const newPassword = generatePassword();
    await page.getByRole("textbox", { name: "Enter the new password" }).fill(newPassword);
    await page.getByRole("textbox", { name: "(again)" }).fill(newPassword);
    await page.getByRole("button", { name: "Save changes" }).click();

    const login = await loginPlayer(player.username, newPassword);
    expect(login.status()).toBe(200);

    await deletePlayer({ usernameOrEmail: player.username, password: newPassword });
})

test("can login with new username", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await expect(page).toHaveURL("http://localhost:5173/settings");

    const newUsername = generateUsername();
    await page.locator("#username").fill(newUsername);
    await page.getByRole("button", { name: "Save changes" }).click();

    const login = await loginPlayer(newUsername, player.password);
    expect(login.status()).toBe(200);

    await deletePlayer({ usernameOrEmail: newUsername, password: player.password });
})

test("can login with new email", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await expect(page).toHaveURL("http://localhost:5173/settings");

    const newEmail = generateEmail();
    await page.locator("#email").fill(newEmail);
    await page.getByRole("button", { name: "Save changes" }).click();

    const login = await loginPlayer(newEmail, player.password);
    expect(login.status()).toBe(200);

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})

test("update full name", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await expect(page).toHaveURL("http://localhost:5173/settings");

    const newFullName = "John Doe";
    await page.locator("#full_name").fill(newFullName);
    await page.getByRole("button", { name: "Save changes" }).click();

    let login = await loginPlayer(player.username, player.password);
    expect(login.status()).toBe(200);

    login = await login.json();
    expect(login.fullName).toBe(newFullName);

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})

test("can delete account", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await page.getByRole("button", { name: "Delete your account" }).click();

    expect(page.getByRole("heading", { name: "Are you sure you want to delete your account?"}));
    expect(page.getByText("This action cannot be undone."));
    expect(page.getByRole("button", { name: "Delete"}));
    expect(page.getByRole("button", { name: "Cancel"}));
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL("http://localhost:5173/login");
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();

    await expect(page.getByText("Invalid username or password")).toHaveCount(2);
})

test("can cancel account deletion", async ({ page }) => {
    const registration = await registerNewPlayer();
    const player = await registration.input;
    await page.goto("http://localhost:5173/login")
    await page.getByRole('textbox', { name: /^Email\/Username$/ }).fill(player.username);
    await page.getByRole('textbox', { name: /^Password$/ }).fill(player.password);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await page.getByRole("button", { name: player.username }).click();
    await page.getByRole("menuitem", { name: "Settings" }).click();

    await page.getByRole("button", { name: "Delete your account" }).click();

    expect(page.getByRole("heading", { name: "Are you sure you want to delete your account?"}));
    expect(page.getByText("This action cannot be undone."));
    expect(page.getByRole("button", { name: "Delete"}));
    expect(page.getByRole("button", { name: "Cancel"}));
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("http://localhost:5173/settings");

    const login = await loginPlayer(player.username, player.password);
    expect(login.status()).toBe(200);

    await deletePlayer({ usernameOrEmail: player.username, password: player.password });
})
