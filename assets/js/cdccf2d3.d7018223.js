"use strict";(self.webpackChunkexamples_classic=self.webpackChunkexamples_classic||[]).push([[325],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>m});var n=a(7294);function s(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){s(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,s=function(e,t){if(null==e)return{};var a,n,s={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(s[a]=e[a]);return s}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(s[a]=e[a])}return s}var l=n.createContext({}),c=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},d=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,s=e.mdxType,r=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=c(a),m=s,b=u["".concat(l,".").concat(m)]||u[m]||p[m]||r;return a?n.createElement(b,i(i({ref:t},d),{},{components:a})):n.createElement(b,i({ref:t},d))}));function m(e,t){var a=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var r=a.length,i=new Array(r);i[0]=u;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:s,i[1]=o;for(var c=2;c<r;c++)i[c]=a[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},7759:(e,t,a)=>{a.r(t),a.d(t,{contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>o,toc:()=>l});var n=a(7462),s=(a(7294),a(3905));const r={sidebar_position:4},i="Front-Backend",o={unversionedId:"backend/front-backend",id:"backend/front-backend",isDocsHomePage:!1,title:"Front-Backend",description:"As seen in back-backend#recieve-request the server transforms data received from Node-RED into displayable data (color, text).",source:"@site/docs/backend/front-backend.md",sourceDirName:"backend",slug:"/backend/front-backend",permalink:"/wimp-wiki/docs/backend/front-backend",editUrl:"https://github.com/facebook/docusaurus/edit/main/website/docs/backend/front-backend.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Back-Backend",permalink:"/wimp-wiki/docs/backend/back-backend"},next:{title:"Deployment Guide",permalink:"/wimp-wiki/docs/deploy/deploy"}},l=[{value:"Needs",id:"needs",children:[{value:"Be able to match a specific message to a certain state",id:"be-able-to-match-a-specific-message-to-a-certain-state",children:[]},{value:"Be able to manage the visibility of the messages according to the students",id:"be-able-to-manage-the-visibility-of-the-messages-according-to-the-students",children:[]},{value:"Be able to deactivate its presence on the site",id:"be-able-to-deactivate-its-presence-on-the-site",children:[]}]},{value:"Login &amp; Security",id:"login--security",children:[]},{value:"?",id:"",children:[]}],c={toc:l};function d(e){let{components:t,...r}=e;return(0,s.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"front-backend"},"Front-Backend"),(0,s.kt)("p",null,"As seen in ",(0,s.kt)("a",{href:"./back-backend#recieve-request"},"back-backend#recieve-request")," the server transforms data received from Node-RED into displayable data (color, text).\nTo do this the server matches the raw data to the sentence and color that the teacher has chosen. "),(0,s.kt)("p",null,(0,s.kt)("em",{parentName:"p"},"Example :")," ",(0,s.kt)("br",null),"\nNode-RED side ","\u2192"," ",(0,s.kt)("em",{parentName:"p"},"When my plug is connected I generate the availability status ",(0,s.kt)("strong",{parentName:"em"},"1")),(0,s.kt)("br",null),"\nExpress side ","\u2192"," ",(0,s.kt)("em",{parentName:"p"},"For me the state 1 corresponds to ",(0,s.kt)("strong",{parentName:"em"},'"I am available"')," in ",(0,s.kt)("strong",{parentName:"em"},"green"))),(0,s.kt)("p",null,"However, to do this, Express must retrieve its own information from a database, its why the front-backend (graphical interface) is necessary to allow teachers to modify their messages, add states, change the color of some messages etc."),(0,s.kt)("h2",{id:"needs"},"Needs"),(0,s.kt)("p",null,"After discussion we have identified 3 needs:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"To be able to match a specific state (from node-red) to a certain message "),(0,s.kt)("li",{parentName:"ul"},"To be able to manage the visibility of the messages according to the students level/role"),(0,s.kt)("li",{parentName:"ul"},'To be able to disabled its presence on the site (to be in an "Disconnected" message no matter what information the devices sent)')),(0,s.kt)("h3",{id:"be-able-to-match-a-specific-message-to-a-certain-state"},"Be able to match a specific message to a certain state"),(0,s.kt)("p",null,"Chaque etat brute renvoy\xe9 par Node-RED doit avoir un corespondance propre constitu\xe9 d'un message et d'une coleur d'affichage"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-json"},'// database/staff.json\n"id professeur": {\n    ...\n    "states": {\n        "1": {\n            "msg": "in his office but busy",\n            "color": "orange",\n        },\n        ...\n    }\n} \n')),(0,s.kt)("p",null,"On the site :\n",(0,s.kt)("img",{alt:"alt text",src:a(18).Z})),(0,s.kt)("h3",{id:"be-able-to-manage-the-visibility-of-the-messages-according-to-the-students"},"Be able to manage the visibility of the messages according to the students"),(0,s.kt)("p",null,"Every teacher to want to limit some message only to the 'researcher' for example. To do this a chmaps has been added to filter this. If a grade is set to false then that grade will see a default message instead of the true message."),(0,s.kt)("p",null,"this default message is related to the colors, if the color of the real message is red it must mean that the teacher is not available. The real message will be ",(0,s.kt)("em",{parentName:"p"},"'In meeting with the director'")," in red, the default message will then be the one in the field ",(0,s.kt)("inlineCode",{parentName:"p"},'"unavailable":')," which could be ",(0,s.kt)("em",{parentName:"p"},"'not available'"),"."),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-json"},'// database/staff.json\n"id professeur": {\n    ...\n    "states": {\n        "1": {\n            "msg": "in his office but busy",\n            "color": "orange",\n            "visibility": { // <--- \n                "student": false,\n                "researcher": true,\n                "colleague": true\n            }\n        },\n        ...\n    },\n\n    "default": { // <--- \n            "available": "I\'m available !",\n            "busy": "I\'m busy !",\n            "unavailable": "I\'m unavailable !"\n    }\n}\n\n')),(0,s.kt)("p",null,"On the site :\n",(0,s.kt)("img",{alt:"alt text",src:a(9963).Z}),"\n",(0,s.kt)("img",{alt:"alt text",src:a(4748).Z})),(0,s.kt)("h3",{id:"be-able-to-deactivate-its-presence-on-the-site"},"Be able to deactivate its presence on the site"),(0,s.kt)("p",null,'It should also be possible to completely deactivate everything in order to be "untracked". For this purpose a field ',(0,s.kt)("inlineCode",{parentName:"p"},'"tracking":')," has been set up "),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-json"},'// database/staff.json\n"id professeur": {\n    ...\n    "states": {\n        "1": {\n            "msg": "in his office but busy",\n            "color": "orange",\n            "visibility": { \n                "student": false,\n                "researcher": true,\n                "colleague": true\n            }\n        },\n        ...\n    },\n\n    "default": {  \n            "available": "I\'m available !",\n            "busy": "I\'m busy !",\n            "unavailable": "I\'m unavailable !"\n    },\n    "tracking": "ON" // <---\n}\n')),(0,s.kt)("p",null,"On the site :\n",(0,s.kt)("img",{alt:"alt text",src:a(9703).Z})),(0,s.kt)("h2",{id:"login--security"},"Login & Security"),(0,s.kt)("p",null,"A login/password system has been set up to secure the data."),(0,s.kt)("p",null,"This connection using passport.js and the POST request done ine /static/login/login.js are almost the same that in ",(0,s.kt)("a",{href:"../frontend/frontend#security"},"frontend#security")," "),(0,s.kt)("p",null,"the database storing the login/password in ",(0,s.kt)("inlineCode",{parentName:"p"},"/database/db_acc.json"),"\nand looks like :"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "id professeur 1 (username)" : "5868",\n    "id professeur 2" : "5868",\n    ...\n}\n')),(0,s.kt)("h2",{id:""},"?"),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"}," Why no registration pages? "),"\nbecause the professor are theorically already in the concordia database."))}d.isMDXComponent=!0},4748:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/default-03fdb57a4d7cf929878007e7dc780b7a.png"},18:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/input1-d7f41a7f2ceaa0d3ffbdfbb36b7f48b2.png"},9963:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/input2-b9ac6861874a8eb9d9e041febc135aca.png"},9703:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/tracker-41ef7570183f3f1bd3b2b85a72f94819.png"}}]);