<template>
	<a-result status="success" title="Calendar Connected" sub-title="Your Google Calendar is now connected. You may close this window.">
		<template #extra>
			<a-button type="primary" @click="saveTokenAndClose">Close</a-button>
		</template>
	</a-result>
</template>

<script>
import { userService } from '../services/user.service'; // Adjust the import path as needed
import { AuthenticationService } from '../services/auth.service';
export default {
	mounted() {
		// Extract the token and expiration time from the URL when the component is mounted
		const hash = window.location.hash;
		if (hash) {
			const params = new URLSearchParams(hash.substring(1));
            
			const accessToken = params.get('access_token');
			const expiresIn = params.get('expires_in'); // Extract expires_in

			if (accessToken) {
				this.googleAccessToken = accessToken;
			}

			if (expiresIn) {
				this.tokenExpirationTime = Date.now() + parseInt(expiresIn)*1000; // Store the expiration time
			}
		}
	},
	data() {
		return {
			googleAccessToken: null, // To store the access token
			tokenExpirationTime: null, // To store the expiration time
		};
	},
	methods: {
		async saveTokenAndClose() {
			if (this.googleAccessToken) {
				// Prepare the payload
				const payload = {
					googleAccessToken: this.googleAccessToken,
					googleAccessTokenExpiry: this.tokenExpirationTime,
				};
				const id = AuthenticationService.currentUserValue["userId"];
				try {
					// Send the token to the backend using userService
					await userService.putUser(id,payload); // Assuming `create` is the appropriate method for your API

					// Save the access token and expiration time to local storage
					localStorage.setItem('googleAccessToken', this.googleAccessToken);
					localStorage.setItem('tokenExpirationTime', this.tokenExpirationTime); // Save expiration time
					this.$message.info("Access token saved successfully.");
				} catch (error) {
					console.error("Error sending token to the backend:", error);
					this.$message.error("Failed to send access token to the backend.");
				}
			} else {
				this.$message.error("No access token found.");
			}
			// Close the current window
			setTimeout(() => { 
				window.close();

			},300);
		},
	},
};
</script>
