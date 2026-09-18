const BASE_URL = "https://backenddevsyncconnect.dev/api/v1";

async function testBackend() {
    try {
        console.log("2. Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "testuser_cors_1234@gmail.com", password: "Password123!" })
        });
        const loginData = await loginRes.json();
        console.log("Login data:", loginData);
        const token = loginData.access_token;
        console.log("Token received:", !!token);

        console.log("3. Sending Follow Request...");
        const reqRes = await fetch(`${BASE_URL}/requests/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                to_id: 1,
                message: "wants to connect with you",
                role: "follower"
            })
        });
        console.log("Request status:", reqRes.status);
        console.log("Request headers:", Object.fromEntries(reqRes.headers.entries()));
        
        const text = await reqRes.text();
        console.log("Request body:", text);
    } catch (e) {
        console.error(e);
    }
}

testBackend();
