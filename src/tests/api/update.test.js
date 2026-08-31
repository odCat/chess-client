import {expect, request, test} from "@playwright/test";
import {
    deletePlayer,
    generateEmail,
    generatePassword,
    generateUsername,
    loginPlayer,
    registerNewPlayer
} from "../helpers/player.js";


test("update all player information", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    let login = await (await loginPlayer(registration.input.username,
                                         registration.input.password)).json();

    const id = login.id;

    const newUsername = generateUsername();
    const newFullName = "John Doe";
    const newEmail = generateEmail(newUsername);
    const newPassword = generatePassword();
    const today = new Date().toISOString().split('T')[0];

    let updated = await api.patch(`/players?id=${login.id}`, {
        headers: {
            Authorization: `Bearer ${login.password}`
        },
        data: {
            username: newUsername,
            fullName: newFullName,
            email: newEmail,
            password: newPassword,
        }
    });

    expect(updated.ok()).toBeTruthy();

    updated = await updated.json();

    expect(updated.id).toEqual(id);
    expect(updated.username).toEqual(newUsername);
    expect(updated.email).toEqual(newEmail);
    expect(updated.fullName).toEqual(newFullName);
    expect(updated.created).toEqual(today);

    await deletePlayer({
        id: id,
        token: updated.password
    })
})

test("update full name", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    let login = await (await loginPlayer(registration.input.username,
        registration.input.password)).json();

    const id = login.id;

    const newFullName = "John Doe";
    let updated = await api.patch(`/players?id=${login.id}`, {
        headers: {
            Authorization: `Bearer ${login.password}`
        },
        data: {
            fullName: newFullName,
        }
    });

    expect(updated.ok()).toBeTruthy();

    updated = await updated.json();
    expect(updated.fullName).toEqual(newFullName);

    await deletePlayer({
        id: id,
        token: updated.password
    })
})

test("player can login with new password", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    let login = await (await loginPlayer(registration.input.username,
                                         registration.input.password)).json();

    const newPassword = generatePassword();
    const updated = await api.patch(`/players?id=${login.id}`, {
        headers: {
            Authorization: `Bearer ${login.password}`
        },
        data: {
            password: newPassword,
        }
    });

    expect(updated.ok()).toBeTruthy();

    login = await loginPlayer(registration.input.username, newPassword);
    expect(login.ok()).toBeTruthy();

    login = await login.json();
    await deletePlayer({
        id: login.id,
        token: login.password
    })
})

test("player can login with new username", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    let login = await (await loginPlayer(registration.input.username,
                                         registration.input.password)).json();

    const newUsername = generateUsername();
    const updated = await api.patch(`/players?id=${login.id}`, {
        headers: {
            Authorization: `Bearer ${login.password}`
        },
        data: {
            username: newUsername,
        }
    });

    expect(updated.ok()).toBeTruthy();

    login = await loginPlayer(newUsername, registration.input.password);
    expect(login.ok()).toBeTruthy();

    login = await login.json();
    await deletePlayer({
        id: login.id,
        token: login.password
    })
})

test("player cannot update without authentication", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    let login = await (await loginPlayer(registration.input.username,
                                         registration.input.password)).json();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    const newUsername = generateUsername();
    const updated = await api.patch(`/players?id=${login.id}`, {
        data: {
            username: newUsername,
        }
    });

    expect(updated.status()).toBe(403);

    login = await loginPlayer(newUsername, registration.input.password);
    expect(login.ok()).toBeFalsy();

    login = await loginPlayer(registration.input.username, registration.input.password);
    expect(login.ok()).toBeTruthy();

    login = await login.json();
    await deletePlayer({
        id: login.id,
        token: login.password
    })
})

test("player cannot update another player", async () => {
    const registration1 = await registerNewPlayer();
    const registration2 = await registerNewPlayer();

    expect(registration1.response.ok()).toBeTruthy();
    expect(registration2.response.ok()).toBeTruthy();

    let login1 = await (await loginPlayer(registration1.input.username,
                                          registration1.input.password)).json();
    let login2 = await (await loginPlayer(registration2.input.username,
                                          registration2.input.password)).json();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    const newUsername = generateUsername();
    const updated = await api.patch(`/players?id=${login2.id}`, {
        headers: {
            Authorization: `Bearer ${login1.password}`
        },
        data: {
            username: newUsername,
        }
    });

    expect(updated.status()).toBe(403);

    const login3 = await loginPlayer(newUsername, generatePassword());
    expect(login3.status()).toBe(403);

    login1 = await loginPlayer(registration1.input.username, registration1.input.password);
    expect(login1.ok()).toBeTruthy();
    login1 = await login1.json();
    await deletePlayer({
        id: login1.id,
        token: login1.password
    })

    login2 = await loginPlayer(registration2.input.username, registration2.input.password);
    expect(login2.ok()).toBeTruthy();
    login2 = await login2.json();
    await deletePlayer({
        id: login2.id,
        token: login2.password
    })
})

test("cannot update with invalid data", async () => {
    const registration = await registerNewPlayer();

    expect(registration.response.ok()).toBeTruthy();

    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    let login = await (await loginPlayer(registration.input.username,
                                         registration.input.password)).json();

    const id = login.id;

    const newUsername = "|nvalid n@me";
    const newEmail = "not and email";
    const newPassword = "weak password";
    let updated = await api.patch(`/players?id=${login.id}`, {
        headers: {
            Authorization: `Bearer ${login.password}`
        },
        data: {
            username: newUsername,
            email: newEmail,
            password: newPassword,
        }
    });

    expect(updated.status()).toBe(400);
    expect(await updated.json()).toEqual({
        password: "Password must have 8-24 characters and include at least a digit, a lowercase, an uppercase and a symbol",
        email: "Must be a valid email address",
        username: "Username must have 4-24 characters and include only letters and digits."
    });

    await deletePlayer({
        id: id,
        token: login.password
    })
})
