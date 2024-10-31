<template>
	<div class="sign-in">
	  <a-row type="flex" :gutter="[24, 24]" justify="space-around" align="middle">
		<!-- Sign In Form Column -->
		<a-col :span="24" :md="12" :lg="{ span: 12, offset: 0 }" :xl="{ span: 6, offset: 2 }" class="col-form">
		  <h1 class="mb-15">Sign In</h1>
		  <h5 class="font-regular text-muted">Enter your Username and password to sign in</h5>
  
		  <!-- Sign In Form -->
		  <a-form id="components-form-demo-normal-login" :form="form" class="login-form" @submit="handleSubmit"
			:hideRequiredMark="true">
			<a-form-item class="mb-10" label="Username" :colon="false">
			  <a-input v-decorator="[ 'username', { rules: [{ required: true, message: 'Please input your username!' }] } ]" 
			  placeholder="User Name" />
			</a-form-item>
  
			<a-form-item class="mb-5" label="Password" :colon="false">
			  <a-input v-decorator="[ 'password', { rules: [{ required: true, message: 'Please input your password!' }] } ]" 
			  type="password" placeholder="Password" />
			</a-form-item>
  
			<a-form-item>
			  <a-button type="primary" block html-type="submit" class="login-form-button" :loading="loading">
				SIGN IN
			  </a-button>
			</a-form-item>
		  </a-form>
		  <!-- / Sign In Form -->
  
		  <p class="font-semibold text-muted">Don't have an account? <router-link to="/sign-up" class="font-bold text-dark">Sign Up</router-link></p>
		</a-col>
  
		<!-- Sign In Image Column -->
		<a-col :span="24" :md="12" :lg="12" :xl="12" class="col-img">
		  <img src="images/6846415.jpg" alt="">
		</a-col>
		<!-- / Sign In Image Column -->
	  </a-row>
	</div>
  </template>
  
  <script>
  import { AuthenticationService } from "../services/auth.service";
  import router from "../router";
  
  export default {
	data() {
	  return {
		rememberMe: true, // Model property for the "Remember Me" switch
		loading: false,   // To handle loading state during login
		message: ''       // To store any error message from the login attempt
	  };
	},
	beforeCreate() {
	  // Creates the form and adds to it component's "form" property.
	  this.form = this.$form.createForm(this, { name: 'normal_login' });
	},
	methods: {
	  handleSubmit(e) {
		e.preventDefault();
  
		this.form.validateFields((err, values) => {
		  if (!err) {
			this.loading = true; // Start loading indicator
			console.log(values);
			AuthenticationService.login(values)
			  .then(() => {
				this.loading = false; // Stop loading indicator
				router.push("/"); // Redirect to dashboard after successful login
			  })
			  .catch((error) => {
				this.loading = false; // Stop loading if there's an error
				this.message = (error.response && error.response.data) || error.message; // Handle error message
			  });
		  }
		});
	  },
	}
  };
  </script>
  
  <style lang="scss">
  body {
	background-color: #ffffff;
  }
  </style>
  