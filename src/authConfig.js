export const msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID, // Replace with your Azure AD app's client ID
      authority: "https://login.microsoftonline.com/8e258230-2db4-4f0d-8a38-c38c7f2fb6a1", // Or use tenant ID
      redirectUri: "http://localhost:3000/", // Match this with Azure App Registration
      // redirectUri: "https://maxdemo.maxworth.in/", // Match this with Azure App Registration
      //  redirectUri: "https://load-sheet-xi.vercel.app/", // Match this with Azure App Registration
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };

  
export const loginRequest = {
    scopes: ['User.Read'], // Add scopes for your app
  };
  
  