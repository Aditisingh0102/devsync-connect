const BASE_URL = "https://backenddevsyncconnect.dev/api/v1";

async function testBackend() {
    try {
        console.log("2. Logging in as admin...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "admin", password: "Password123!" })
        });
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        if (!token) {
            console.log("Could not log in as admin", loginData);
            return;
        }

        console.log("3. Fetching dashboard...");
        const dashRes = await fetch(`${BASE_URL}/dashboard/me`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await dashRes.json();
        console.log("Incoming Requests:", data.incoming_requests);
    } catch (e) {
        console.error(e);
    }
}

testBackend();
