"use strict";(self.webpackChunkexamples_classic=self.webpackChunkexamples_classic||[]).push([[671],{3905:(e,t,o)=>{o.d(t,{Zo:()=>p,kt:()=>m});var r=o(7294);function n(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}function a(e,t){var o=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),o.push.apply(o,r)}return o}function i(e){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?a(Object(o),!0).forEach((function(t){n(e,t,o[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):a(Object(o)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(o,t))}))}return e}function s(e,t){if(null==e)return{};var o,r,n=function(e,t){if(null==e)return{};var o,r,n={},a=Object.keys(e);for(r=0;r<a.length;r++)o=a[r],t.indexOf(o)>=0||(n[o]=e[o]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)o=a[r],t.indexOf(o)>=0||Object.prototype.propertyIsEnumerable.call(e,o)&&(n[o]=e[o])}return n}var c=r.createContext({}),l=function(e){var t=r.useContext(c),o=t;return e&&(o="function"==typeof e?e(t):i(i({},t),e)),o},p=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var o=e.components,n=e.mdxType,a=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),h=l(o),m=n,d=h["".concat(c,".").concat(m)]||h[m]||u[m]||a;return o?r.createElement(d,i(i({ref:t},p),{},{components:o})):r.createElement(d,i({ref:t},p))}));function m(e,t){var o=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=o.length,i=new Array(a);i[0]=h;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:n,i[1]=s;for(var l=2;l<a;l++)i[l]=o[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,o)}h.displayName="MDXCreateElement"},9881:(e,t,o)=>{o.r(t),o.d(t,{contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var r=o(7462),n=(o(7294),o(3905));const a={sidebar_position:1},i="Introduction",s={unversionedId:"intro",id:"intro",isDocsHomePage:!1,title:"Introduction",description:'The WIMP project for "Where Is My Professor?" is an IoT project/proof of concept that allows the students to get their teachers availability in real time. The goal is to gather a set of IoT devices giving various information on the building, location, etc. of teachers working in Concordia. Then, after processing the data collected, the system can tell in an automated way if a teacher is available or not.',source:"@site/docs/intro.md",sourceDirName:".",slug:"/intro",permalink:"/wimp-wiki/docs/intro",editUrl:"https://github.com/facebook/docusaurus/edit/main/website/docs/intro.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",next:{title:"Architecture",permalink:"/wimp-wiki/docs/architecture"}},c=[{value:"Technologies",id:"technologies",children:[]},{value:"Main contributors",id:"main-contributors",children:[]}],l={toc:c};function p(e){let{components:t,...o}=e;return(0,n.kt)("wrapper",(0,r.Z)({},l,o,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"introduction"},"Introduction"),(0,n.kt)("p",null,'The WIMP project for "Where Is My Professor?" is an IoT project/proof of concept that allows the students to get their teachers availability in real time. The goal is to gather a set of IoT devices giving various information on the building, location, etc. of teachers working in Concordia. Then, after processing the data collected, the system can tell in an automated way if a teacher is available or not. '),(0,n.kt)("p",null,"This proof of concept shows the possibility of taking the smart-home concept to a higher scale with more devices, role systems, profiles etc. The goal of this project is also to offer a functional IoT system to the researchers of the lab for the experiments."),(0,n.kt)("h2",{id:"technologies"},"Technologies"),(0,n.kt)("p",null,"Here are some information about the technologies used in the WIMP project."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Node-Red")),(0,n.kt)("blockquote",null,(0,n.kt)("p",{parentName:"blockquote"},"Javascript technology allowing to manage iot devices thanks to a system of nodes and flows. This system of nodes allows to make treatment more simple than with javascript code directly. This allows neofit in programming (like many teachers) to use WIMP. Moreover, it is very easy to create its own nodes in javascript which is very useful for advanced users. ",(0,n.kt)("a",{parentName:"p",href:"https://nodered.org/"},"More information about Node-RED"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Express")),(0,n.kt)("blockquote",null,(0,n.kt)("p",{parentName:"blockquote"},"Express.js is a framework for building web applications based on Node.js. It is in fact the standard framework for server development in Node.js. Since Node-RED is also a .js technology it integrates well with Express.js. Indeed, Express.js can embed a Node-RED server to use it as an API. ",(0,n.kt)("a",{parentName:"p",href:"https://expressjs.com/fr/"},"More information about Express"))),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Other")),(0,n.kt)("blockquote",null,(0,n.kt)("p",{parentName:"blockquote"},"Other technologies less important because they are easily replaceable by others ones have been used such as ",(0,n.kt)("a",{parentName:"p",href:"https://www.passportjs.org/"},"Passport.js")," for security or ",(0,n.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/simple-json-db"},"simple-json-db")," for database management. They have been chosen due to their simplicity, and the fact that they are very often used by programmers.")),(0,n.kt)("h2",{id:"main-contributors"},"Main contributors"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Yann-Ga\xebl Gu\xe9h\xe9neuc"),(0,n.kt)("li",{parentName:"ul"},"Timoth\xe9 Verstraete"),(0,n.kt)("li",{parentName:"ul"},"Eloi Menaud"),(0,n.kt)("li",{parentName:"ul"},"...")))}p.isMDXComponent=!0}}]);