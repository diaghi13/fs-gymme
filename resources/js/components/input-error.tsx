import { Typography, TypographyProps } from '@mui/material';

interface InputErrorProps extends Omit<TypographyProps, 'message'> {
    message?: string;
}

export default function InputError({ message, ...props }: InputErrorProps) {
    return message ? (
        <Typography
            variant="body2"
            color="error"
            {...props}
        >
            {message}
        </Typography>
    ) : null;
}
