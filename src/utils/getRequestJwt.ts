export const getRequestJwt = () => new URLSearchParams(window.location.search).get('jwt');
