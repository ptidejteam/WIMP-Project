import Vue from 'vue'
import VueRouter from 'vue-router'
import { AuthenticationService } from "../services/auth.service";
import { Role } from "@/helpers/roles";

Vue.use(VueRouter)

let routes = [
	{
		// will match everything
		path: '*',
		component: () => import('../views/404.vue'),
	},
	{
		path: '/',
		redirect: '/Me',
		meta: {
			// layoutClass: 'layout-profile',
			authorize: [Role.Surfer]
		},
	},
	{
		path: '/dashboard',
		name: 'Dashboard',
		layout: "dashboard",
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
	},
	{
		path: '/layout',
		name: 'Layout',
		layout: "dashboard",
		component: () => import('../views/Layout.vue'),
	},
	{
		path: '/tables',
		name: 'Tables',
		layout: "dashboard",
		meta: {
			// layoutClass: 'layout-profile',
			// authorize: [Role.Master]
		},
		component: () => import('../views/Tables.vue'),
	},
	{
		path: '/billing',
		name: 'Billing',
		layout: "dashboard",
		component: () => import('../views/Billing.vue'),
	},
	{
		path: '/rtl',
		name: 'RTL',
		layout: "dashboard-rtl",
		meta: {
			layoutClass: 'dashboard-rtl',
		},
		component: () => import('../views/RTL.vue'),
	},
	{
		path: '/Me',
		name: 'Me',
		layout: "dashboard",
		meta: {
			// layoutClass: 'layout-profile',
			authorize: [Role.Surfer]
		},
		component: () => import('../views/Profile.vue'),
	},
	{
		path: '/sign-in',
		name: 'Sign-In',
		component: () => import('../views/Sign-In.vue'),
	},
	{
		path: '/sign-up',
		name: 'Sign-Up',
		meta: {
			layoutClass: 'layout-sign-up',
		},
		component: () => import('../views/Sign-Up.vue'),
	},
	{
		path: '/calendar',
		name: 'Calendar',
		component: () => import('../views/Calendar.vue'),
	},
]

// Adding layout property from each route to the meta
// object so it can be accessed later.
function addLayoutToRoute( route, parentLayout = "default" )
{
	route.meta = route.meta || {} ;
	route.meta.layout = route.layout || null ;
	
	if( route.children )
	{
		route.children = route.children.map( ( childRoute ) => addLayoutToRoute( childRoute, route.meta.layout ) ) ;
	}
	return route ;
}

routes = routes.map( ( route ) => addLayoutToRoute( route ) ) ;



const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
	scrollBehavior (to, from, savedPosition) {
		if ( to.hash ) {
			return {
				selector: to.hash,
				behavior: 'smooth',
			}
		}
		return {
			x: 0,
			y: 0,
			behavior: 'smooth',
		}
	}
})


router.beforeEach((to, from, next) => {
	const { authorize } = to.meta;
	const currentUser = AuthenticationService.currentUserValue;
	const currentTokens = AuthenticationService.currentTokensValue;
  
	if (authorize) {
	  if (!currentUser && !currentTokens) {
		// Not logged in, redirect to sign-in page with return URL
		return next({ path: '/sign-in', query: { returnUrl: to.path } });
	  }

	}
  
	// Proceed to next route
	next();
  });
  
  
export default router
