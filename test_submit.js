const axios = require('axios');
const FormData = require('form-data');

async function testSubmit() {
    const formData = new FormData();
    formData.append('uuid', '4f0dc3a9-d9e3-4578-9a92-23e9308c297b');
    formData.append('inputBusinessName', 'Test Business');
    formData.append('inputFirstAndLastName', 'John Tester');
    formData.append('inputEmail', 'test@example.com');
    formData.append('inputPhoneNumber', '0400000000');
    formData.append('inputJobDescription', 'Testing my new form setup');
    // They have address auto-complete, maybe it expects coordinates but let's test straight string
    formData.append('inputAddress', '123 Fake Street, Brisbane, QLD');

    try {
        const result = await axios.post('https://book.servicem8.com/PluginOnlineBooking_SubmitBookingForm', formData, {
            headers: formData.getHeaders()
        });
        console.log("Status:", result.status);
        if (result.data.includes("Thank you")) {
            console.log("Success! Rendered thank you page.");
        } else {
            console.log("Failed. Returned data:", result.data.substring(0, 200));
        }
    } catch (e) {
        console.error(e.message);
    }
}

testSubmit();
