import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, exchangeCodeAsync } from 'expo-auth-session';
import { URLPIOAPP } from '../http/ajax'; // Or adjust path as needed depending on where this is placed
import * as Linking from 'expo-linking';

console.log("Linking.createURL('auth')", Linking.createURL('auth'));

// Permite a AuthSession saber si el navegador se abrió para terminar la sesión
WebBrowser.maybeCompleteAuthSession();

// Reemplazar después con los verdaderos obtenidos de Azure AD
const CLIENT_ID = process.env.EXPO_PUBLIC_MS_CLIENT_ID || 'PENDING_CLIENT_ID';
const TENANT_ID = process.env.EXPO_PUBLIC_MS_TENANT_ID || 'common'; // Or 'YOUR_TENANT_ID'

// Endpoint de descubrimiento de Microsoft (V2)
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
};

export const useMicrosoftAuth = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'pioapp',
    path: 'auth',
  });

  // Definir la solicitud de Autenticación
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
      redirectUri,
      extraParams: {
        prompt: 'select_account',
      },
    },
    discovery
  );

  const exchangeCodeForToken = async (code: string) => {
    try {
      const tokenResult = await exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code,
          redirectUri,
          extraParams: request?.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
        },
        discovery
      );
      return tokenResult.accessToken;
    } catch (error) {
      console.error('Error exchanging MS code for token', error);
      return null;
    }
  };

  const getMicrosoftUserInfo = async (accessToken: string) => {
    try {
      const res = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching MS Graph', error);
      return null;
    }
  };

  return {
    request,
    response,
    promptAsync,
    getMicrosoftUserInfo,
    exchangeCodeForToken,
  };
};
