<template>

	<!-- Main Sidebar -->
	<component :is="navbarFixed ? 'a-affix' : 'div'" :offset-top="top">

		<!-- Layout Header -->
		<a-layout-header>
			<a-row type="flex">

				<!-- Header Breadcrumbs & Title Column -->
				<a-col :span="24" :md="6">
					<!-- Header Page Title -->
					<div class="ant-page-header-heading">
						<span class="ant-page-header-heading-title">{{ this.$route.name }}</span>
					</div>
					<!-- / Header Page Title -->

				</a-col>
				<!-- Header Control Column -->
				<a-col :span="24" :md="18" class="header-control">


					<a-button @click="signOut" icon="logout" style="z-index: 1000;" type="link">
						Sign out
					</a-button>
					<!-- / Header Control Buttons -->

				</a-col>
				<!-- / Header Control Column -->

			</a-row>
		</a-layout-header>
		<!--  /Layout Header -->

	</component>
	<!-- / Main Sidebar -->

</template>

<script>


const notificationsData = [];
import { AuthenticationService } from "../../services/auth.service";
import router from "../../router";
export default ({
	props: {
		// Header fixed status.
		navbarFixed: {
			type: Boolean,
			default: false,
		},

		// Sidebar collapsed status.
		sidebarCollapsed: {
			type: Boolean,
			default: false,
		},

		// Header notifications data.
		notificationsData: {
			type: Array,
			default: () => notificationsData,
		},
	},
	data() {
		return {
			// Fixed header/sidebar-footer ( Affix component ) top offset.
			top: 0,

			// Search input loading status.
			searchLoading: false,

			// The wrapper element to attach dropdowns to.
			wrapper: document.body,
		}
	},
	methods: {

		signOut() {
			AuthenticationService.logout();
			router.push("/sign-in");
		},

		onSearch(value) {
		}
	},
	mounted: function () {
		// Set the wrapper to the proper element, layout wrapper.
		this.wrapper = document.getElementById('layout-dashboard');
	},
	created() {
		// Registering window resize event listener to fix affix elements size
		// error while resizing.
		window.addEventListener("resize", this.resizeEventHandler);
	},
	destroyed() {
		// Removing window resize event listener.
		window.removeEventListener("resize", this.resizeEventHandler);
	},
})

</script>
