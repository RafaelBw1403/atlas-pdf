export const isLocalMode = () => {
    const mode = import.meta.env.VITE_PROJECT_MODE;
    return !mode || mode === 'local';
};
