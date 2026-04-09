// export const URLPIOAPPSOCKET:string = `http://10.0.2.2:5000`
// export const URLPIOAPPSOCKET:string = `http://services.sistemaspinulito.com:5000`

//DEV TUNNEL
export const URLPIOAPPSOCKET:string = process.env.EXPO_PUBLIC_SOCKET_URL as string

//PROD
// export const URLPIOAPPSOCKET:string = `https://services.sistemaspinulito.com`
