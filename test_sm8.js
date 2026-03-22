const axios = require('axios');

async function testForm() {
    const formData = new URLSearchParams();
    // Use the actual UUID to see if their server accepts it.
    formData.append('uuid', '4f0dc3a9-d9e3-4578-9a92-23e9308c297b');
    formData.append('inputBusinessName', 'Test Biz');
    formData.append('inputContactName', 'Jenny Test');
    formData.append('inputEmail', 'jenny@example.com');
    formData.append('inputPhoneNumber', '0400000000');
    formData.append('inputAddress', '123 Test St');
    formData.append('inputJobDescription', 'Test job please ignore');
    formData.append('inputBookingRoute', 'inbox');
    formData.append('inputVendorInboxAddress', '49e89f@inbox.servicem8.com');

    try {
        console.log("Sending...");
        const response = await axios.post('https://book.servicem8.com/PluginOnlineBooking_SubmitBookingForm', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            validateStatus: () => true
        });
        
        console.log("Status:", response.status);
        console.log("Response snippet:");
        console.log(response.data.substring(0, 1000));
        
        if (response.data.includes("Thank you") || response.status === 302) {
            console.log("Looks like it went through!");
        } else {
            console.log("Might have failed val.");
        }
    } catch (e) {
        console.error(e.message);
    }
}
testForm();
