import {useState, useEffect} from "react";

const useLocalStorage = (key: string, defaultValue: string | boolean | number) => {
    const [value, setValue] = useState(() => {
        let currentValue;

        try {
            if (key.indexOf(".") > -1) {
                const keys = key.split(".");
                currentValue = JSON.parse(
                    localStorage.getItem(keys[0]) || String(defaultValue)
                )[keys[1]];
            } else {
                currentValue = JSON.parse(
                    localStorage.getItem(key) || String(defaultValue)
                );
            }
        } catch (error) {
            console.error("Error parsing localStorage value:", error);
            currentValue = defaultValue;
        }

        return currentValue;
    });

    useEffect(() => {
        if (key.indexOf(".") > -1) {
            const keys = key.split(".");

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (localStorage.getItem(keys[0]) && typeof JSON.parse(localStorage.getItem(keys[0])) === 'object') {
                localStorage.setItem(keys[0], JSON.stringify({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    ...JSON.parse(localStorage.getItem(keys[0])),
                    [keys[1]]: value
                }));
            } else {
                localStorage.setItem(keys[0], JSON.stringify({[keys[1]]: value}));
            }
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [value, key]);

    return [value, setValue];
};

export default useLocalStorage;
