export const msalConfig = {
    auth: {
      clientId: "5461b675-7d26-4b1b-8873-c94542ddf8d3", // Replace with your Azure AD app's client ID
      authority: "https://login.microsoftonline.com/8e258230-2db4-4f0d-8a38-c38c7f2fb6a1", // Or use tenant ID
      // redirectUri: "http://localhost:3000/", // Match this with Azure App Registration
      // redirectUri: "http://192.168.2.8:667/", // Match this with Azure App Registration
       redirectUri: "https://load-sheet-xi.vercel.app/", // Match this with Azure App Registration
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };

  
export const loginRequest = {
    scopes: ['User.Read'], // Add scopes for your app
  };
  
  