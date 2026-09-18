const BASE_URL = "https://backenddevsyncconnect.dev/api/v1";

async function testBackend() {
    try {
        console.log("1. Creating User A...");
        const aRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "usera@test.com", password: "Password123!" })
        });
        const aData = await aRes.json();
        
        console.log("2. Creating User B...");
        const bRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "userb@test.com", password: "Password123!" })
        });
        const bData = await bRes.json();
        
        console.log("3. Logging in User A...");
        const aLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "usera@test.com", password: "Password123!" })
        });
        const aToken = (await aLoginRes.json()).access_token;
        
        console.log("4. Logging in User B...");
        const bLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: "userb@test.com", password: "Password123!" })
        });
        const bToken = (await bLoginRes.json()).access_token;

        console.log("5. User A sends follow request to User B (id: " + bData.id + ")...");
        const reqRes = await fetch(`${BASE_URL}/requests/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${aToken}`
            },
            body: JSON.stringify({
                to_id: bData.id,
                message: "wants to connect with you",
                role: "follower"
            })
        });
        console.log("Request created:", await reqRes.json());
        
        console.log("6. Fetching User B Dashboard...");
        const dashRes = await fetch(`${BASE_URL}/dashboard/me`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${bToken}`
            }
        });
        
        const data = await dashRes.json();
        console.log("User B Dashboard:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testBackend();
