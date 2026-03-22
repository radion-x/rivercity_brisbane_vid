const fs = require('fs');
const code = fs.readFileSync('test_sm8.js', 'utf8');
const newCode = code.replace('console.log(response.data.substring(0, 1000));', 
`
if (response.data.includes('Your request has been received') || response.data.includes('Thank')) {
    console.log("SUCCESS TEXT FOUND");
} else {
    console.log("FAIL: Form HTML returned without success message. Checking for errors in HTML...");
    const errorMatch = response.data.match(/<div class="[^"]*alert-error[^"]*">(.*?)<\/div>/s);
    if(errorMatch) console.log("Error from SM8:", errorMatch[1]);
}
fs.writeFileSync('sm8_response.html', response.data);
`);
fs.writeFileSync('test_sm82.js', newCode);
