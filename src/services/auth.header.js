import { AuthenticationService } from './auth.service';


export const requestOptions = {
    /// This where we put the security tokens and other header if needed
    header(){
        return {
            ...headers() 
        }
    }
}

 function  headers() {
    let _currentTokens = AuthenticationService.currentTokensValue || {};
    const authHeader = _currentTokens.accessToken ? { 'Authorization': 'Bearer ' + _currentTokens.accessToken } : {}

    return {
        headers: {
            ...authHeader,
            'Content-Type': 'application/json'
        }
    }
}

// Optional helper to check if token has expired
function tokenExpired(token) {
    const payload = atob(token.split('.')[1]);
    console.log(payload.exp < Date.now() / 1000);
    return payload.exp < Date.now() / 1000;
  }