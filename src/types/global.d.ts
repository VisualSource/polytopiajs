declare namespace Auth0{
    interface Auth0Profile{
        name: string;
        email: string;
        picture: string; 
        user_id: string;
        nickname: string;
    }
    interface Auth0ProviderOptions{
        domain: string;
        client_id: string;
        redirect_uri?: string;
        onRedirectcallback?: Function;
    }
}

