const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch("https://backenddevsyncconnect.dev/api/v1/users/me");
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
