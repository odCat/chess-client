import { expect, request } from "@playwright/test";


export async function registerNewPlayer(username, email, password) {
    if (!username)
        username = generateUsername();
    if (!email)
        email = generateEmail(username);
    if (!password)
        password = generatePassword();

    const api = await request.newContext({ baseURL: 'http://localhost:8080' });

    const response = await api.post('/players/register', {
        data: {
            username: username,
            email: email,
            password: password,
        }
    });

    return {
        input : { username, email, password },
        response
    };
}

export async function loginPlayer(usernameOrEmail, password) {
    const api = await request.newContext({baseURL: 'http://localhost:8080'});
    return await api.post('/players/login', {
        data: {
            usernameOrEmail,
            password,
        }
    });
}

export async function deletePlayer({ usernameOrEmail, password, id, token }) {
    const api = await request.newContext({baseURL: 'http://localhost:8080'});

    if (id == null && token == null)
    {
        let login = await api.post('/players/login', {
            data: {
                usernameOrEmail,
                password,
            }
        });

        expect(login.status()).toBe(200);

        login = await login.json();
        id = login.id;
        token = login.password;
    }

    return await api.delete(`/players?id=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export function generateEmail(username) {
    if (username == null)
        username = generateUsername();
    return username.concat("@test.com");
}

export function generateUsername(name) {
    const sufix = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    if (name) {
        if (name.length > 24)
            throw new Error("The name is too long.")
        return name.trim().replace(/\s/g, "_").toLowerCase().concat(sufix);
    }

    const names = [
        "john", "paul", "peter", "matthew", "mark", "luke", "james", "thomas", "philip",
        "bilbo", "frodo", "gandalf", "sauron", "gollum", "legolas", "gimli", "aragorn",
        "blackbeard", "blackjack", "anne", "mary", "william", "jack", "jill", "robert",
        "michael", "lisa", "susan", "david", "jennifer", "james", "linda", "charles",
        "barbara", "daniel", "elizabeth", "patricia", "sarah", "mark", "karen", "donald",
    ]

    return names[Math.floor(Math.random() * names.length)].concat(sufix);
}

export function generatePassword() {
    const prefixes = [ "a3L$", "b2J%", "c8R#", "d9E@", "e5W!", "f6&P", "g7^Q" ]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let suffix = "";
    for (let i = 0; i < 20; ++i)
        suffix = suffix.concat(characters[Math.floor(Math.random() * characters.length)]);

    return prefix + suffix;
}

export function generatePlayer() {
    let player = {}
    player.username = generateUsername();
    player.email = generateEmail(player.username);
    player.password = generatePassword();

    return player;
}