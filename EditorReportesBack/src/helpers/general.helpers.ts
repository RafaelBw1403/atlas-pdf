

export const isLocalMode = () => {

    if (process.env.PROJECT_MODE === 'local' || !process.env.PROJECT_MODE) {
        return true;
    }

    return false;
}