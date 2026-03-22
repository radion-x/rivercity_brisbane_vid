const axios = require('axios');

async function test() {
    const auth = Buffer.from('koskhavin@gmail.com:smk-f8bae9-1c542ec7189dbd27-71558d51bf26d2d8').toString('base64');
    try {
        const response = await axios.get('https://api.servicem8.com/api_1.0/company.json', {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log("Success Basic! Companies count:", response.data.length);
    } catch (err) {
        console.log("Basic Auth failed:", err.response ? err.response.data : err.message);
        
        try {
            console.log("Trying Bearer instead...");
            const bearerResponse = await axios.get('https://api.servicem8.com/api_1.0/company.json', {
                headers: { 'Authorization': `Bearer smk-f8bae9-1c542ec7189dbd27-71558d51bf26d2d8` }
            });
            console.log("Bearer Success!: ", bearerResponse.data.length);
        } catch (err2) {
            console.log("Bearer failed: ", err2.response ? err2.response.data : err2.message);
        }
    }
}
test();
