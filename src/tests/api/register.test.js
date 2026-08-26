import {expect, request, test} from "@playwright/test";
import {
    deletePlayer,
    generateEmail,
    generatePassword,
    generateUsername,
    registerNewPlayer
} from "../helpers/player.js";


test("can register a new player", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const player = await registration.response.json();
    expect(player).toEqual({
        username: registration.input.username,
        email: registration.input.email,
        fullName: null,
        password:registration.input.password
    });

    await deletePlayer({
        usernameOrEmail: registration.input.username,
        password: registration.input.password
    });
})

test("cannot register with a short username", async () => {
    const registration = await registerNewPlayer("a");

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json()))
        .toEqual({
            username: "Username must have 4-24 characters and include only letters and digits."
        });
})

test("cannot register with a long username", async () => {
    const registration = await registerNewPlayer("AUsernameTooLongToBeValid");

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json()))
        .toEqual({
            username: "Username must have 4-24 characters and include only letters and digits."
        });
})

test("cannot register with a username containing special characters", async () => {
    const registration = await registerNewPlayer("ha$specia!chars");

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json()))
        .toEqual({
            username: "Username must have 4-24 characters and include only letters and digits."
        });
})

test("cannot register with an invalid email", async () => {
    const registration = await registerNewPlayer(generateUsername(), "not a valid email");

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json()))
        .toEqual({ email: "Must be a valid email address" });
})

test("cannot register with an invalid password", async () => {
    const username = generateUsername();
    const email = generateEmail(username);
    const password = "invalid_password";
    const registration = await registerNewPlayer(username, email, password);

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json())).toEqual({
            password: "Password must have 8-24 characters and include at least a digit, a lowercase, an uppercase and a symbol"
    });
})

test("cannot register with multiple invalid inputs", async () => {
    const username = "a";
    const email = "not a valid email";
    const password = "invalid_password";
    const registration = await registerNewPlayer(username, email, password);

    expect(registration.response.status()).toBe(400);
    expect((await registration.response.json())).toEqual({
        username: "Username must have 4-24 characters and include only letters and digits.",
        email: "Must be a valid email address" ,
        password: "Password must have 8-24 characters and include at least a digit, a lowercase, an uppercase and a symbol"
    });
})

test("cannot register with duplicate username", async () => {
    const username = generateUsername();
    const email = generateEmail(username);
    const password = generatePassword();
    const registration1 = await registerNewPlayer(username, email, password);

    const newEmail = generateEmail(username);
    const newPassword = generatePassword();
    const registration2 = await registerNewPlayer(username, newEmail, newPassword);

    expect(registration2.response.status()).toBe(403);
    expect((await registration2.response.json())).toEqual({
        error: "UNIQUE constraint failed: players.username",
    });

    await deletePlayer({
        usernameOrEmail: registration1.input.username,
        password: registration1.input.password
    });
})

test("cannot register with duplicate email", async () => {
    const username = generateUsername();
    const email = generateEmail(username);
    const password = generatePassword();
    const registration1 = await registerNewPlayer(username, email, password);

    const newUsername = generateUsername();
    const newPassword = generatePassword();
    const registration2 = await registerNewPlayer(newUsername, email, newPassword);

    expect(registration2.response.status()).toBe(403);
    expect((await registration2.response.json())).toEqual({
        error: "UNIQUE constraint failed: players.email",
    });

    await deletePlayer({
        usernameOrEmail: registration1.input.username,
        password: registration1.input.password
    });
})

test("cannot register without the required fields", async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:8080' });
    const registration = await api.post('/players/register', {
        data: { }
    });

    expect(registration.status()).toBe(400);
    expect((await registration.json())).toEqual({
        password: "Password must not be null",
        email: "Email must not be blank",
        username: "Username must have 4-24 characters and include only letters and digits."
    });
})

test("cannot register with empty fields", async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:8080' });
    const registration = await api.post('/players/register', {
        data: {
            username: "",
            email: "",
            password: "",
        }
    });

    expect(registration.status()).toBe(400);
    expect((await registration.json())).toEqual({
        password: "Password must have 8-24 characters and include at least a digit, a lowercase, an uppercase and a symbol",
        email: "Email must not be blank",
        username: "Username must have 4-24 characters and include only letters and digits."
    });
})
