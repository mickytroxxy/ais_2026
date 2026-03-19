import { useState } from 'react'
const useForm = () => {
    const [values,setValues] = useState({});
    return {
        values,
        handleFormChange: (field,value) => {
          setValues(v =>({
            ...v,
            [field]: value,
          }));
        }
    };
}
export default useForm;