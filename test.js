// Functionality: Handles a login form submission, sends credentials via fetch to a server endpoint, and processes the response.

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Retrieve user inputs from the form
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    try {
        // Send credentials to the server via a POST request
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }) // Convert to JSON format
        });

        const result = await response.json(); // Parse the server's response

        if (response.ok) {
            // If login is successful, redirect to the dashboard
            document.cookie = `authToken=${result.accessToken}; path=/; secure`;
            window.location.href = "/dashboard";
        } else {
            // If login fails, display an error message
            alert(result.error || "Login failed. Please try again.");
        }
    } catch (error) {
        // Handle network or other unexpected errors
        alert("An error occurred. Please check your connection and try again.");
        console.error(error);
    }
});
