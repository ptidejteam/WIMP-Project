<template>

	<!-- Layout Footer -->
	<a-layout-footer>

		<!-- Copyright Notice -->
		<p class="copyright">
			WIMP - Copyright © {{new Date().getFullYear()}} <a href="https://www.ptidej.net/">Ptidej Team</a>.
		</p>
		<!-- / Copyright Notice -->

	</a-layout-footer>
	<!-- / Layout Footer -->

</template>

<script>

	export default ({
		data() {
			return {
			}
		},
	})

</script>

<style lang="scss" scoped>

	.nav-link svg {
		margin-right: 5px;
		vertical-align: middle;
	}
	.nav-link span {
		vertical-align: middle;
	}
	.ant-menu-submenu-popup {
		width: 100%;
	}

</style>