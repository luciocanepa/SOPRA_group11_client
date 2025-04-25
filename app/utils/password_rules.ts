export const passwordRules = [
    { required: true, message: "Please input your password!" },
    { min: 8, message: "Password must be at least 8 characters long!" },
    {
        pattern: /[A-Z]/,
        message: "Password must contain at least one uppercase letter!",
    },
    {
        pattern: /[a-z]/,
        message: "Password must contain at least one lowercase letter!",
    },
    {
        pattern: /\d/,
        message: "Password must contain at least one number!",
    },
    {
        pattern: /[^A-Za-z0-9]/,
        message: "Password must contain at least one special character!",
    },
]