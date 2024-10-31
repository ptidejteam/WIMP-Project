import { AuthenticationService } from '../services/auth.service';
import router from '../router'; // Adjust the path according to your project structure


export function handleErrorResponse(error) {   

                if (error && error.response &&  [401,403].indexOf(error.response?.status) !== -1) {
                        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                        AuthenticationService.logout();
                        router.push("/sign-in")
                }else { 
                    //const error = (error && error.response.message) || ( error.response&& error.response.status);
                    return Promise.reject(error);
                }

}