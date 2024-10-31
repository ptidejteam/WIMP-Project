<template>

	<!-- Layout Header ( Navbar ) -->
	<a-layout-header>
		<div class="header-col header-brand">
			<div style="    
					display: flex;
    				align-items: center;
				">
				<img src="images/logo.svg" alt="logo"  style="width: 3rem;"/>
				<h6>WIMP System</h6>

			</div>


		</div>
	</a-layout-header>
	<!-- / Layout Header ( Navbar ) -->

</template>

<script>

export default ({
	data() {
		return {
			// Collapse navigation value.
			// Binded model property for "Collapsible Navigation Menu" collapsed status .
			collapseNav: 0,
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