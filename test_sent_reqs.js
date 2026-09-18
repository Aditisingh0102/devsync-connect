const BASE_URL = "https://backenddevsyncconnect.dev/api/v1";

async function testBackend() {
    try {
        console.log("1. Logging in as testuser_cors_1234...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "testuser_cors_1234@gmail.com", password: "Password123!" })
        });
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        if (!token) return console.log("Login failed", loginData);

        console.log("2. Fetching sent requests...");
        const reqRes = await fetch(`${BASE_URL}/requests/sent`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await reqRes.json();
        console.log("Sent Requests:", data);
    } catch (e) {
        console.error(e);
    }
}

testBackend();
