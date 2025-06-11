import {Button} from "@mui/material";
import React from "react";
import {useFormikContext} from "formik";

export default function FormikSaveButton(){
    const formik = useFormikContext();

    return (
        <Button size="small" variant="contained" type="submit" disabled={!formik.dirty}>Salva</Button>
    )
};
